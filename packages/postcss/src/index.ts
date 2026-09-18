export {
  type PostcssAppType,
  type PostcssStyleBranch,
  type PostcssStyleBranchProfile,
  resolvePostcssStyleBranch,
  type ResolvePostcssStyleBranchOptions,
  resolvePostcssStyleBranchProfile,
} from './branches'
export { createAuthorSelectorMatcher } from './compat/author-selector'
export {
  type DynamicColorMixAlphaProtection,
  type DynamicColorMixAlphaProtectionOptions,
  type ModernColorValueNormalization,
  normalizeModernColorValue,
  protectDynamicColorMixAlpha,
  protectDynamicVarFallbacks,
} from './compat/color-mix'
export {
  collectDedupedPostTransformCompatCss,
  collectGeneratedSelectors,
  inheritLegacyUnitConvertedDeclarations,
  normalizeCompatSelectors,
  removeGeneratedSelectorCompatCss,
  removeTailwindApplyRules,
} from './compat/legacy-css'
export { normalizeLegacyCompatCssSource, removeMiniProgramContainerCompatCss } from './compat/legacy-css/source-cleanup'
export { transformLynxCssCompat } from './compat/lynx-css'
export {
  consumeCascadeLayers,
  finalizeMiniProgramCss,
  type FinalizeMiniProgramCssOptions,
  finalizeMiniProgramCssRoot,
  finalizeMiniProgramCssStructure,
  hasEmptyCssBlockCandidate,
  hasMiniProgramCssSpecificityPlaceholders,
  hoistTailwindPreflightBase,
  normalizeMiniProgramGeneratedCssForPostcss,
  pruneMiniProgramGeneratedCss,
  removeEmptyAtRules,
  removeEmptyRules,
  removeUnsupportedAtSupports,
  removeUnsupportedCascadeLayers,
  removeUnsupportedMiniProgramAtRules,
  removeUnusedMiniProgramContentInit,
  repairTrailingUnclosedTailwindSourceMedia,
  stripMiniProgramCssSpecificityPlaceholders,
  unwrapUnsupportedCascadeLayers,
} from './compat/mini-program-css'
export { normalizeMiniProgramGeneratorCssSource, normalizeMiniProgramImportShell, removeMiniProgramOutputImports, removeSelfMiniProgramOutputImports } from './compat/mini-program-css/output-import-shell'
export {
  normalizeMiniProgramPrefixedDeclaration,
  removeUnsupportedMiniProgramPrefixedAtRule,
} from './compat/mini-program-prefixes'
export { hasNonCommentCss, isCssImportOnly, removeCommentOnlyAtRules, restoreProcessedCssImports } from './compat/processed-css/cleanup'
export { composeProcessedCssSources } from './compat/processed-css/composition'
export { removeTailwindEntryDirectivesFromCss } from './compat/processed-css/entry-directives'
export { collectImportedCssFiles, isStyleImportRequest, normalizeInjectableCssWithImports } from './compat/processed-css/imports'
export { removeCssCoveredByRootStyleSources, removeScopedTailwindPreflightCss } from './compat/scoped-css/cleanup'
export { collectRootScopedComparableCssCoverage, type ComparableCssCoverage, isRuleCoveredByRootCss } from './compat/scoped-css/coverage'
export { removeCssRulesCoveredBySources } from './compat/scoped-css/covered-rules'
export { hasScopedMiniProgramTailwindContentInitRule, hasScopedUniAppWebTailwindPreflightRule, hasUnscopedMiniProgramTailwindPreflightRule, hasVueScopedAttr, isLikelyTailwindGlobalRule, isLikelyTailwindLayerOrderAtRule, isLikelyTailwindPropertyAtRule, isScopedMiniProgramTailwindContentInitRule, isScopedUniAppWebTailwindPreflightRule, isScopedUniversalTailwindPreflightRule, isUnscopedMiniProgramTailwindPreflightRule, normalizeCssSignatureValue } from './compat/scoped-css/predicates'
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
export { compileTailwindAuthorFunctions, createTailwindAuthorFunctionProbe } from './compat/tailwindcss-v4/author-functions'
export {
  normalizeTailwindV4GeneratedUrlValues,
  transformTailwindV4CssToWeapp,
  transformTailwindV4GeneratedCss,
  transformTailwindV4WebRpxCss,
} from './compat/tailwindcss-v4/generated-output'
export { normalizeTailwindcssV4InfinityRadiusCss } from './compat/tailwindcss-v4/infinity-radius'
export { includesTailwindV4PreflightDirective, isTailwindV4CssImportParam, isTailwindV4PreflightImportParam } from './compat/tailwindcss-v4/preflight-imports'
export { removeTailwindV4PreflightImports, removeUnsupportedThemeVendorKeyframes } from './compat/tailwindcss-v4/theme-source'
export { normalizeTailwindV4RuntimeCss } from './compat/tailwindcss-v4/theme-source'
export {
  filterTailwindV4ApplyOnlyGeneratedCss,
  normalizeEmptyTailwindCustomVariants,
} from './compat/tailwindcss-v4/user-css/apply-only'
export {
  removeTailwindApplyAtRules,
  removeTailwindSourceMediaBlocks,
  terminateTailwindSourceAtRulesBeforeNextDirective,
} from './compat/tailwindcss-v4/user-css/at-rules'
export { collectRawSourceClassSelectors, normalizeCssClassSelector } from './compat/tailwindcss-v4/user-css/class-selectors'
export { hasLocalCssImport, hasTailwindApplyDirective, hasTailwindNonRootGenerationDirectives, hasTailwindRootDirectives, hasTailwindRootImportDirectives, hasTailwindSourceDirectives, normalizeTailwindConfigDirectives, normalizeTailwindSourceDirectives, normalizeTailwindSourceForGenerator, parseImportRequest, removeTailwindSourceDirectives, resolveCssEntrySource } from './compat/tailwindcss-v4/user-css/directives'
export { extractConfigRequestFromSource, extractTailwindDirectiveLines, extractTailwindSourceForPostcssFallback } from './compat/tailwindcss-v4/user-css/directives/fallback'
export { composeFrameworkProcessedCss } from './compat/tailwindcss-v4/user-css/framework-composition'
export { normalizeFrameworkProcessedUserCss } from './compat/tailwindcss-v4/user-css/framework-source'
export {
  createGeneratedThemeDeclarationResolver,
  type GeneratedThemeDeclarationResolver,
  removeBalancedAtRuleBlock,
  removeTailwindV4GeneratedUserCssArtifacts,
  removeTailwindV4GeneratorAtRulesFallback,
  TAILWIND_V4_GENERATOR_AT_RULES,
} from './compat/tailwindcss-v4/user-css/generated-cleanup'
export { isCssAlreadyRepresentedByMarkers } from './compat/tailwindcss-v4/user-css/identity'
export { createCssAppend, GENERATOR_PLACEHOLDER_MARKER_GLOBAL_RE, GENERATOR_PLACEHOLDER_MARKER_RE, hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, removeTailwindGeneratedCssByBanner, splitGeneratorPlaceholderCssBySourceOrder, splitTailwindGeneratedCssByBanner, splitTailwindV4GeneratedCss, splitTailwindV4GeneratedCssBySourceOrder, stripGeneratorPlaceholderMarkers, stripTailwindBanner, stripTailwindBanners, TAILWIND_BANNER_GLOBAL_RE, TAILWIND_BANNER_PREFIX_RE, TAILWIND_BANNER_RE, TAILWIND_GENERATED_CSS_MARKER_RE, TAILWIND_V4_BANNER_RE, VITE_MARKER_RE } from './compat/tailwindcss-v4/user-css/markers'
export { deduplicateGeneratedCssRules } from './compat/tailwindcss-v4/user-css/rule-deduplication'
export { preferScopedGeneratedCssRulesRoot } from './compat/tailwindcss-v4/user-css/scoped-rules'
export {
  preferScopedGeneratedCssRules,
} from './compat/tailwindcss-v4/user-css/scoped-rules'
export {
  collectBareSelectorUserCss,
  isCommentOnlyCss,
  removeMiniProgramHoverSelectors,
  removeMiniProgramInteractiveSelectors,
  type RemoveMiniProgramInteractiveSelectorsOptions,
  removeProcessedMiniProgramUnsupportedCss,
  removeTailwindV4GeneratorAtRules,
  stripTailwindSourceMediaFragments,
  stripUnmatchedTailwindSourceMediaCloseFragments,
  unwrapMiniProgramCascadeLayers,
} from './compat/tailwindcss-v4/user-css/source-fragments'
export { transformGeneratorUserCss } from './compat/tailwindcss-v4/user-css/transform'
export {
  extractMarkedUserLayerComponentsCss,
  mergeMarkedUserLayerComponentsCss,
  reorderMarkedUserLayerComponentsCss,
  wrapUserLayerComponentsCss,
} from './compat/tailwindcss-v4/user-css/user-layer-order'
export { analyzeApplyOnlySource } from './compat/tailwindcss-v4/user-css/user-layers'
export {
  collectApplyOnlySourceSelectors,
  extractGeneratedCssForUserLayerSelectors,
  hasOnlyApplyBackedSourceRules,
  hasUserCssLayerBlocks,
  isEmptyCustomVariantBlock,
  normalizeGeneratedSelector,
  removeCssComments,
  splitUserCssLayerBlocks,
} from './compat/tailwindcss-v4/user-css/user-layers'
export {
  normalizeUniAppXImportantApplyForSass,
  restoreUniAppXImportantApplyMarker,
  UNI_APP_X_IMPORTANT_APPLY_MARKER,
} from './compat/uni-app-x'
export { isTailwindRuntimePropertyRule, retainUniAppXAuthorApplyCss } from './compat/uni-app-x-author-apply'
export {
  createUniAppXBorderPreflight,
  hoistUniAppXBorderPreflight,
  UNI_APP_X_BORDER_PREFLIGHT_CLASS,
} from './compat/uni-app-x-border'
export {
  collectCssApplyUtilities,
  type CssClassStyleValue,
  cssToClassStyleValue,
  expandCssApplySourcesToStyleValue,
} from './compat/uni-app-x-style-value'
export { createUniAppXHarmonyApplyCssExpander } from './compat/uni-app-x/harmony-apply'
export { rewriteUniAppXStyleReferences } from './compat/uni-app-x/reference-paths'
export {
  type NormalizedWebCssCompatOptions,
  normalizeWebCssCompatOptions,
  transformWebCssCompat,
  transformWebCssSafeSelectors,
} from './compat/web-css'
export { collectWebpackBareSelectorUserCss } from './compat/webpack-css/bare-selectors'
export { isOnlyWebpackTailwindGeneratedPreflightCss, parseWebpackCssLayerNames, removeWebpackTailwindGeneratedAssetCss } from './compat/webpack-css/generated-cleanup'
export { collectGeneratedCssClassCandidates, collectWebpackAssetUserCssMarkers, collectWebpackCssRuleIdentityMarkers, hasAdditionalWebpackAssetUserCssMarkers, unescapeCssIdentifier } from './compat/webpack-css/identity'
export { dedupeMiniProgramPreflightSelectorRules, ensureWebpackMiniProgramTwContentInit, hasMiniProgramPreflightSelector, removeMiniProgramPreflightSelectorRule, removeTailwindV4StandaloneHostPreflightRule } from './compat/webpack-css/preflight'
export { isWebpackCssSourceRepresentedInAsset, isWebpackTailwindImportRequest, normalizeWebpackUserCssFallbackSource, removeWebpackGeneratorNonTailwindImports, removeWebpackUserCssFallbackImports } from './compat/webpack-css/user-source'
export { hasWebpackTailwindSourceDirectives } from './compat/webpack-css/user-source'
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
// 统一导出入口，供外部调用端按需引用核心能力
export { collectRpxThemeVariables, inspectRpxCalcUsage, type RpxCalcUsage } from './diagnostics/rpx-theme'
export { processFrameworkCss } from './framework-pipeline'
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

export {
  applyConfiguredCssCalc,
  type ApplyConfiguredCssCalcOptions,
} from './plugins/applyConfiguredCssCalc'
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
  ChildNode,
  Container,
  Declaration,
  Document,
  Helpers,
  Node,
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
export { selectorContainsPseudoClass } from './selectorParser/pseudo'
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
export {
  type CssImportSourceParam,
  type CssImportSpecifier,
  isTailwindCssImport,
  isUniAppXStyleSourceEmpty,
  parseCssImportSpecifier,
  parseCssSource,
  parseImportSourceParam,
  parseScssSource,
  parseUniAppXStyleSource,
  quoteCssImportSpecifier,
  scss,
  stringifyScssSource,
} from './syntax'
export * from './types'
export { collectCustomPropertyValues, mergeCustomPropertyValues } from './utils/custom-property-values'
export { type BundlerGeneratedCssMarkerBlock, createBundlerGeneratedCssEndMarker, createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker, parseBundlerGeneratedCssMarkerBlocks, stripBundlerGeneratedCssMarkers } from './utils/generated-css-marker'

export {
  containsCssAfterMinify,
  createCssRuleMatcher,
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
