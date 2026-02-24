import type { ChildProcessWithoutNullStreams } from 'node:child_process'

export type WatchProjectGroup = 'demo' | 'apps'
export type ConcreteWatchCaseName = 'taro' | 'uni' | 'mpx' | 'rax' | 'mina' | 'weapp-vite' | 'uni-app-vue3-vite' | 'uni-app-tailwindcss-v4' | 'taro-vite-tailwindcss-v4' | 'taro-app-vite' | 'taro-webpack-tailwindcss-v4' | 'taro-vue3-app' | 'taro-webpack' | 'vite-native-ts'
export type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo' | 'apps'
export const MUTATION_ROUND_NAMES = ['baseline-arbitrary', 'complex-corpus', 'hex-arbitrary', 'issue33-arbitrary'] as const
export type MutationRoundName = typeof MUTATION_ROUND_NAMES[number]
export type MutationKind = 'template' | 'script' | 'style'

export interface CliOptions {
  caseName: WatchCaseName
  timeoutMs: number
  pollMs: number
  skipBuild: boolean
  quietSass: boolean
  reportFile?: string
  maxHotUpdateMs?: number
}

export interface ClassMutationPayload {
  marker: string
  classLiteral: string
  classVariableName: string
}

export interface StyleMutationPayload {
  marker: string
  styleNeedle: string
  applyUtilities: string[]
  expectedApplyDeclarations: string[]
}

export interface MutationRoundConfig {
  name: MutationRoundName
  buildClassTokens: (seed: string) => string[]
}

export interface StyleApplyValidation {
  utilities: string[]
  expectedDeclarations: string[]
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
  forbidBgHexTruncationIn?: Array<'wxml' | 'js'>
  roundConfigs?: MutationRoundConfig[]
  mutate: (source: string, payload: ClassMutationPayload) => string
}

export interface StyleMutationConfig {
  sourceFile: string
  mutate: (source: string, payload: StyleMutationPayload) => string
}

export interface WatchCase {
  name: ConcreteWatchCaseName
  label: string
  project: string
  group: WatchProjectGroup
  minGlobalStyleEscapedClasses?: number
  requireStableGlobalStyleOnSameClassLiteral?: boolean
  cwd: string
  devScript: string
  env?: Record<string, string>
  outputWxml: string
  outputJs: string
  outputStyleCandidates: string[]
  globalStyleCandidates: string[]
  templateMutation: ClassMutationConfig
  scriptMutation: ClassMutationConfig
  styleMutation: StyleMutationConfig
}

export interface WatchSession {
  child: ChildProcessWithoutNullStreams
  ensureRunning: () => void
  lastCompileSuccessAt: () => number
  logs: () => string
  stop: () => Promise<void>
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
  rollbackOutputMs: number
  rollbackEffectiveMs: number
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
  mutationKind: 'template' | 'script'
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
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  sameClassLiteralHmr?: SameClassLiteralHmrMetrics
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
  rollbackOutputMs: number
  rollbackEffectiveMs: number
}

export interface StyleMutationMetrics {
  mutationKind: 'style'
  sourceFile: string
  outputStyle: string
  marker: string
  styleNeedle: string
  applyUtilities: string[]
  expectedApplyDeclarations: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackNeedleCleared: boolean
}

export type WatchCaseMutationMetrics = ClassMutationMetrics | StyleMutationMetrics

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
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>
  initialReadyMs: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  totalMs: number
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
    maxHotUpdateMs?: number
  }
  summary: WatchSummary
  summaryByRound: Partial<Record<MutationRoundName, WatchSummary>>
  summaryByGroup: Partial<Record<WatchProjectGroup, WatchSummary>>
  summaryByProject: Record<string, WatchSummary>
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>
  cases: WatchCaseMetrics[]
}

export const DEFAULT_STYLE_APPLY_VALIDATION: StyleApplyValidation = {
  utilities: ['font-bold', 'text-center'],
  expectedDeclarations: ['font-weight:700', 'text-align:center'],
}

export const STYLE_APPLY_UNSUPPORTED_CASES = new Set<ConcreteWatchCaseName>([
  'uni-app-tailwindcss-v4',
  'taro-vite-tailwindcss-v4',
  'taro-webpack-tailwindcss-v4',
  'taro-webpack',
])
