import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4DesignSystem, TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4GenerateTarget, TailwindV4ResolvedSource, TailwindV4SourcePattern } from '../types'
import fs from 'node:fs'
import { postcss } from '@weapp-tailwindcss/postcss'
import { LRUCache } from 'lru-cache'
import { hasCssMacroTailwindV4Source, withCssMacroStyleOptions } from '@/css-macro/auto'
import { shouldUseWebGeneratorTargetFromEnv } from '@/runtime-branch/generator-target-env'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '../candidates'
import { loadTailwindV4DesignSystem } from '../design-system'
import { normalizeRpxLengthCandidates } from './rpx-candidates'

export const INCREMENTAL_GENERATE_CACHE_MAX = 8
export const INCREMENTAL_GENERATE_TASK_CACHE_MAX = 32
export const INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX = 12_000
export const INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX = 2 * 1024 * 1024
export const incrementalGenerateCache = new LRUCache<string, TailwindV4IncrementalGenerateCacheEntry>({
  max: INCREMENTAL_GENERATE_CACHE_MAX,
})
export const incrementalGenerateTaskCache = new LRUCache<string, Promise<Awaited<ReturnType<TailwindV4Engine['generate']>>>>({
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

export function collectCandidates(candidates: Iterable<string> | undefined) {
  return new Set(candidates ?? [])
}

export function hasRemovedCandidates(previousCandidates: Set<string>, nextCandidates: Set<string>) {
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

export function createIncrementalGenerateCacheKey(
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

export function runIncrementalGenerateTask(
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

export function resolveTargetCandidates(
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
) {
  return new Set(generated.classSet)
}

export function shouldDelegateWebSourceScanToTailwind(
  target: TailwindV4GenerateTarget,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  return target === 'web' && scanSources !== false
}

export function createIncrementalStyleOptions(
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  return {
    ...styleOptions,
    isMainChunk: false,
  }
}

export function resolveStyleOptions(source: TailwindV4ResolvedSource, options: Partial<IStyleHandlerOptions> | undefined) {
  return hasCssMacroTailwindV4Source(source.css) ? withCssMacroStyleOptions(options) : options
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

export function mergeCustomPropertyValues(target: Map<string, string>, css: string) {
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

export function summarizeIncrementalCacheKey(key: string) {
  return {
    keyHash: createStableTextSignature(key),
    keyBytes: key.length,
  }
}

export function shouldRebuildIncrementalEntry(
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

export function seedIncrementalGenerateCache(options: TailwindV4IncrementalCacheSeedOptions) {
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
    seenCandidates: collectSeenCandidates(options.generated),
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

function shouldNormalizeRpxLengthCandidatesForTarget(
  target: TailwindV4GenerateTarget,
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
) {
  if (target !== 'web') {
    return true
  }
  const options = styleOptions as (Partial<IStyleHandlerOptions> & { appType?: string | undefined }) | undefined
  return options?.appType === 'uni-app-vite' || shouldUseWebGeneratorTargetFromEnv()
}

export function normalizeTargetRpxLengthCandidates(
  candidates: Iterable<string>,
  target: TailwindV4GenerateTarget,
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
) {
  return shouldNormalizeRpxLengthCandidatesForTarget(target, styleOptions)
    ? normalizeRpxLengthCandidates(candidates)
    : {
        candidates: new Set(candidates),
        restoreCandidates: new Map<string, string>(),
      }
}

export function resolveGeneratedSourcePatterns(
  generatedSources: TailwindV4SourcePattern[],
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  return Array.isArray(scanSources) ? scanSources : generatedSources
}
