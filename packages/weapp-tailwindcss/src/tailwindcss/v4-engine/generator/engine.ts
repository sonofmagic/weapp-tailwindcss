import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from '../types'
import { createTailwindV4Engine as createEngineTailwindV4Engine, extractRawCandidates } from '@tailwindcss-mangle/engine'
import { resolveCssMacroTailwindV4Source } from '../css-macro-source'
import { transformTailwindV4CssByTarget } from '../miniprogram'
import { createCompatibleSource } from './css-compat'
import { collectCandidates, createIncrementalGenerateCacheKey, createIncrementalStyleOptions, createTailwindV4SourceCacheKey, hasRemovedCandidates, incrementalGenerateCache, mergeCustomPropertyValues, normalizeTargetRpxLengthCandidates, resolveStyleOptions, resolveTargetCandidates, runIncrementalGenerateTask, seedIncrementalGenerateCache, shouldRebuildIncrementalEntry } from './incremental-cache'
import { createEngineSourceEntries, serializeTailwindGenerationArtifact, TailwindV4NativeSessionPool } from './native-session'
import { restoreRpxLengthCandidates, restoreRpxLengthCssSelectors } from './rpx-candidates'
import { resolveCompiledSourceRoot, resolveScanSources } from './scan-sources'

function isCssSyntaxError(error: unknown) {
  return error instanceof Error && error.name === 'CssSyntaxError'
}

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  const generationSessions = new TailwindV4NativeSessionPool()
  const incrementalCacheKeys = new Set<string>()
  const validationEngine = createEngineTailwindV4Engine(source)

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
    const resolvedScanSources = await resolveScanSources(generateSource, scanSources)
    const filesystemCandidates = Array.isArray(resolvedScanSources)
      ? new Set(await extractRawCandidates(resolvedScanSources, {
          ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
        }))
      : undefined
    const resolvedCandidates = resolveTargetCandidates(new Set([
      ...collectCandidates(patchOptions.candidates),
      ...(filesystemCandidates ?? []),
    ]), target)
    const normalizedCandidates = normalizeTargetRpxLengthCandidates(resolvedCandidates, target, resolvedStyleOptions)
    const sourceId = compatibleSource.dependencies[0] ?? compatibleSource.base
    const generationRequest = {
      ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
      ...(patchOptions.sources === undefined
        ? {}
        : { sourceEntries: createEngineSourceEntries(patchOptions.sources, sourceId) }),
      candidates: normalizedCandidates.candidates,
    }
    let generatedCss: string
    let classSet: Set<string>
    let rawCandidates: Set<string>
    let dependencies: string[]
    try {
      const artifact = await generationSessions.generate(
        target,
        createTailwindV4SourceCacheKey(compatibleSource),
        compatibleSource,
        generationRequest,
      )
      generatedCss = serializeTailwindGenerationArtifact(artifact)
      classSet = artifact.classSet
      rawCandidates = artifact.rawCandidates
      dependencies = artifact.dependencies
    }
    catch (error) {
      if (!isCssSyntaxError(error)) {
        throw error
      }
      const legacyResult = await createEngineTailwindV4Engine(compatibleSource).generate({
        ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
        ...(patchOptions.sources === undefined ? {} : { sources: patchOptions.sources }),
        candidates: normalizedCandidates.candidates,
        scanSources: false,
      })
      generatedCss = legacyResult.css
      classSet = legacyResult.classSet
      rawCandidates = legacyResult.rawCandidates
      dependencies = legacyResult.dependencies
    }
    const sources = Array.isArray(resolvedScanSources) ? resolvedScanSources : []
    const rawCss = restoreRpxLengthCssSelectors(
      generatedCss,
      normalizedCandidates.restoreCandidates,
    )
    const css = await transformTailwindV4CssByTarget(rawCss, target, resolvedStyleOptions)

    return {
      classSet: restoreRpxLengthCandidates(classSet, normalizedCandidates.restoreCandidates),
      rawCandidates: restoreRpxLengthCandidates(rawCandidates, normalizedCandidates.restoreCandidates),
      dependencies,
      root: resolveCompiledSourceRoot(compatibleSource),
      sources,
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
    incrementalCacheKeys.add(cacheKey)

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

  const engine = {
    source,
    loadDesignSystem: validationEngine.loadDesignSystem,
    validateCandidates: validationEngine.validateCandidates,
    generate,
    dispose() {
      generationSessions.dispose()
      for (const cacheKey of incrementalCacheKeys) {
        incrementalGenerateCache.delete(cacheKey)
      }
      incrementalCacheKeys.clear()
    },
  }
  return engine
}
