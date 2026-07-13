import type { OutputAsset } from 'rollup'
import type { BundleSnapshot } from '../bundle-state'
import type { SourceCandidateFilterOptions } from '../source-candidates'
import type { createTransformFilter } from './transform-filter'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { isFileMatchedByTailwindSourceEntries } from '@/tailwindcss/source-scan'
import { shouldSkipViteAssetTransform } from './transform-filter'

interface CollectBundleMarkupCandidatesOptions {
  extractSourceCandidates?: ((file: string, source: string) => Promise<Set<string>>) | undefined
  previousCandidatesByFile?: ReadonlyMap<string, Set<string>> | undefined
  preserveMissingFiles?: boolean | undefined
  resolveSourceCandidateFile: (file: string) => string | undefined
  rootDir: string
  snapshot: BundleSnapshot
  transformFilter: ReturnType<typeof createTransformFilter>
}

export interface BundleMarkupCandidateCollection {
  candidatesByFile: Map<string, Set<string>>
  values: Set<string>
  valuesForEntries: (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>
}

export async function collectBundleMarkupCandidates(options: CollectBundleMarkupCandidatesOptions): Promise<BundleMarkupCandidateCollection> {
  const {
    extractSourceCandidates,
    previousCandidatesByFile,
    preserveMissingFiles,
    resolveSourceCandidateFile,
    rootDir,
    snapshot,
    transformFilter,
  } = options
  const candidatesByFile = preserveMissingFiles
    ? new Map([...(previousCandidatesByFile ?? [])].map(([file, candidates]) => [file, new Set(candidates)]))
    : new Map<string, Set<string>>()

  await Promise.all(snapshot.entries.map(async (entry) => {
    if (
      !extractSourceCandidates
      || entry.type !== 'html'
      || entry.output.type !== 'asset'
      || shouldSkipViteAssetTransform(entry.output as OutputAsset, entry.file, rootDir, transformFilter)
    ) {
      return
    }
    const sourceFile = resolveSourceCandidateFile(entry.file)
      ?? path.resolve(rootDir, entry.file)
    candidatesByFile.set(sourceFile, await extractSourceCandidates(sourceFile, entry.source))
  }))

  const valuesForEntries = (entries: TailwindSourceEntry[] | undefined, filterOptions: SourceCandidateFilterOptions = {}) => {
    const values = new Set<string>()
    for (const [file, candidates] of candidatesByFile) {
      if (entries !== undefined && !isFileMatchedByTailwindSourceEntries(file, entries)) {
        continue
      }
      if (filterOptions.excludeEntries?.length && isFileMatchedByTailwindSourceEntries(file, filterOptions.excludeEntries)) {
        continue
      }
      for (const candidate of candidates) {
        values.add(candidate)
      }
    }
    return values
  }

  return {
    candidatesByFile,
    values: valuesForEntries(undefined),
    valuesForEntries,
  }
}
