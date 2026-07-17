export {
  collectConfiguredCssSources,
  collectExistingCssEntries,
  discoverTailwindV4CssEntries,
  mergeTailwindInlineSourceCandidates,
  resolveTailwindConfigEntriesFromCssCached,
  resolveTailwindV4EntriesFromCss,
  resolveTailwindV4EntriesFromCssCached,
  resolveTailwindV4CssDependencies as resolveViteTailwindV4CssDependencies,
} from '../../shared/source-scan/css-entries'
export type { ResolvedTailwindV4CssEntries } from '../../shared/source-scan/css-entries'
