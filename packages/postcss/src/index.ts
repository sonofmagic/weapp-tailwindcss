// 统一导出入口，供外部调用端按需引用核心能力
export {
  type DynamicColorMixAlphaProtection,
  type DynamicColorMixAlphaProtectionOptions,
  type ModernColorValueNormalization,
  normalizeModernColorValue,
  protectDynamicColorMixAlpha,
} from './compat/color-mix'
export {
  finalizeMiniProgramCss,
  hasMiniProgramCssSpecificityPlaceholders,
  hoistTailwindPreflightBase,
  pruneMiniProgramGeneratedCss,
  removeUnsupportedAtSupports,
  removeUnsupportedCascadeLayers,
  removeUnsupportedMiniProgramAtRules,
  stripMiniProgramCssSpecificityPlaceholders,
} from './compat/mini-program-css'
export {
  normalizeMiniProgramPrefixedDeclaration,
  removeUnsupportedMiniProgramPrefixedAtRule,
} from './compat/mini-program-prefixes'
export {
  normalizeTailwindcssRpxDeclaration,
  normalizeTailwindcssRpxDeclarations,
} from './compat/tailwindcss-rpx'
export {
  compileCssMacroConditionalComments,
  CSS_MACRO_STYLE_OPTIONS_MARKER,
  hasCssMacroStyleOptions,
  hasCssMacroTailwindV4Directive,
  transformCssMacroCss,
  withCssMacroStyleOptions,
} from './css-macro/auto'
export { CSS_MACRO_POSTCSS_PLUGIN_NAME, default as cssMacroPostcssPlugin } from './css-macro/postcss'
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
export * from './types'
export {
  containsCssAfterMinify,
  filterExistingCssRules,
  mergeCoveredCssRuleDeclarations,
  mergeMiniProgramPreflightRuleDeclarations,
  mergeMiniProgramThemeScopeRuleDeclarations,
} from './vite-css-rules'
export {
  composeRules as unitConversionComposeRules,
  presets as unitConversionPresets,
} from 'postcss-rule-unit-converter'
