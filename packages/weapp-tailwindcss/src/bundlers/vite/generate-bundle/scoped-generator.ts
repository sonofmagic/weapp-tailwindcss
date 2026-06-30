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
  const scoped = new Set<string>()
  const [small, large] = first.size <= second.size ? [first, second] : [second, first]
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

function intersectExplicitSourceCandidates(scopedCandidates: Set<string>, localCandidates: Set<string>) {
  if (localCandidates.size === 0 && scopedCandidates.size > 0) {
    return scopedCandidates
  }
  return intersectCandidates(scopedCandidates, localCandidates)
}

function resolveExplicitSourceCandidates(
  scopedCandidates: Set<string>,
  localCandidates: Set<string>,
  fallbackCandidates?: Set<string> | undefined,
) {
  if (scopedCandidates.size === 0 && localCandidates.size === 0 && fallbackCandidates?.size) {
    return fallbackCandidates
  }
  return intersectExplicitSourceCandidates(scopedCandidates, localCandidates)
}

function resolveScopedSourceEntries(rawSource: string, sourceFile: string, resolvedEntries: TailwindSourceEntry[] | undefined) {
  if (!hasOwnSourceDirectives(rawSource)) {
    return {
      entries: resolvedEntries,
      localEntries: undefined,
    }
  }
  const localEntries = createLocalSourceEntries(sourceFile)
  if (!resolvedEntries || resolvedEntries.length === 0) {
    return {
      entries: localEntries,
      localEntries: undefined,
    }
  }
  return {
    entries: resolvedEntries,
    localEntries,
  }
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
  const sourceBase = path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, '')))
  const resolved = await resolveTailwindV4EntriesFromCssCached(rawSource, sourceBase)
  const { entries, localEntries } = resolveScopedSourceEntries(rawSource, sourceFile, resolved?.entries)
  if (entries === undefined) {
    return fallbackSignature
  }
  const scopedCandidates = getSourceCandidatesForEntries(entries)
  const intersectedCandidates = localEntries
    ? resolveExplicitSourceCandidates(scopedCandidates, getSourceCandidatesForEntries(localEntries), getSourceCandidatesForEntries(undefined))
    : scopedCandidates
  const scopedSignature = createCandidateSignature(intersectedCandidates)
  return options.includeFallbackSignature === true
    ? `${scopedSignature}:${fallbackSignature}`
    : scopedSignature
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
    const sourceBase = path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, '')))
    const resolved = await resolveTailwindV4EntriesFromCssCached(rawSource, sourceBase)
    const { entries, localEntries } = resolveScopedSourceEntries(rawSource, sourceFile, resolved?.entries)
    if (entries !== undefined && (entries.length > 0 || hasOwnSourceDirectives(rawSource))) {
      const scopedCandidates = scopedSourceCandidateGetter?.(entries)
        ?? getSourceCandidatesForEntries(entries)
      const shouldMergeFallbackRuntime = hasCssMacroTailwindV4CustomVariantConditionalComments(rawSource)
      if (!localEntries) {
        return shouldMergeFallbackRuntime ? mergeCandidates(scopedCandidates, fallbackRuntime) : scopedCandidates
      }
      const localCandidates = scopedSourceCandidateGetter?.(localEntries)
        ?? getSourceCandidatesForEntries(localEntries)
      const fallbackCandidates = scopedSourceCandidateGetter?.(undefined)
      const scopedLocalCandidates = resolveExplicitSourceCandidates(scopedCandidates, localCandidates, fallbackCandidates)
      return shouldMergeFallbackRuntime ? mergeCandidates(scopedLocalCandidates, fallbackRuntime) : scopedLocalCandidates
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
