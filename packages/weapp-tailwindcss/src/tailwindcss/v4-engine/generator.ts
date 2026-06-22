import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type {
  TailwindV4DesignSystem,
  TailwindV4Engine,
  TailwindV4GenerateOptions,
  TailwindV4GenerateTarget,
  TailwindV4ResolvedSource,
  TailwindV4SourcePattern,
} from './types'
import fs from 'node:fs'
import { createTailwindV4Engine as createEngineTailwindV4Engine, extractRawCandidates } from '@tailwindcss-mangle/engine'
import { postcss } from '@weapp-tailwindcss/postcss'
import { LRUCache } from 'lru-cache'
import { hasCssMacroTailwindV4Directive, withCssMacroStyleOptions } from '@/css-macro/auto'
import { omitUndefined } from '@/utils/object'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from './candidates'
import { loadTailwindV4DesignSystem } from './design-system'
import { createCompatibleSource } from './generator/css-compat'
import { normalizeRpxTextCandidates, restoreRpxTextCandidates, restoreRpxTextCssSelectors } from './generator/rpx-candidates'
import { resolveScanSources } from './generator/scan-sources'
import { transformTailwindV4CssByTarget } from './miniprogram'

const INCREMENTAL_GENERATE_CACHE_MAX = 8
const INCREMENTAL_GENERATE_TASK_CACHE_MAX = 32
const INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX = 128
const INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX = 256 * 1024
const incrementalGenerateCache = new LRUCache<string, TailwindV4IncrementalGenerateCacheEntry>({
  max: INCREMENTAL_GENERATE_CACHE_MAX,
})
const incrementalGenerateTaskCache = new LRUCache<string, Promise<Awaited<ReturnType<TailwindV4Engine['generate']>>>>({
  max: INCREMENTAL_GENERATE_TASK_CACHE_MAX,
})

interface TailwindV4IncrementalGenerateCacheEntry {
  seenCandidates: Set<string>
  classSet: Set<string>
  css: string
  rawCss: string
  customPropertyValues: Map<string, string>
  designSystemPromise: Promise<TailwindV4DesignSystem>
  dependencies: string[]
  sources: TailwindV4SourcePattern[]
  root: null | 'none' | {
    base: string
    pattern: string
  }
  target: TailwindV4GenerateTarget
}

interface TailwindV4IncrementalCacheSeedOptions {
  compatibleSource: TailwindV4ResolvedSource
  generated: Awaited<ReturnType<TailwindV4Engine['generate']>>
  requestedCandidates: Set<string>
  styleOptions: Partial<IStyleHandlerOptions> | undefined
  target: TailwindV4GenerateTarget
}

function collectCandidates(candidates: Iterable<string> | undefined) {
  return new Set(candidates ?? [])
}

function hasRemovedCandidates(previousCandidates: Set<string>, nextCandidates: Set<string>) {
  for (const candidate of previousCandidates) {
    if (!nextCandidates.has(candidate)) {
      return true
    }
  }
  return false
}

