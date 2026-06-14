import type { SourceCandidateFilterOptions } from '../source-candidates'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { resolveTailwindConfigEntriesFromCssCached, resolveTailwindV4EntriesFromCssCached } from '../source-scan'
import { createCandidateSignature } from './signatures'

export async function createScopedGeneratorCandidateSignature(
  rawSource: string,
  sourceFile: string,
  fallbackSignature: string,
  getSourceCandidatesForEntries: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>) | undefined,
  options: { includeFallbackSignature?: boolean | undefined, majorVersion?: number | undefined } = {},
) {
  if (!getSourceCandidatesForEntries || (!rawSource.includes('@source') && !rawSource.includes('@config'))) {
    return fallbackSignature
  }
  const sourceBase = path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, '')))
  const resolved = options.majorVersion === 3
    ? await resolveTailwindConfigEntriesFromCssCached(rawSource, sourceBase)
    : await resolveTailwindV4EntriesFromCssCached(rawSource, sourceBase)
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
    majorVersion,
    outputFile,
    rawSource,
    shouldExcludeSubpackageSourceCandidates,
    sourceFile,
    scopedSourceCandidateGetter,
  } = options
  if (getSourceCandidatesForEntries && rawSource && sourceFile) {
    const sourceBase = path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, '')))
    const resolved = majorVersion === 3
      ? await resolveTailwindConfigEntriesFromCssCached(rawSource, sourceBase)
      : await resolveTailwindV4EntriesFromCssCached(rawSource, sourceBase)
    if (resolved?.entries !== undefined) {
      const scopedRuntime = getSourceCandidatesForEntries(resolved.entries)
      if (scopedRuntime.size > 0) {
        return scopedRuntime
      }
    }
  }
  if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
    return fallbackRuntime
  }
  const filteredSourceCandidates = scopedSourceCandidateGetter?.(undefined)
  if (!filteredSourceCandidates) {
    return fallbackRuntime
  }
  return filteredSourceCandidates.size > 0 ? filteredSourceCandidates : fallbackRuntime
}
