import type { ChildProcessWithoutNullStreams } from 'node:child_process'

export type WatchProjectGroup = 'demo'
export type ConcreteWatchCaseName
  = | 'gulp-tailwindcss-v3'
    | 'gulp-tailwindcss-v4'
    | 'mpx-tailwindcss-v3'
    | 'mpx-tailwindcss-v4'
    | 'taro-webpack-react-tailwindcss-v3'
    | 'taro-webpack-react-tailwindcss-v4'
    | 'taro-vite-react-tailwindcss-v3'
    | 'taro-vite-react-tailwindcss-v4'
    | 'taro-webpack-vue3-tailwindcss-v3'
    | 'taro-webpack-vue3-tailwindcss-v4'
    | 'taro-vite-vue3-tailwindcss-v3'
    | 'taro-vite-vue3-tailwindcss-v4'
    | 'uni-app-vite-tailwindcss-v3'
    | 'uni-app-vite-tailwindcss-v4'
    | 'uni-app-vite-vue3-hbuilderx-tailwindcss-v3'
    | 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4'
    | 'weapp-vite-tailwindcss-v3'
    | 'weapp-vite-tailwindcss-v4'
export type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo'
export const MUTATION_ROUND_NAMES = ['baseline-arbitrary', 'complex-corpus', 'hex-arbitrary', 'issue33-arbitrary'] as const
export const DEFAULT_HOT_UPDATE_BUDGET_MS = 1000
export const PREFERRED_HOT_UPDATE_TARGET_MS = 1000
export const DEFAULT_PLUGIN_PROCESS_BUDGET_MS = 500
export type MutationRoundName = typeof MUTATION_ROUND_NAMES[number]
export type MutationKind = 'template' | 'script' | 'style' | 'content'
export type ClassMutationKind = 'template' | 'script' | 'content'

export interface CliOptions {
  caseName: WatchCaseName
  timeoutMs: number
  pollMs: number
  skipBuild: boolean
  quietSass: boolean
  webOnly: boolean
  reportFile?: string
  maxHotUpdateMs?: number
  maxPluginProcessMs?: number
}

export interface PluginProcessSample {
  at: number
  bundler: string
  phase: string
  durationMs: number
  file?: string
  metric?: 'hook' | 'total'
  wallMs?: number
}

export interface ClassMutationPayload {
  marker: string
  classLiteral: string
  classVariableName: string
}

export interface StyleMutationPayload {
  marker: string
  styleNeedle: string
  outputNeedles: string[]
  rollbackNeedles: string[]
  applyUtilities: string[]
  expectedApplyDeclarations: string[]
  expectedApplyDeclarationGroups: string[][]
  functionNeedle?: string
  functionDeclarations: string[]
  expectedFunctionDeclarations: string[]
  forbiddenFunctionFragments: string[]
  referenceDirective?: string
}

export interface MutationRoundConfig {
  name: MutationRoundName
  buildClassTokens: (seed: string) => string[]
  buildModifyClassTokens?: (seed: string) => string[]
}

export interface StyleApplyValidation {
  utilities: string[]
  expectedDeclarations: string[]
  expectedDeclarationGroups?: string[][]
}

export interface MutationScenario extends ClassMutationPayload {
  roundName: MutationRoundName
  classTokens: string[]
  escapedClasses: string[]
  freshEscapedClasses: string[]
  mutatedSource: string
}

export interface ClassMutationConfig {
  sourceFile: string
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn?: Array<'wxml' | 'js'>
  verifyAllEscapedClasses?: boolean
  verifyAllClassLiterals?: boolean
  forbidBgHexTruncationIn?: Array<'wxml' | 'js'>
  roundConfigs?: MutationRoundConfig[]
  mutate: (source: string, payload: ClassMutationPayload) => string
  mutateCommentCarrier?: (source: string, payload: ClassMutationPayload) => string
}

export interface StyleMutationConfig {
  sourceFile: string
  verifyOutputCandidates?: string[]
  validateApply?: boolean
  validateFunction?: boolean
  outputNeedles?: (payload: StyleMutationPayload) => string[]
  rollbackNeedles?: (payload: StyleMutationPayload) => string[]
  mutate: (source: string, payload: StyleMutationPayload) => string
}

export interface UserReportedHotUpdateConfig {
  label: string
  sourceFile: string
  before: string
  after: string
  beforeClassTokens: string[]
  afterClassTokens: string[]
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn?: Array<'wxml' | 'js'>
  minRequiredGlobalStyleEscapedClasses?: number
}