function createStableJson(value: unknown): string {
  if (value === undefined) {
    return 'undefined'
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => createStableJson(item)).join(',')}]`
  }
  return `{${Object.keys(value).sort().map((key) => {
    const record = value as Record<string, unknown>
    return `${JSON.stringify(key)}:${createStableJson(record[key])}`
  }).join(',')}}`
}

function createDependencyFingerprint(files: string[]) {
  return files.map((file) => {
    try {
      const stat = fs.statSync(file)
      return `${file}:${stat.size}:${stat.mtimeMs}`
    }
    catch {
      return `${file}:missing`
    }
  }).join('|')
}

function createIncrementalGenerateCacheKey(
  source: TailwindV4ResolvedSource,
  target: TailwindV4GenerateTarget,
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
) {
  return [
    source.projectRoot,
    source.base,
    createStableJson(source.baseFallbacks),
    source.css,
    createDependencyFingerprint(source.dependencies),
    target,
    createStableJson(styleOptions),
  ].join('\0')
}

function createIncrementalGenerateTaskCacheKey(
  cacheKey: string,
  requestedCandidates: Set<string>,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  return [
    cacheKey,
    scanSources === true ? 'scan:1' : 'scan:0',
    [...requestedCandidates].sort().join('\n'),
  ].join('\0')
}

function runIncrementalGenerateTask(
  cacheKey: string,
  requestedCandidates: Set<string>,
  scanSources: TailwindV4GenerateOptions['scanSources'],
  task: () => Promise<Awaited<ReturnType<TailwindV4Engine['generate']>>>,
) {
  const taskKey = createIncrementalGenerateTaskCacheKey(cacheKey, requestedCandidates, scanSources)
  const cachedTask = incrementalGenerateTaskCache.get(taskKey)
  if (cachedTask) {
    return cachedTask
  }
  const promise = task()
  incrementalGenerateTaskCache.set(taskKey, promise)
  promise.finally(() => {
    if (incrementalGenerateTaskCache.get(taskKey) === promise) {
      incrementalGenerateTaskCache.delete(taskKey)
    }
  })
  return promise
}

function createIncrementalDesignSystemPromise(
  source: TailwindV4ResolvedSource,
  cacheKey: string,
) {
  const promise = loadTailwindV4DesignSystem(source)
  promise.catch(() => {
    const cached = incrementalGenerateCache.get(cacheKey)
    if (cached?.designSystemPromise === promise) {
      incrementalGenerateCache.delete(cacheKey)
    }
  })
  return promise
}

function resolveTargetCandidates(
  candidates: Iterable<string> | undefined,
  target: TailwindV4GenerateTarget,
) {
  const collected = collectCandidates(candidates)
  return target === 'weapp'
    ? filterUnsupportedMiniProgramTailwindV4Candidates(collected)
    : collected
}

function collectSeenCandidates(
  generated: Pick<Awaited<ReturnType<TailwindV4Engine['generate']>>, 'rawCandidates' | 'classSet'>,
  requestedCandidates: Set<string>,
) {
  return new Set([
    ...requestedCandidates,
    ...generated.rawCandidates,
    ...generated.classSet,
  ])
}

function shouldDelegateWebSourceScanToTailwind(
  target: TailwindV4GenerateTarget,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  return target === 'web' && scanSources !== false
}

function createIncrementalStyleOptions(styleOptions: Partial<IStyleHandlerOptions> | undefined) {
  return {
    ...styleOptions,
    isMainChunk: false,
  }
}

function resolveStyleOptions(source: TailwindV4ResolvedSource, options: Partial<IStyleHandlerOptions> | undefined) {
  return hasCssMacroTailwindV4Directive(source.css) ? withCssMacroStyleOptions(options) : options
}

function collectCustomPropertyValues(css: string) {
  const values = new Map<string, string>()
  try {
    const root = postcss.parse(css)
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        values.set(decl.prop, decl.value.trim())
      }
    })
  }
  catch {
    // Ignore malformed cache context; the normal transformer will still process the current chunk.
  }
  return values
}

function mergeCustomPropertyValues(target: Map<string, string>, css: string) {
  for (const [prop, value] of collectCustomPropertyValues(css)) {
    target.set(prop, value)
  }
}

function createStableTextSignature(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function summarizeIncrementalCacheKey(key: string) {
  return {
    keyHash: createStableTextSignature(key),
    keyBytes: key.length,
  }
}

function shouldRebuildIncrementalEntry(
  cached: TailwindV4IncrementalGenerateCacheEntry,
  requestedCandidates: Set<string>,
  missingCandidates: string[],
) {
  return cached.seenCandidates.size + missingCandidates.length > INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX
    || cached.css.length > INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX
    || cached.rawCss.length > INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX
    || requestedCandidates.size > INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX
}

function shouldAdmitIncrementalEntry(
  requestedCandidates: Set<string>,
  generated: {
    css: string
    rawCss: string
  },
) {
  return requestedCandidates.size <= INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX
    && generated.css.length <= INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX
    && generated.rawCss.length <= INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX
}

function seedIncrementalGenerateCache(options: TailwindV4IncrementalCacheSeedOptions) {
  if (!shouldAdmitIncrementalEntry(options.requestedCandidates, options.generated)) {
    return false
  }

  const cacheKey = createIncrementalGenerateCacheKey(
    options.compatibleSource,
    options.target,
    options.styleOptions,
  )
  const customPropertyValues = collectCustomPropertyValues(options.compatibleSource.css)
  mergeCustomPropertyValues(customPropertyValues, options.generated.css)
  incrementalGenerateCache.set(cacheKey, {
    seenCandidates: collectSeenCandidates(options.generated, options.requestedCandidates),
    classSet: new Set(options.generated.classSet),
    css: options.generated.css,
    rawCss: options.generated.rawCss,
    customPropertyValues,
    designSystemPromise: createIncrementalDesignSystemPromise(options.compatibleSource, cacheKey),
    dependencies: options.generated.dependencies,
    sources: options.generated.sources,
    root: options.generated.root,
    target: options.generated.target,
  })
  return true
}

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
    const compatibleSource = createCompatibleSource(generateSource, target)
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
    const normalizedCandidates = normalizeRpxTextCandidates(resolvedCandidates)
    const result = await engine.generate(omitUndefined({
      scanSources: delegateSourceScan ? resolvedScanSources : false,
      ...patchOptions,
      candidates: normalizedCandidates.candidates,
    }))
    const rawCss = restoreRpxTextCssSelectors(result.css, normalizedCandidates.restoreCandidates)
    const css = await transformTailwindV4CssByTarget(rawCss, target, resolvedStyleOptions)

    return {
      ...result,
      classSet: restoreRpxTextCandidates(result.classSet, normalizedCandidates.restoreCandidates),
      rawCandidates: restoreRpxTextCandidates(result.rawCandidates, normalizedCandidates.restoreCandidates),
      css,
      rawCss,
      target,
    }
  }

  async function generateWithIncrementalCache(options: TailwindV4GenerateOptions = {}) {
    const target = options.target ?? 'weapp'
    const compatibleSource = createCompatibleSource(source, target)
    const requestedCandidates = resolveTargetCandidates(options.candidates, target)
    const styleOptions = resolveStyleOptions(source, options.styleOptions)

    if ((options.sources?.length ?? 0) > 0 || options.bareArbitraryValues !== undefined || Array.isArray(options.scanSources)) {
      return generateOnce(source, options)
    }

    const cacheKey = createIncrementalGenerateCacheKey(
      compatibleSource,
      target,
      styleOptions,
    )

    if (options.scanSources === true) {
      return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
        const generated = await generateOnce(source, options)
        const admitted = seedIncrementalGenerateCache({
          compatibleSource,
          generated,
          requestedCandidates,
          styleOptions: options.styleOptions,
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
          const generated = await generateOnce(source, options)
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
          const generated = await generateOnce(source, options)
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
        const normalizedMissing = normalizeRpxTextCandidates(missingCandidates)
        const normalizedMissingCandidates = [...normalizedMissing.candidates]
        const cssByCandidate = designSystem.candidatesToCss(normalizedMissingCandidates)
        const rawCssParts: string[] = []
        const classSet = new Set<string>()
        for (let index = 0; index < normalizedMissingCandidates.length; index += 1) {
          const candidate = normalizedMissingCandidates[index]
          const css = cssByCandidate[index]
          if (candidate && typeof css === 'string' && css.trim().length > 0) {
            rawCssParts.push(restoreRpxTextCssSelectors(css, normalizedMissing.restoreCandidates))
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
      const generated = await generateOnce(source, options)
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

export function getTailwindV4IncrementalGenerateCacheStats() {
  return {
    max: INCREMENTAL_GENERATE_CACHE_MAX,
    entryCandidatesMax: INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX,
    entryCssBytesMax: INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX,
    size: incrementalGenerateCache.size,
    taskMax: INCREMENTAL_GENERATE_TASK_CACHE_MAX,
    taskSize: incrementalGenerateTaskCache.size,
    entries: [...incrementalGenerateCache.entries()].map(([key, entry]) => ({
      ...summarizeIncrementalCacheKey(key),
      candidates: entry.seenCandidates.size,
      classSet: entry.classSet.size,
      cssBytes: entry.css.length,
      rawCssBytes: entry.rawCss.length,
    })),
    keys: [...incrementalGenerateCache.keys()].map(summarizeIncrementalCacheKey),
    taskKeys: [...incrementalGenerateTaskCache.keys()].map(summarizeIncrementalCacheKey),
  }
}

export const getTailwindV4IncrementalGenerateCacheStatsForTest = getTailwindV4IncrementalGenerateCacheStats

export function clearTailwindV4IncrementalGenerateCacheForTest() {
  incrementalGenerateCache.clear()
  incrementalGenerateTaskCache.clear()
}
