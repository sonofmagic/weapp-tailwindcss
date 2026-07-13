import type { OutputAsset } from 'rollup'
import type { BundleSnapshot } from '../bundle-state'
import type { createTransformFilter } from './transform-filter'
import path from 'node:path'
import { shouldSkipViteAssetTransform } from './transform-filter'

interface SyncBundleMarkupCandidatesOptions {
  mergeSourceCandidateSource?: ((file: string, source: string) => Promise<void>) | undefined
  resolveSourceCandidateFile: (file: string) => string | undefined
  rootDir: string
  snapshot: BundleSnapshot
  transformFilter: ReturnType<typeof createTransformFilter>
}

export async function syncBundleMarkupCandidates(options: SyncBundleMarkupCandidatesOptions) {
  const {
    mergeSourceCandidateSource,
    resolveSourceCandidateFile,
    rootDir,
    snapshot,
    transformFilter,
  } = options
  if (!mergeSourceCandidateSource) {
    return
  }

  await Promise.all(snapshot.entries.map(async (entry) => {
    if (
      entry.type !== 'html'
      || entry.output.type !== 'asset'
      || shouldSkipViteAssetTransform(entry.output as OutputAsset, entry.file, rootDir, transformFilter)
    ) {
      return
    }
    const sourceFile = resolveSourceCandidateFile(entry.file)
      ?? path.resolve(rootDir, entry.file)
    await mergeSourceCandidateSource(sourceFile, entry.source)
  }))
}
