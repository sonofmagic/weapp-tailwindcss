import type { SourceCandidateFilterOptions } from '../source-candidates'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { hasCssMacroTailwindV4CustomVariantConditionalComments } from '@/css-macro/auto'
import { resolveTailwindV4EntriesFromCssCached } from '../source-scan'
import { createCandidateSignature } from './signatures'

function hasOwnSourceDirectives(rawSource: string) {
  return rawSource.includes('@source') || rawSource.includes('@config')
}

function createLocalSourceEntries(sourceFile: string): TailwindSourceEntry[] {
  return [{
    base: path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, ''))),
    negated: false,
    pattern: '**/*',
  }]
}

function mergeCandidates(first: Set<string>, second: Set<string>) {
  return new Set([...first, ...second])
}

// 输出侧 sourceFile 可能无法还原显式 entries，仅在显式与本地范围都为空时复用已收集作用域。
function resolveScopedCandidates<T extends Set<string> | Map<string, Set<string>>>(
  scoped: T,
  local: T | undefined,
  fallback: T | undefined,
) {
  return scoped.size === 0 && local?.size === 0 && fallback?.size ? fallback : scoped
}

function resolveScopedSourceEntries(rawSource: string, sourceFile: string, resolvedEntries: TailwindSourceEntry[] | undefined) {
  if (!hasOwnSourceDirectives(rawSource)) {
    return {
      entries: resolvedEntries,
      localEntries: undefined,
    }
  }
  if (resolvedEntries?.length) {
    return {
      entries: resolvedEntries,
      localEntries: createLocalSourceEntries(sourceFile),
    }
  }
  return {
    entries: createLocalSourceEntries(sourceFile),
    localEntries: undefined,
  }
}

async function resolveScopedGeneratorSourceEntries(rawSource: string, sourceFile: string) {
  const sourceBase = path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, '')))
  const resolved = await resolveTailwindV4EntriesFromCssCached(rawSource, sourceBase)
  return resolveScopedSourceEntries(rawSource, sourceFile, resolved?.entries)
}

export async function createScopedGeneratorCandidateSignature(
  rawSource: string,
  sourceFile: string,
  fallbackSignature: string,
  getSourceCandidatesForEntries: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>) | undefined,
  options: { includeFallbackSignature?: boolean | undefined, majorVersion?: number | undefined } = {},
) {
  if (!getSourceCandidatesForEntries || !hasOwnSourceDirectives(rawSource)) {
    return fallbackSignature
  }
  const { entries, localEntries } = await resolveScopedGeneratorSourceEntries(rawSource, sourceFile)
  if (entries === undefined) {
    return fallbackSignature
  }
  const scopedCandidates = resolveScopedCandidates(
    getSourceCandidatesForEntries(entries),
    localEntries ? getSourceCandidatesForEntries(localEntries) : undefined,
    localEntries ? getSourceCandidatesForEntries(undefined) : undefined,
  )
  const scopedSignature = createCandidateSignature(scopedCandidates)
  return options.includeFallbackSignature === true
    ? `${scopedSignature}:${fallbackSignature}`
    : scopedSignature
}

export async function createScopedGeneratorSourceTraceMap(
  rawSource: string,
  sourceFile: string,
  getSourceCandidateSourcesForEntries: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Map<string, Set<string>>) | undefined,
) {
  if (!getSourceCandidateSourcesForEntries || !hasOwnSourceDirectives(rawSource)) {
    return getSourceCandidateSourcesForEntries?.(undefined)
  }
  const { entries, localEntries } = await resolveScopedGeneratorSourceEntries(rawSource, sourceFile)
  if (entries === undefined) {
    return getSourceCandidateSourcesForEntries(undefined)
  }
  return resolveScopedCandidates(
    getSourceCandidateSourcesForEntries(entries),
    localEntries ? getSourceCandidateSourcesForEntries(localEntries) : undefined,
    localEntries ? getSourceCandidateSourcesForEntries(undefined) : undefined,
  )
}

export async function createScopedGeneratorRuntime(options: {
  cssHandlerOptions: { isMainChunk?: boolean | undefined }
  fallbackRuntime: Set<string>
  getSourceCandidatesForEntries: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>) | undefined
  majorVersion: number | undefined
  outputFile: string
  rawSource?: string | undefined
  shouldExcludeSubpackageSourceCandidates: (outputFile: string, cssHandlerOptions: { isMainChunk?: boolean | undefined }) => boolean
  sourceFile?: string | undefined
  scopedSourceCandidateGetter: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>) | undefined
}) {
  const {
    cssHandlerOptions,
    fallbackRuntime,
    getSourceCandidatesForEntries,
    outputFile,
    rawSource,
    shouldExcludeSubpackageSourceCandidates,
    sourceFile,
    scopedSourceCandidateGetter,
  } = options
  if (getSourceCandidatesForEntries && rawSource && sourceFile) {
    const { entries, localEntries } = await resolveScopedGeneratorSourceEntries(rawSource, sourceFile)
    if (entries !== undefined && (entries.length > 0 || hasOwnSourceDirectives(rawSource))) {
      const scopedCandidates = resolveScopedCandidates(
        scopedSourceCandidateGetter?.(entries) ?? getSourceCandidatesForEntries(entries),
        localEntries
          ? scopedSourceCandidateGetter?.(localEntries) ?? getSourceCandidatesForEntries(localEntries)
          : undefined,
        localEntries ? scopedSourceCandidateGetter?.(undefined) : undefined,
      )
      const shouldMergeFallbackRuntime = hasCssMacroTailwindV4CustomVariantConditionalComments(rawSource)
      return shouldMergeFallbackRuntime ? mergeCandidates(scopedCandidates, fallbackRuntime) : scopedCandidates
    }
  }
  const scopedCandidates = scopedSourceCandidateGetter?.(undefined)
  if (
    scopedCandidates
    && (
      scopedCandidates.size > 0
      || shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)
    )
  ) {
    return shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)
      ? scopedCandidates
      : mergeCandidates(scopedCandidates, fallbackRuntime)
  }
  if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
    return fallbackRuntime
  }
  return fallbackRuntime
}