export interface WatchCase {
  name: ConcreteWatchCaseName
  label: string
  project: string
  group: WatchProjectGroup
  requireInitialCompileSuccess?: boolean
  initialMutationDelayMs?: number
  initialBuildScript?: string
  maxPluginProcessMs?: number
  minGlobalStyleEscapedClasses?: number
  requireStableGlobalStyleOnSameClassLiteral?: boolean
  cwd: string
  devScript: string
  env?: Record<string, string>
  outputWxml: string
  outputJs: string
  outputStyleCandidates: string[]
  globalStyleCandidates: string[]
  contentMutation?: ClassMutationConfig
  userReportedHotUpdate?: UserReportedHotUpdateConfig
  templateMutation: ClassMutationConfig
  scriptMutation: ClassMutationConfig
  styleMutation: StyleMutationConfig
  subPackageMutations?: SubPackageMutationConfig[]
  skipStyleMutation?: boolean
  webHmr?: WebHmrConfig
}

export interface SubPackageMutationConfig {
  root: 'sub-normal' | 'sub-independent'
  independent: boolean
  outputWxml: string
  outputJs: string
  outputStyleCandidates: string[]
  globalStyleCandidates: string[]
  minGlobalStyleEscapedClasses?: number
  templateMutation: ClassMutationConfig
  styleMutation: StyleMutationConfig
  skipStyleMutation?: boolean
}

export interface WebHmrConfig {
  devScript: string
  devArgs?: string[]
  sourceFile: string
  cssEntryFile?: string
  injectMarkerElement?: boolean
  readySelector?: string
  initialMutationDelayMs?: number
  reloadAfterCssMutation?: boolean
  mutate: (source: string, payload: ClassMutationPayload) => string
  env?: Record<string, string>
  classLiteral?: string
  rollbackClassLiteral?: string
  expectedStyle?: Partial<Record<'backgroundColor' | 'width' | 'height', string>>
  rollbackExpectedStyle?: Partial<Record<'backgroundColor' | 'width' | 'height', string>>
  sourceClassReplacementSequence?: WebHmrSourceClassReplacement[]
}

export interface WebHmrSourceClassReplacement {
  label: string
  from: string
  to: string
  expectedCssIncludes?: string[]
}

export interface WatchSession {
  child: ChildProcessWithoutNullStreams
  ensureRunning: () => void
  lastCompileSuccessAt: () => number
  logs: () => string
  stop: () => Promise<void>
  pluginProcessSamplesSince: (startedAt: number) => PluginProcessSample[]
}

export interface OutputMtime {
  wxml: number
  js: number
}

export interface MutationRoundMetrics {
  roundName: MutationRoundName
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
  totalMs: number
}

export interface WatchCaseRoundComparison {
  baselineRoundName: MutationRoundName
  candidateRoundName: MutationRoundName
  hotUpdateDeltaMs: number
  rollbackDeltaMs: number
  hotUpdateRatio: number
  rollbackRatio: number
}

export interface ClassMutationMetrics {
  mutationKind: ClassMutationKind
  sourceFile: string
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  rounds: MutationRoundMetrics[]
  roundComparison?: WatchCaseRoundComparison
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  globalStyleOutputs: string[]
  minRequiredGlobalStyleEscapedClasses: number
  verifiedGlobalStyleEscapedClasses: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
  addedClassHmr?: AddedClassHmrMetrics
  sameClassLiteralHmr?: SameClassLiteralHmrMetrics
  commentCarrierHmr?: CommentCarrierHmrMetrics
}

export interface AddedClassHmrMetrics {
  markerBefore: string
  markerAfter: string
  classLiteralBefore: string
  classLiteralAfter: string
  addedClassLiteral: string
  addedClassTokens: string[]
  addedEscapedClasses: string[]
  verifiedAddedEscapedClasses: string[]
  minRequiredEscapedClasses: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
}

export interface SameClassLiteralHmrMetrics {
  markerBefore: string
  markerAfter: string
  classLiteral: string
  escapedClasses: string[]
  verifiedEscapedClasses: string[]
  minRequiredEscapedClasses: number
  stableGlobalStyleRequired: boolean
  stableGlobalStyleOutputs: string[]
  changedGlobalStyleOutputs: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
}

export interface CommentCarrierHmrMetrics {
  marker: string
  classLiteral: string
  escapedClasses: string[]
  verifiedEscapedClasses: string[]
  minRequiredEscapedClasses: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
}

