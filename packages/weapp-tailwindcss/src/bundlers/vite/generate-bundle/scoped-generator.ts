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

function intersectCandidates(first: Set<string>, second: Set<string>) {
  if (first.size === 0 || second.size === 0) {
    return new Set<string>()
  }
  const [small, large] = first.size <= second.size ? [first, second] : [second, first]
  const scoped = new Set<string>()
  for (const candidate of small) {
    if (large.has(candidate)) {
      scoped.add(candidate)
    }
  }
  return scoped
}

function mergeCandidates(first: Set<string>, second: Set<string>) {
  return new Set([...first, ...second])
}

function resolveScopedSourceEntries(rawSource: string, sourceFile: string, resolvedEntries: TailwindSourceEntry[] | undefined) {
  if (!hasOwnSourceDirectives(rawSource)) {
    return {
      entries: resolvedEntries,
      localEntries: undefined,
    }
  }
  if (resolvedEntries !== undefined) {
    return {
      entries: resolvedEntries,
    }
  }
  return {
    entries: createLocalSourceEntries(sourceFile),
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
  const { entries } = await resolveScopedGeneratorSourceEntries(rawSource, sourceFile)
  if (entries === undefined) {
    return fallbackSignature
  }
  const scopedCandidates = getSourceCandidatesForEntries(entries)
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
  const { entries } = await resolveScopedGeneratorSourceEntries(rawSource, sourceFile)
  if (entries === undefined) {
    return getSourceCandidateSourcesForEntries(undefined)
  }
  return getSourceCandidateSourcesForEntries(entries)
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
    const { entries } = await resolveScopedGeneratorSourceEntries(rawSource, sourceFile)
    if (entries !== undefined && (entries.length > 0 || hasOwnSourceDirectives(rawSource))) {
      const explicitCandidates = getSourceCandidatesForEntries(entries)
      const outputCandidates = scopedSourceCandidateGetter?.(undefined)
      const scopedCandidates = outputCandidates
        ? intersectCandidates(explicitCandidates, outputCandidates)
        : explicitCandidates
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
