export {
  createSourceScanMatcher as createViteSourceScanMatcher,
  discoverTailwindV4CssEntries,
  resolveTailwindConfigEntriesFromCssCached,
  resolveTailwindV4EntriesFromCss,
  resolveTailwindV4EntriesFromCssCached,
  resolveSourceScanEntries as resolveViteSourceScanEntries,
  resolveTailwindV4CssDependencies as resolveViteTailwindV4CssDependencies,
} from '../shared/source-scan'
export type {
  ResolvedTailwindV4CssEntries,
  ResolvedSourceScan as ResolvedViteSourceScan,
} from '../shared/source-scan'