export interface StyleMutationMetrics {
  mutationKind: 'style'
  sourceFile: string
  outputStyle: string
  marker: string
  styleNeedle: string
  outputNeedles: string[]
  rollbackNeedles: string[]
  applyUtilities: string[]
  expectedApplyDeclarations: string[]
  expectedApplyDeclarationGroups: string[][]
  functionNeedle?: string
  functionDeclarations: string[]
  expectedFunctionDeclarations: string[]
  forbiddenFunctionFragments: string[]
  referenceDirective?: string
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
  rollbackNeedleCleared: boolean
}

export interface UserReportedHotUpdateMetrics {
  label: string
  sourceFile: string
  from: string
  to: string
  classTokens: string[]
  escapedClasses: string[]
  verifiedGlobalStyleEscapedClasses: string[]
  minRequiredGlobalStyleEscapedClasses: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
}

export type WatchCaseMutationMetrics = ClassMutationMetrics | StyleMutationMetrics

export interface SubPackageMutationMetrics {
  root: SubPackageMutationConfig['root']
  independent: boolean
  outputWxml: string
  outputJs: string
  globalStyleOutputs: string[]
  template: ClassMutationMetrics
  style?: StyleMutationMetrics
}

export interface WatchSummary {
  count: number
  hotUpdateAvgMs: number
  hotUpdateMaxMs: number
  hotUpdateMinMs: number
  rollbackAvgMs: number
  rollbackMaxMs: number
  rollbackMinMs: number
}

export interface WatchCaseMetrics {
  name: WatchCase['name']
  label: string
  project: string
  projectGroup: WatchProjectGroup
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  rounds: MutationRoundMetrics[]
  roundComparison?: WatchCaseRoundComparison
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  globalStyleOutputs: string[]
  mutationMetrics: WatchCaseMutationMetrics[]
  userReportedHotUpdate?: UserReportedHotUpdateMetrics
  webHmr?: WebHmrMetrics
  subPackageMutationMetrics: SubPackageMutationMetrics[]
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>
  initialReadyMs: number
  maxPluginProcessMs?: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  hotUpdatePluginProcessMs: number
  hotUpdatePluginProcessSamples: PluginProcessSample[]
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackPluginProcessMs: number
  rollbackPluginProcessSamples: PluginProcessSample[]
  totalMs: number
}

export interface WebHmrMetrics {
  devScript: string
  sourceFile: string
  url: string
  marker: string
  classLiteral: string
  computedStyle: {
    backgroundColor: string
    width: string
    height: string
  }
  initialReadyMs: number
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs: number
  sourceClassReplacementSequence?: WebHmrSourceClassReplacementMetrics[]
  totalMs: number
}

export interface WebHmrSourceClassReplacementMetrics {
  label: string
  from: string
  to: string
  verifiedCssIncludes: string[]
  hotUpdateEffectiveMs: number
}

export interface WatchReport {
  generatedAt: string
  repositoryRoot: string
  options: {
    caseName: CliOptions['caseName']
    timeoutMs: number
    pollMs: number
    skipBuild: boolean
    quietSass: boolean
    webOnly: boolean
    maxHotUpdateMs?: number
    maxPluginProcessMs?: number
  }
  summary: WatchSummary
  summaryByRound: Partial<Record<MutationRoundName, WatchSummary>>
  summaryByGroup: Partial<Record<WatchProjectGroup, WatchSummary>>
  summaryByProject: Record<string, WatchSummary>
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>
  cases: WatchCaseMetrics[]
}

export const DEFAULT_STYLE_APPLY_VALIDATION: StyleApplyValidation = {
  utilities: ['font-bold', 'text-center', 'bg-[#123456]', 'px-[12px]'],
  expectedDeclarations: [
    'font-weight:',
    'text-align:',
    'background-color:',
  ],
  expectedDeclarationGroups: [
    ['padding-inline:', 'padding-left:'],
    ['padding-inline:', 'padding-right:'],
  ],
}

export const STYLE_APPLY_UNSUPPORTED_CASES = new Set<ConcreteWatchCaseName>([
  'mpx-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])

export const STYLE_FUNCTION_UNSUPPORTED_CASES = new Set<ConcreteWatchCaseName>([
  'mpx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])

export const STYLE_REFERENCE_REQUIRED_CASES = new Set<ConcreteWatchCaseName>([
  'gulp-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'mpx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])
