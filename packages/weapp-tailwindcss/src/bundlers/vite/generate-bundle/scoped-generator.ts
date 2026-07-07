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

function intersectCandidateSourceMaps(first: Map<string, Set<string>>, second: Map<string, Set<string>>) {
  if (first.size === 0 || second.size === 0) {
    return new Map<string, Set<string>>()
  }
  const scoped = new Map<string, Set<string>>()
  for (const [candidate, sources] of first) {
    if (second.has(candidate)) {
      scoped.set(candidate, sources)
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

function resolveExplicitSourceMaps(
  scopedSources: Map<string, Set<string>>,
  localSources: Map<string, Set<string>>,
  fallbackSources?: Map<string, Set<string>> | undefined,
) {
  if (scopedSources.size === 0 && localSources.size === 0 && fallbackSources?.size) {
    return fallbackSources
  }
  if (localSources.size === 0 && scopedSources.size > 0) {
    return scopedSources
  }
  return intersectCandidateSourceMaps(scopedSources, localSources)
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
  const scopedCandidates = getSourceCandidatesForEntries(entries)
  const intersectedCandidates = localEntries
    ? resolveExplicitSourceCandidates(scopedCandidates, getSourceCandidatesForEntries(localEntries), getSourceCandidatesForEntries(undefined))
    : scopedCandidates
  const scopedSignature = createCandidateSignature(intersectedCandidates)
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
  const scopedSources = getSourceCandidateSourcesForEntries(entries)
  return localEntries
    ? resolveExplicitSourceMaps(scopedSources, getSourceCandidateSourcesForEntries(localEntries), getSourceCandidateSourcesForEntries(undefined))
    : scopedSources
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
