// 统一导出入口，供外部调用端按需引用核心能力
export {
  type PostcssAppType,
  type PostcssStyleBranch,
  type PostcssStyleBranchProfile,
  resolvePostcssStyleBranch,
  type ResolvePostcssStyleBranchOptions,
  resolvePostcssStyleBranchProfile,
} from './branches'
export {
  type DynamicColorMixAlphaProtection,
  type DynamicColorMixAlphaProtectionOptions,
  type ModernColorValueNormalization,
  normalizeModernColorValue,
  protectDynamicColorMixAlpha,
} from './compat/color-mix'
export {
  consumeCascadeLayers,
  finalizeMiniProgramCss,
  hasMiniProgramCssSpecificityPlaceholders,
  hoistTailwindPreflightBase,
  normalizeMiniProgramGeneratedCssForPostcss,
  pruneMiniProgramGeneratedCss,
  removeUnsupportedAtSupports,
  removeUnsupportedCascadeLayers,
  removeUnsupportedMiniProgramAtRules,
  stripMiniProgramCssSpecificityPlaceholders,
  unwrapUnsupportedCascadeLayers,
} from './compat/mini-program-css'
export {
  normalizeMiniProgramPrefixedDeclaration,
  removeUnsupportedMiniProgramPrefixedAtRule,
} from './compat/mini-program-prefixes'
export {
  convertTailwindcssRpxDeclarationsToRem,
  convertTailwindcssRpxDeclarationToRem,
  convertTailwindcssRpxValueToRem,
  normalizeTailwindcssRpxDeclaration,
  normalizeTailwindcssRpxDeclarations,
  normalizeTailwindcssWebRpxDeclarations,
  type TailwindcssRpxToRemOptions,
} from './compat/tailwindcss-rpx'
export { normalizeTailwindcssV4InfinityCalcCss } from './compat/tailwindcss-v4'
export {
  type NormalizedWebCssCompatOptions,
  normalizeWebCssCompatOptions,
  transformWebCssCompat,
  transformWebCssSafeSelectors,
} from './compat/web-css'
export {
  compileCssMacroConditionalComments,
  CSS_MACRO_STYLE_OPTIONS_MARKER,
  hasCssMacroStyleOptions,
  hasCssMacroTailwindV4CustomVariantConditionalComments,
  hasCssMacroTailwindV4Directive,
  hasCssMacroTailwindV4InternalAtRules,
  hasCssMacroTailwindV4Source,
  transformCssMacroCss,
  transformCssMacroTailwindV4Source,
  withCssMacroStyleOptions,
} from './css-macro/auto'
export { CSS_MACRO_POSTCSS_PLUGIN_NAME, default as cssMacroPostcssPlugin } from './css-macro/postcss'
export {
  type PostcssFrameworkProfile,
  type PostcssFrameworkStrategy,
  type PostcssFrameworkType,
  type ResolvePostcssFrameworkOptions,
  resolvePostcssFrameworkProfile,
  resolvePostcssFrameworkStrategy,
  resolvePostcssStyleTarget,
} from './frameworks'
export { createWeappTailwindcssPostcssPlugin } from './generator-plugin'
export type {
  NormalizedWeappTailwindcssPostcssGeneratorOptions,
  TailwindCandidateSource,
  TailwindResolvedSource,
  TailwindV4SourceOptions,
  WeappTailwindcssPostcssGenerateOptions,
  WeappTailwindcssPostcssGenerateResult,
  WeappTailwindcssPostcssGenerator,
  WeappTailwindcssPostcssGeneratorUserOptions,
  WeappTailwindcssPostcssPluginAdapters,
  WeappTailwindcssPostcssPluginOptions,
  WeappTailwindcssPostcssTarget,
} from './generator-plugin'
export {
  collectApplyOnlyCssSelectors,
  collectApplyOnlyCssSelectorsRoot,
  filterApplyOnlyGeneratedCss,
  filterApplyOnlyGeneratedCssRoot,
} from './generator-plugin/apply-only'
export {
  analyzeTailwindCssDirectives,
  isTailwindCssGenerationDirective,
  isTailwindCssImportAtRule,
  isTailwindCssImportRequest,
  isTailwindCssPackageJsonImportRequest,
  isWeappTailwindcssImportRequest,
  normalizeTailwindCssImportRequest,
  parseTailwindCssConfigRequest,
  parseTailwindCssDirectiveRequest,
  type TailwindCssDirectiveAnalysis,
  type TailwindCssDirectiveAnalysisOptions,
  type TailwindCssDirectiveOptions,
} from './generator-plugin/directives'
export {
  cleanLocalCssImportWrapperTailwindDirectives,
  cleanLocalCssImportWrapperTailwindDirectivesRoot,
  collectCssImportRequestsRoot,
  type CollectCssImportRequestsRootOptions,
  createCssSourceOrderAppend,
  isLocalCssImportRequest,
  isMiniProgramLocalCssImportRequest,
  isPureLocalCssImportWrapper,
  isPureLocalCssImportWrapperRoot,
  normalizeOutputImportRequest,
  prefixLocalCssImportsWithWebpackIgnoreRoot,
  removeMatchingLocalCssImports,
  removeMatchingLocalCssImportsRoot,
  removeTailwindSourceDirectivesRoot,
  removeUnsupportedMiniProgramCssImportsRoot,
  restoreLocalCssImports,
  type RewriteLocalCssImportRequestOptions,
  rewriteLocalCssImportRequestsForOutput,
  rewriteLocalCssImportRequestsForOutputRoot,
  splitLocalCssImports,
  splitLocalCssImportsRoot,
} from './generator-plugin/local-imports'
export * from './handler'
export { default as postcssHtmlTransform, type IOptions as PostcssHtmlTransformOptions } from './html-transform'
export {
  createStylePipeline,
  type PipelineNodeContext,
  type PipelineNodeCursor,
  type PipelineStage,
  type ResolvedPipelineNode,
  type StyleProcessingPipeline,
} from './pipeline'
export { createFallbackPlaceholderReplacer } from './plugins/post/specificity-cleaner'
export {
  getPostcssPluginName,
  removeTailwindPostcssPlugins,
  resolveFilteredPostcssConfig,
  resolvePostcssConfig,
} from './postcss-config'
export { postcss } from './postcss-runtime'
export type {
  AcceptedPlugin,
  AtRule,
  Container,
  Declaration,
  Document,
  Helpers,
  Plugin,
  PluginCreator,
  Node as PostcssNode,
  ProcessOptions,
  Processor,
  Result,
  Root,
  Rule,
} from './postcss-runtime'
export { createInjectPreflight } from './preflight'
export { internalCssSelectorReplacer } from './shared'
export {
  collectCssInlineSourceCandidates,
  createSourceScanPattern,
  createTailwindSourceEntryMatcher,
  expandInlineSourceCandidatePattern,
  expandTailwindSourceEntries,
  FULL_SOURCE_SCAN_EXTENSION_RE,
  FULL_SOURCE_SCAN_EXTENSIONS,
  FULL_SOURCE_SCAN_PATTERN,
  isFileExcludedByTailwindSourceEntries,
  isFileMatchedByTailwindSourceEntries,
  normalizeLegacyContentEntries,
  parseConfigParam,
  parseSourceFileParam,
  resolveCssSourceEntries,
  resolveSourceScanPath,
  resolveTailwindSourceEntry,
  type TailwindInlineSourceCandidates,
  type TailwindSourceEntry,
  toPosixPath,
} from './source-scan'
export {
  createPostcssStyleTargetProfile,
  type PostcssStyleTarget,
  type PostcssStyleTargetProfile,
} from './style-targets'
export * from './types'
export {
  containsCssAfterMinify,
  dedupeCoveredCssRules,
  filterExistingCssRules,
  mergeCoveredCssRuleDeclarations,
  mergeMiniProgramPreflightRuleDeclarations,
  mergeMiniProgramThemeScopeRuleDeclarations,
} from './vite-css-rules'
export {
  composeRules as unitConversionComposeRules,
  presets as unitConversionPresets,
} from 'postcss-rule-unit-converter'
