import type { SourceCandidateFilterOptions } from '../source-candidates'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { resolveTailwindV4EntriesFromCssCached } from '../source-scan'
import { createCandidateSignature } from './signatures'

function hasOwnSourceDirectives(rawSource: string) {
  return rawSource.includes('@source') || rawSource.includes('@config')
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
  if (resolved?.entries === undefined) {
    return fallbackSignature
  }
  const scopedSignature = createCandidateSignature(getSourceCandidatesForEntries(resolved.entries))
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
    if (resolved?.entries !== undefined && (resolved.entries.length > 0 || hasOwnSourceDirectives(rawSource))) {
      return scopedSourceCandidateGetter?.(resolved.entries)
        ?? getSourceCandidatesForEntries(resolved.entries)
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
    return scopedCandidates
  }
  if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
    return fallbackRuntime
  }
  return fallbackRuntime
}
