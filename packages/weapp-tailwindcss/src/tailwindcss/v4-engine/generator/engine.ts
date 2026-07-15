import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from '../types'
import { createTailwindV4Engine as createEngineTailwindV4Engine, extractRawCandidates } from '@tailwindcss-mangle/engine'
import { omitUndefined } from '@/utils/object'
import { resolveCssMacroTailwindV4Source } from '../css-macro-source'
import { transformTailwindV4CssByTarget } from '../miniprogram'
import { createCompatibleSource } from './css-compat'
import { collectCandidates, createIncrementalGenerateCacheKey, createIncrementalStyleOptions, hasRemovedCandidates, incrementalGenerateCache, mergeCustomPropertyValues, normalizeTargetRpxLengthCandidates, resolveGeneratedSourcePatterns, resolveStyleOptions, resolveTargetCandidates, runIncrementalGenerateTask, seedIncrementalGenerateCache, shouldDelegateWebSourceScanToTailwind, shouldRebuildIncrementalEntry } from './incremental-cache'
import { restoreRpxLengthCandidates, restoreRpxLengthCssSelectors } from './rpx-candidates'
import { resolveScanSources } from './scan-sources'

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generateOnce(
    generateSource: TailwindV4ResolvedSource,
    options: TailwindV4GenerateOptions = {},
  ) {
    const {
      scanSources = true,
      styleOptions,
      target = 'weapp',
      ...patchOptions
    } = options
    const resolvedStyleOptions = resolveStyleOptions(generateSource, styleOptions)
    const cssMacroSource = resolveCssMacroTailwindV4Source(generateSource)
    const compatibleSource = createCompatibleSource(cssMacroSource, target)
    const engine = createEngineTailwindV4Engine(compatibleSource)
    const resolvedScanSources = await resolveScanSources(generateSource, scanSources)
    const delegateSourceScan = shouldDelegateWebSourceScanToTailwind(target, resolvedScanSources)
    const filesystemCandidates = !delegateSourceScan && Array.isArray(resolvedScanSources)
      ? new Set(await extractRawCandidates(resolvedScanSources, {
          ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
        }))
      : undefined
    const resolvedCandidates = resolveTargetCandidates(new Set([
      ...collectCandidates(patchOptions.candidates),
      ...(filesystemCandidates ?? []),
    ]), target)
    const normalizedCandidates = normalizeTargetRpxLengthCandidates(resolvedCandidates, target, resolvedStyleOptions)
    const result = await engine.generate(omitUndefined({
      scanSources: delegateSourceScan ? resolvedScanSources : false,
      ...patchOptions,
      candidates: normalizedCandidates.candidates,
    }))
    const sources = resolveGeneratedSourcePatterns(result.sources, resolvedScanSources)
    const rawCss = restoreRpxLengthCssSelectors(result.css, normalizedCandidates.restoreCandidates)
    const css = await transformTailwindV4CssByTarget(rawCss, target, resolvedStyleOptions)

    return {
      ...result,
      sources,
      classSet: restoreRpxLengthCandidates(result.classSet, normalizedCandidates.restoreCandidates),
      rawCandidates: restoreRpxLengthCandidates(result.rawCandidates, normalizedCandidates.restoreCandidates),
      css,
      rawCss,
      target,
    }
  }

  async function generateWithIncrementalCache(options: TailwindV4GenerateOptions = {}) {
    const target = options.target ?? 'weapp'
    const cssMacroSource = resolveCssMacroTailwindV4Source(source)
    const compatibleSource = createCompatibleSource(cssMacroSource, target)
    const requestedCandidates = resolveTargetCandidates(options.candidates, target)
    const styleOptions = resolveStyleOptions(source, options.styleOptions)

    if ((options.sources?.length ?? 0) > 0 || options.bareArbitraryValues !== undefined || Array.isArray(options.scanSources)) {
      return generateOnce(cssMacroSource, options)
    }

    const cacheKey = createIncrementalGenerateCacheKey(
      compatibleSource,
      target,
      styleOptions,
    )

    if (options.scanSources === true) {
      return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
        const generated = await generateOnce(cssMacroSource, options)
        const admitted = seedIncrementalGenerateCache({
          compatibleSource,
          generated,
          requestedCandidates,
          styleOptions,
          target,
        })
        if (!admitted) {
          incrementalGenerateCache.delete(cacheKey)
        }
        return generated
      })
    }

    const cached = incrementalGenerateCache.get(cacheKey)
    if (cached) {
      if (hasRemovedCandidates(cached.seenCandidates, requestedCandidates)) {
        return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
          const generated = await generateOnce(cssMacroSource, options)
          const admitted = seedIncrementalGenerateCache({
            compatibleSource,
            generated,
            requestedCandidates,
            styleOptions,
            target,
          })
          if (!admitted) {
            incrementalGenerateCache.delete(cacheKey)
          }
          return generated
        })
      }

      const missingCandidates = [...requestedCandidates].filter(candidate => !cached.seenCandidates.has(candidate))
      if (missingCandidates.length === 0) {
        return {
          css: cached.css,
          rawCss: cached.rawCss,
          incrementalCss: '',
          incrementalRawCss: '',
          classSet: new Set(cached.classSet),
          rawCandidates: new Set(cached.seenCandidates),
          dependencies: cached.dependencies,
          sources: cached.sources,
          root: cached.root,
          target: cached.target,
        }
      }

      if (shouldRebuildIncrementalEntry(cached, requestedCandidates, missingCandidates)) {
        return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
          const generated = await generateOnce(cssMacroSource, options)
          const admitted = seedIncrementalGenerateCache({
            compatibleSource,
            generated,
            requestedCandidates,
            styleOptions,
            target,
          })
          if (!admitted) {
            incrementalGenerateCache.delete(cacheKey)
          }
          return generated
        })
      }

      return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
        const designSystem = await cached.designSystemPromise
        const normalizedMissing = normalizeTargetRpxLengthCandidates(missingCandidates, target, styleOptions)
        const normalizedMissingCandidates = [...normalizedMissing.candidates]
        const cssByCandidate = designSystem.candidatesToCss(normalizedMissingCandidates)
        const rawCssParts: string[] = []
        const classSet = new Set<string>()
        for (let index = 0; index < normalizedMissingCandidates.length; index += 1) {
          const candidate = normalizedMissingCandidates[index]
          const css = cssByCandidate[index]
          if (candidate && typeof css === 'string' && css.trim().length > 0) {
            rawCssParts.push(restoreRpxLengthCssSelectors(css, normalizedMissing.restoreCandidates))
            classSet.add(normalizedMissing.restoreCandidates.get(candidate) ?? candidate)
          }
        }
        const rawCss = rawCssParts.join('\n')
        const incrementalCss = rawCss.length > 0
          ? await transformTailwindV4CssByTarget(rawCss, target, {
              ...createIncrementalStyleOptions(styleOptions),
              customPropertyValues: cached.customPropertyValues,
            } as Partial<IStyleHandlerOptions>)
          : ''

        for (const candidate of missingCandidates) {
          cached.seenCandidates.add(candidate)
        }
        for (const className of classSet) {
          cached.classSet.add(className)
        }
        cached.css = [cached.css, incrementalCss].filter(Boolean).join('\n')
        cached.rawCss = [cached.rawCss, rawCss].filter(Boolean).join('\n')
        mergeCustomPropertyValues(cached.customPropertyValues, incrementalCss)
        return {
          css: cached.css,
          rawCss: cached.rawCss,
          incrementalCss,
          incrementalRawCss: rawCss,
          classSet: new Set(cached.classSet),
          rawCandidates: new Set(cached.seenCandidates),
          dependencies: cached.dependencies,
          sources: cached.sources,
          root: cached.root,
          target: cached.target,
        }
      })
    }

    return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
      const generated = await generateOnce(cssMacroSource, options)
      seedIncrementalGenerateCache({
        compatibleSource,
        generated,
        requestedCandidates,
        styleOptions,
        target,
      })
      return generated
    })
  }

  async function generate(options: TailwindV4GenerateOptions = {}) {
    return options.incrementalCache
      ? generateWithIncrementalCache(options)
      : generateOnce(source, options)
  }

  return {
    source,
    loadDesignSystem: createEngineTailwindV4Engine(source).loadDesignSystem,
    validateCandidates: createEngineTailwindV4Engine(source).validateCandidates,
    generate,
  }
}
