import type { ConcreteOrPlatformWatchCaseName } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { expect } from 'vitest'
import { buildCases, demoWatchShardCases, getBaseWatchCaseName, isDemoWatchShardName, isLocalOnlyWatchCase } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import { DEFAULT_PLUGIN_PROCESS_BUDGET_MS } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'

export type WatchProjectGroup = 'demo'
export type DemoWatchShardName
  = | 'demo-core'
    | 'demo-taro-react'
    | 'demo-taro-vue3'
    | 'demo-uni'
export type ConcreteWatchCaseName
  = ConcreteOrPlatformWatchCaseName
export type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo' | DemoWatchShardName
type MutationKind = 'template' | 'script' | 'style' | 'content'
type MutationRoundName = 'baseline-arbitrary' | 'complex-corpus' | 'hex-arbitrary' | 'issue33-arbitrary'
const BASE_REQUIRED_MUTATION_ROUNDS: MutationRoundName[] = ['baseline-arbitrary', 'complex-corpus', 'hex-arbitrary']
const ISSUE33_REQUIRED_MUTATION_ROUND: MutationRoundName = 'issue33-arbitrary'
const INDEX_HTML_RE = /index\.html$/
const SCRIPT_SOURCE_FILE_RE = /\.(?:js|ts|tsx|uts|vue|uvue|mpx)$/
const TEMPLATE_SOURCE_FILE_RE = /\.(?:wxml|vue|uvue|mpx)$/
const ISSUE33_MODIFY_CLASS_TOKENS = ['bg-[#0f0]', 'px-[256.25px]', 'w-[calc(100%_-_24px)]', 'bg-[rgb(98,12,45)]', 'bg-[var(--primary-color-bg)]', 'text-[22px]'] as const
const PATH_SEPARATOR_RE = /[\\/]+/g
const INVALID_BG_HEX_WITH_SPACE_RE = /\bbg-\s+\[#?[0-9a-fA-F]{3,8}\]?/g
const INVALID_BG_UNTERMINATED_RE = /\bbg-\[[^\]]*$/gm
const INVALID_PX_UNTERMINATED_RE = /\bpx-\[[^\]]*$/gm
const INVALID_BG_INNER_SPACE_RE = /\bbg-\[[^\]\s]*\s[^\]\s]*\]/g
const INVALID_PX_INNER_SPACE_RE = /\bpx-\[[^\]\s]*\s[^\]\s]*\]/g
const WEB_HMR_CASES = new Set<ConcreteWatchCaseName>([
  'taro-webpack-react-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
])
const WEB_SOURCE_DOM_HMR_CASES = new Set<ConcreteWatchCaseName>(['uni-app-vite-tailwindcss-v4', 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4'])
const SUBPACKAGE_HMR_CASES = new Set(
  buildCases(path.resolve(import.meta.dirname, '../../..'))
    .filter(item => (item.subPackageMutations?.length ?? 0) > 0)
    .map(item => item.name),
)

function normalizePathLike(value: string) {
  return value.replace(PATH_SEPARATOR_RE, '/')
}

interface MutationRoundReport {
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

interface HotUpdateRoundComparison {
  baselineRoundName: MutationRoundName
  candidateRoundName: MutationRoundName
  hotUpdateDeltaMs: number
  rollbackDeltaMs: number
  hotUpdateRatio: number
  rollbackRatio: number
}

interface HotUpdateSummary {
  count: number
  hotUpdateAvgMs: number
  hotUpdateMaxMs: number
  hotUpdateMinMs: number
  rollbackAvgMs: number
  rollbackMaxMs: number
  rollbackMinMs: number
}

interface TemplateOrScriptMutationMetric {
  mutationKind: 'template' | 'script' | 'content'
  sourceFile: string
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  rounds: MutationRoundReport[]
  roundComparison?: HotUpdateRoundComparison
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  globalStyleOutput?: string
  globalStyleOutputs?: string[]
  minRequiredGlobalStyleEscapedClasses: number
  verifiedGlobalStyleEscapedClasses: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  addedClassHmr?: AddedClassHmrMetric
  sameClassLiteralHmr?: SameClassLiteralHmrMetric
  commentCarrierHmr?: CommentCarrierHmrMetric
}

interface AddedClassHmrMetric {
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
  rollbackOutputMs: number
  rollbackEffectiveMs: number
}

interface SameClassLiteralHmrMetric {
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

interface CommentCarrierHmrMetric {
  marker: string
  classLiteral: string
  escapedClasses: string[]
  verifiedEscapedClasses: string[]
  minRequiredEscapedClasses: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
}

interface StyleMutationMetric {
  mutationKind: 'style'
  sourceFile: string
  outputStyle: string
  marker: string
  styleNeedle: string
  applyUtilities: string[]
  expectedApplyDeclarations: string[]
  functionNeedle?: string
  functionDeclarations: string[]
  expectedFunctionDeclarations: string[]
  forbiddenFunctionFragments: string[]
  referenceDirective?: string
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackNeedleCleared?: boolean
}

interface UserReportedHotUpdateMetric {
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
  rollbackOutputMs: number
  rollbackEffectiveMs: number
}

interface MainStyleHotUpdateMetric {
  label: string
  mutationKind: 'template' | 'script' | 'content'
  sourceFile: string
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  fromClassToken: string
  toClassToken: string
  fromEscapedClass: string
  toEscapedClass: string
  verifiedGlobalStyleEscapedClasses: string[]
  minRequiredGlobalStyleEscapedClasses: number
  rollbackVerifiedGlobalStyleRemovedClasses: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
}

type HotUpdateMutationMetric = TemplateOrScriptMutationMetric | StyleMutationMetric

interface SubPackageMutationMetric {
  root: 'sub-normal' | 'sub-independent'
  independent: boolean
  outputWxml: string
  outputJs: string
  globalStyleOutputs: string[]
  mainStyleHotUpdate: MainStyleHotUpdateMetric
  template: TemplateOrScriptMutationMetric
  style: StyleMutationMetric
}

interface SubPackageMainStyleHotUpdateMetric {
  root: 'sub-normal' | 'sub-independent'
  independent: boolean
  outputWxml: string
  outputJs: string
  globalStyleOutputs: string[]
  mainStyleHotUpdate: MainStyleHotUpdateMetric
}

interface WebHmrMetric {
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
  sourceClassReplacementSequence?: Array<{
    label: string
    from: string
    to: string
    verifiedCssIncludes: string[]
    hotUpdateEffectiveMs: number
  }>
  sourceDomReplacementSequence?: Array<{
    label: string
    from: string
    to: string
    expectedText: string
    verifiedCssIncludes: string[]
    computedStyle: Partial<Record<'color' | 'backgroundColor' | 'width' | 'height', string>>
    hotUpdateEffectiveMs: number
  }>
  totalMs: number
}

interface HotUpdateCaseReport {
  name: ConcreteWatchCaseName
  label: string
  project: string
  projectGroup: WatchProjectGroup
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  rounds: MutationRoundReport[]
  roundComparison?: HotUpdateRoundComparison
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  globalStyleOutput?: string
  globalStyleOutputs?: string[]
  mutationMetrics: HotUpdateMutationMetric[]
  mainStyleHotUpdate?: MainStyleHotUpdateMetric
  subPackageMainStyleHotUpdates?: SubPackageMainStyleHotUpdateMetric[]
  userReportedHotUpdate?: UserReportedHotUpdateMetric
  webHmr?: WebHmrMetric
  subPackageMutationMetrics?: SubPackageMutationMetric[]
  summaryByMutationKind: Partial<Record<MutationKind, HotUpdateSummary>>
  initialReadyMs: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  totalMs: number
}

interface HmrDurationTiming {
  surface: string
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs?: number
}

interface ProjectHmrDurationReport {
  project: string
  timings: HmrDurationTiming[]
}

interface HotUpdateReport {
  options?: {
    webOnly?: boolean
    mainStyleOnly?: boolean
    mainStyleSubPackageLimit?: number
  }
  summary: HotUpdateSummary
  summaryByRound: Partial<Record<MutationRoundName, HotUpdateSummary>>
  summaryByGroup: Partial<Record<WatchProjectGroup, HotUpdateSummary>>
  summaryByProject: Record<string, HotUpdateSummary>
  summaryByMutationKind: Partial<Record<MutationKind, HotUpdateSummary>>
  hmrDurations?: {
    summaryBySurface: Record<string, HotUpdateSummary>
    byProject: Record<string, ProjectHmrDurationReport>
  }
  cases: HotUpdateCaseReport[]
}

const configuredWatchCases = buildCases(path.resolve(__dirname, '../../..'))
const configuredWatchCasesByName = new Map(configuredWatchCases.map(item => [item.name, item]))
const configuredWatchCaseNames = new Set(configuredWatchCases.map(item => item.name))

const criticalDemoProjects = configuredWatchCases.filter(item => item.group === 'demo').map(item => item.project)
const criticalDemoProjectsByShard = Object.fromEntries(
  Object.entries(demoWatchShardCases).map(([shardName, shardCases]) => {
    const shardCaseNames = new Set(shardCases)
    return [
      shardName,
      configuredWatchCases
        .filter(item => shardCaseNames.has(item.name))
        .map(item => item.project),
    ]
  }),
) as Record<DemoWatchShardName, string[]>

const bothCases = new Set<ConcreteWatchCaseName>(['taro-webpack-react-tailwindcss-v4', 'uni-app-vite-tailwindcss-v4'])
const noApplyValidationCases = new Set<ConcreteWatchCaseName>(['mpx-tailwindcss-v4', 'uni-app-vite-tailwindcss-v4', 'taro-vite-react-tailwindcss-v4', 'taro-webpack-react-tailwindcss-v4', 'weapp-vite-tailwindcss-v4'])
const noFunctionValidationCases = new Set<ConcreteWatchCaseName>([
  'mpx-tailwindcss-v4',
  'uni-app-x-hbuilderx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])
const referenceDirectiveRequiredCases = new Set<ConcreteWatchCaseName>([
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'uni-app-x-hbuilderx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])
const commentCarrierRequiredCases = new Set<ConcreteWatchCaseName>(configuredWatchCases.filter(item => item.scriptMutation.mutateCommentCarrier).map(item => item.name))

interface CommentCarrierSummaryItem {
  name: ConcreteWatchCaseName
  project: string
  stableGlobalStyleRequired: boolean
  sameClassStable: boolean
  sameClassVerifiedEscapedClasses: number
  sameClassMinRequiredEscapedClasses: number
  commentCarrierVerifiedEscapedClasses: number
  commentCarrierMinRequiredEscapedClasses: number
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs: number
}

interface HotUpdateBudgetSample {
  label: string
  hotUpdateEffectiveMs: number
}

function isIssue33RoundProfile() {
  return process.env.E2E_WATCH_ROUND_PROFILE === 'issue33'
}

function isWebOnlyProfile(report?: HotUpdateReport) {
  return toBoolEnv('E2E_WATCH_WEB_ONLY', false) || report?.options?.webOnly === true
}

function isMainStyleOnlyProfile(report?: HotUpdateReport) {
  return toBoolEnv('E2E_WATCH_MAIN_STYLE_ONLY', false) || report?.options?.mainStyleOnly === true
}

function resolveRequiredMutationRounds() {
  if (isIssue33RoundProfile()) {
    return [...BASE_REQUIRED_MUTATION_ROUNDS, ISSUE33_REQUIRED_MUTATION_ROUND]
  }
  return [...BASE_REQUIRED_MUTATION_ROUNDS]
}

function toBoolEnv(name: string, fallback: boolean) {
  const value = process.env[name]
  if (value == null) {
    return fallback
  }
  return value === '1' || value === 'true'
}

function toNumberEnv(name: string, fallback: number) {
  const value = process.env[name]
  if (!value) {
    return fallback
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function resolveSelectedWatchCaseCount(target: WatchCaseName) {
  if (target === 'all') {
    return configuredWatchCases.length
  }

  if (target === 'demo') {
    return configuredWatchCases.filter(item => item.group === target).length
  }

  if (isDemoWatchShardName(target)) {
    return demoWatchShardCases[target].length
  }

  if (target === 'both') {
    return bothCases.size
  }

  if (configuredWatchCases.some(item => item.name === target)) {
    return 1
  }

  return isLocalOnlyWatchCase(target) ? 1 : 0
}

function resolveDefaultWatchCommandTimeoutMs(target: WatchCaseName, timeoutMs: number) {
  const selectedCaseCount = Math.max(1, resolveSelectedWatchCaseCount(target))
  return Math.max(timeoutMs * selectedCaseCount + 180_000, 240_000)
}

function createReportFilePath(cwd: string, target: WatchCaseName) {
  const reportDir = path.resolve(cwd, './benchmark/e2e-watch-hmr')
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
  return path.join(reportDir, `${timestamp}-${target}.json`)
}

function normalizeGlobalStyleOutputs(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value]
  }
  return []
}

function assertHasWxssOutput(outputs: string[], label: string) {
  expect(outputs.length, `${label} should have at least one global style output`).toBeGreaterThan(0)
  expect(
    outputs.some(output => /\.(?:wxss|acss|ttss)(?:$|[*?])/.test(output)),
    `${label} should contain mini-program style output`,
  ).toBe(true)
}

function shouldHaveWebHmr(item: HotUpdateCaseReport) {
  return WEB_HMR_CASES.has(getBaseWatchCaseName(item.name) ?? item.name)
}

export function resolveCaseName() {
  const value = process.env.E2E_WATCH_CASE
  if (
    value === 'gulp-tailwindcss-v4'
    || value === 'mpx-tailwindcss-v4'
    || configuredWatchCaseNames.has(value as ConcreteWatchCaseName)
    || value === 'uni-app-vite-vue3-hbuilderx-tailwindcss-v4'
    || value === 'uni-app-x-hbuilderx-tailwindcss-v4'
    || value === 'weapp-vite-tailwindcss-v4'
    || value === 'both'
    || value === 'all'
    || value === 'demo'
    || value === 'demo-core'
    || value === 'demo-taro-react'
    || value === 'demo-taro-vue3'
    || value === 'demo-uni'
  ) {
    return value
  }
  return 'all'
}

function isConcreteWatchCaseName(value: WatchCaseName): value is ConcreteWatchCaseName {
  return value !== 'all' && value !== 'both' && value !== 'demo' && !isDemoWatchShardName(value)
}

export function resolveExpectedGroup(target: WatchCaseName): WatchProjectGroup | undefined {
  if (target === 'demo' || isDemoWatchShardName(target)) {
    return 'demo'
  }

  if (target === 'both') {
    return 'demo'
  }

  if (isConcreteWatchCaseName(target)) {
    return 'demo'
  }
}

export function shouldRunTarget(caseName: WatchCaseName, target: ConcreteWatchCaseName) {
  if (caseName === 'all') {
    return !isLocalOnlyWatchCase(target)
  }

  if (caseName === 'both') {
    return bothCases.has(target)
  }

  if (caseName === 'demo') {
    return false
  }

  if (isDemoWatchShardName(caseName)) {
    return false
  }

  if (isConcreteWatchCaseName(caseName)) {
    return caseName === target || getBaseWatchCaseName(caseName) === target
  }

  return false
}

export function shouldRunGroupedTarget(caseName: WatchCaseName, target: WatchProjectGroup) {
  return caseName === target || (target === 'demo' && isDemoWatchShardName(caseName))
}

async function runWatchHmrCommand(cwd: string, args: string[], commandTimeoutMs: number) {
  const maxAttempts = Math.max(1, toNumberEnv('E2E_WATCH_MAX_ATTEMPTS', 2))
  const heartbeatIntervalMs = Math.max(30_000, toNumberEnv('E2E_WATCH_HEARTBEAT_INTERVAL_MS', 60_000))
  const env = { ...process.env }

  for (const key of Object.keys(env)) {
    if (key === 'VITEST' || key.startsWith('VITEST_')) {
      delete env[key]
    }
  }
  if (env.NODE_ENV === 'test') {
    delete env.NODE_ENV
  }
  if (env.BABEL_ENV === 'test') {
    delete env.BABEL_ENV
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const attemptStartedAt = Date.now()
    const heartbeat = setInterval(() => {
      const elapsedSeconds = Math.round((Date.now() - attemptStartedAt) / 1000)
      process.stdout.write(`[e2e-watch] watch-hmr attempt ${attempt}/${maxAttempts} still running (${elapsedSeconds}s elapsed)\n`)
    }, heartbeatIntervalMs)

    try {
      await execa('pnpm', args, {
        cwd,
        stdio: 'inherit',
        env,
        extendEnv: false,
        timeout: commandTimeoutMs,
        killSignal: 'SIGKILL',
        forceKillAfterDelay: 1000,
      })
      return
    }
    catch (error) {
      const timedOut = typeof error === 'object' && error !== null && 'timedOut' in error ? Boolean((error as { timedOut?: boolean }).timedOut) : false
      // 命令级超时通常意味着预算不足，直接重试只会重复消耗整段 CI 时间。
      if (timedOut) {
        throw error
      }
      if (attempt >= maxAttempts) {
        throw error
      }
      const message = error instanceof Error ? error.message : String(error)
      process.stdout.write(`[e2e-watch] watch-hmr attempt ${attempt} failed, retrying once: ${message}\n`)
    }
    finally {
      clearInterval(heartbeat)
    }
  }
}

function expectStyleRollbackMetric(metric: StyleMutationMetric, message: string) {
  if (metric.rollbackNeedleCleared === false) {
    expect(metric.rollbackOutputMs, `${message} fallback rollback output latency should be recorded`).toBeGreaterThanOrEqual(0)
    return
  }

  expect(metric.rollbackEffectiveMs, `${message} rollback marker clearance should be positive`).toBeGreaterThan(0)
}

function collectReportBudgetSamples(report: HotUpdateReport) {
  const samples: HotUpdateBudgetSample[] = []

  for (const oneCase of report.cases) {
    samples.push({
      label: `${oneCase.project}:case-template-preferred`,
      hotUpdateEffectiveMs: oneCase.hotUpdateEffectiveMs,
    })

    if (oneCase.webHmr) {
      samples.push({
        label: `${oneCase.project}:web-hmr`,
        hotUpdateEffectiveMs: oneCase.webHmr.hotUpdateEffectiveMs,
      })
      for (const metric of oneCase.webHmr.sourceClassReplacementSequence ?? []) {
        samples.push({
          label: `${oneCase.project}:web-source-replacement:${metric.label}`,
          hotUpdateEffectiveMs: metric.hotUpdateEffectiveMs,
        })
      }
      for (const metric of oneCase.webHmr.sourceDomReplacementSequence ?? []) {
        samples.push({
          label: `${oneCase.project}:web-source-dom-replacement:${metric.label}`,
          hotUpdateEffectiveMs: metric.hotUpdateEffectiveMs,
        })
      }
    }

    for (const mutation of oneCase.mutationMetrics) {
      if ('rounds' in mutation && Array.isArray(mutation.rounds)) {
        for (const round of mutation.rounds) {
          samples.push({
            label: `${oneCase.project}:${mutation.mutationKind}:${round.roundName}`,
            hotUpdateEffectiveMs: round.hotUpdateEffectiveMs,
          })
        }
      }
      else {
        samples.push({
          label: `${oneCase.project}:${mutation.mutationKind}`,
          hotUpdateEffectiveMs: mutation.hotUpdateEffectiveMs,
        })
      }

      if ('addedClassHmr' in mutation && mutation.addedClassHmr) {
        samples.push({
          label: `${oneCase.project}:${mutation.mutationKind}:added-class`,
          hotUpdateEffectiveMs: mutation.addedClassHmr.hotUpdateEffectiveMs,
        })
      }
      if ('sameClassLiteralHmr' in mutation && mutation.sameClassLiteralHmr) {
        samples.push({
          label: `${oneCase.project}:${mutation.mutationKind}:same-class-literal`,
          hotUpdateEffectiveMs: mutation.sameClassLiteralHmr.hotUpdateEffectiveMs,
        })
      }
      if ('commentCarrierHmr' in mutation && mutation.commentCarrierHmr) {
        samples.push({
          label: `${oneCase.project}:${mutation.mutationKind}:comment-carrier`,
          hotUpdateEffectiveMs: mutation.commentCarrierHmr.hotUpdateEffectiveMs,
        })
      }
    }

    if (oneCase.userReportedHotUpdate) {
      samples.push({
        label: `${oneCase.project}:user-reported:${oneCase.userReportedHotUpdate.label}`,
        hotUpdateEffectiveMs: oneCase.userReportedHotUpdate.hotUpdateEffectiveMs,
      })
    }

    if (oneCase.mainStyleHotUpdate) {
      samples.push({
        label: `${oneCase.project}:main-style:${oneCase.mainStyleHotUpdate.label}`,
        hotUpdateEffectiveMs: oneCase.mainStyleHotUpdate.hotUpdateEffectiveMs,
      })
    }

    for (const subPackage of oneCase.subPackageMainStyleHotUpdates ?? []) {
      samples.push({
        label: `${oneCase.project}:subpackage:${subPackage.root}:main-style:${subPackage.mainStyleHotUpdate.label}`,
        hotUpdateEffectiveMs: subPackage.mainStyleHotUpdate.hotUpdateEffectiveMs,
      })
    }

    for (const subPackage of oneCase.subPackageMutationMetrics ?? []) {
      samples.push({
        label: `${oneCase.project}:subpackage:${subPackage.root}:main-style:${subPackage.mainStyleHotUpdate.label}`,
        hotUpdateEffectiveMs: subPackage.mainStyleHotUpdate.hotUpdateEffectiveMs,
      })
      samples.push({
        label: `${oneCase.project}:subpackage:${subPackage.root}:template`,
        hotUpdateEffectiveMs: subPackage.template.hotUpdateEffectiveMs,
      })
      if (subPackage.style) {
        samples.push({
          label: `${oneCase.project}:subpackage:${subPackage.root}:style`,
          hotUpdateEffectiveMs: subPackage.style.hotUpdateEffectiveMs,
        })
      }
    }
  }

  return samples
}

function assertAllHotUpdateSamplesWithinBudget(report: HotUpdateReport, maxHotUpdateMs: number) {
  const samples = collectReportBudgetSamples(report)
  expect(samples.length, 'watch-HMR report should collect budget samples').toBeGreaterThan(0)
  for (const sample of samples) {
    expect(sample.hotUpdateEffectiveMs, `${sample.label} hot update should be positive`).toBeGreaterThan(0)
    expect(sample.hotUpdateEffectiveMs, `${sample.label} hot update should stay within ${maxHotUpdateMs}ms`).toBeLessThanOrEqual(maxHotUpdateMs)
  }
}

function expectedWebHmrDevScript(item: HotUpdateCaseReport) {
  if (item.name === 'taro-webpack-react-tailwindcss-v4') {
    return 'dev:h5'
  }
  return item.name.startsWith('taro-') ? 'build:h5' : 'dev:h5'
}

function assertWebHmrCase(item: HotUpdateCaseReport, maxHotUpdateMs: number) {
  const webHmr = item.webHmr
  expect(webHmr, `[${item.project}] should include web Tailwind HMR Playwright metrics`).toBeDefined()
  if (!webHmr) {
    throw new Error(`[${item.project}] missing web HMR metric`)
  }
  expect(webHmr.devScript).toBe(expectedWebHmrDevScript(item))
  const normalizedSourceFile = normalizePathLike(webHmr.sourceFile)
  expect(normalizedSourceFile.includes('src/pages/index/index.') || normalizedSourceFile.includes('pages/index/index.')).toBe(true)
  expect(webHmr.url).toMatch(/^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])/)
  expect(webHmr.marker).toContain(`tw-watch-web-${item.name}`)
  expect(webHmr.classLiteral).toContain('bg-[#123456]')
  expect(webHmr.classLiteral).toContain('w-[88px]')
  expect(webHmr.classLiteral).toContain('h-[44px]')
  expect(webHmr.computedStyle.backgroundColor).toBe('rgb(18, 52, 86)')
  expect(webHmr.computedStyle.width).toBe('88px')
  expect(webHmr.computedStyle.height).toBe('44px')
  expect(webHmr.initialReadyMs).toBeGreaterThan(0)
  expect(webHmr.hotUpdateEffectiveMs).toBeGreaterThan(0)
  expect(webHmr.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
  expect(webHmr.rollbackEffectiveMs).toBeGreaterThan(0)
  expect(webHmr.totalMs).toBeGreaterThanOrEqual(webHmr.hotUpdateEffectiveMs)
  if ((getBaseWatchCaseName(item.name) ?? item.name) === 'uni-app-vite-tailwindcss-v4') {
    const sourceClassReplacementSequence = webHmr.sourceClassReplacementSequence ?? []
    expect(sourceClassReplacementSequence.map(metric => metric.label)).toEqual(['bgObj bg-[#999999] to bg-[#134543]', 'bgObj bg-[#134543] to bg-[#256789]'])
    expect(sourceClassReplacementSequence[0]?.verifiedCssIncludes).toContain('134543')
    expect(sourceClassReplacementSequence[1]?.verifiedCssIncludes).toContain('256789')
    for (const metric of sourceClassReplacementSequence) {
      expect(metric.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(metric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    }
  }
  if (WEB_SOURCE_DOM_HMR_CASES.has(getBaseWatchCaseName(item.name) ?? item.name)) {
    const sourceDomReplacementSequence = webHmr.sourceDomReplacementSequence ?? []
    expect(sourceDomReplacementSequence.length, `[${item.project}] should verify source DOM H5 HMR`).toBeGreaterThanOrEqual(1)
    for (const metric of sourceDomReplacementSequence) {
      expect(metric.expectedText, `[${item.project}] source DOM HMR should record expected text`).toContain('H5-HMR')
      expect(metric.computedStyle.color, `[${item.project}] source DOM HMR should verify red text color`).toBe('rgb(255, 0, 0)')
      expect(metric.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(metric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    }
  }
}

function assertHmrDurationReport(report: HotUpdateReport, item: HotUpdateCaseReport, maxHotUpdateMs: number) {
  expect(report.hmrDurations, 'report should include per-demo HMR duration statistics').toBeDefined()
  if (isMainStyleOnlyProfile(report)) {
    expect(report.hmrDurations?.summaryBySurface[`main-style:${item.mainStyleHotUpdate?.label}`]?.count).toBeGreaterThan(0)
  }
  else {
    expect(report.hmrDurations?.summaryBySurface['template:preferred-round']?.count).toBeGreaterThan(0)
  }
  const projectDurations = report.hmrDurations?.byProject[item.project]
  expect(projectDurations, `[${item.project}] should include HMR duration timings`).toBeDefined()
  expect(projectDurations?.project).toBe(item.project)

  const timings = projectDurations?.timings ?? []
  expect(timings.length, `[${item.project}] should include HMR duration timing rows`).toBeGreaterThan(0)
  const surfaces = timings.map(timing => timing.surface)
  for (const timing of timings) {
    expect(timing.hotUpdateEffectiveMs, `[${item.project}] ${timing.surface} hot update duration`).toBeGreaterThan(0)
    expect(timing.hotUpdateEffectiveMs, `[${item.project}] ${timing.surface} hot update budget`).toBeLessThanOrEqual(maxHotUpdateMs)
    if (typeof timing.rollbackEffectiveMs === 'number') {
      expect(timing.rollbackEffectiveMs, `[${item.project}] ${timing.surface} rollback duration`).toBeGreaterThan(0)
    }
  }

  if (item.mutationMetrics.length > 0) {
    expect(surfaces).toContain('template:preferred-round')
    if (item.mutationMetrics.some(metric => metric.mutationKind === 'style')) {
      expect(surfaces).toContain('style')
    }
  }
  if (item.webHmr) {
    expect(surfaces).toContain('web')
  }
  for (const subPackage of item.subPackageMainStyleHotUpdates ?? []) {
    expect(surfaces).toContain(`subpackage:${subPackage.root}:main-style:${subPackage.mainStyleHotUpdate.label}`)
  }
  for (const subPackage of item.subPackageMutationMetrics ?? []) {
    expect(surfaces).toContain(`subpackage:${subPackage.root}:main-style:${subPackage.mainStyleHotUpdate.label}`)
    expect(surfaces).toContain(`subpackage:${subPackage.root}:template`)
    if (subPackage.style) {
      expect(surfaces).toContain(`subpackage:${subPackage.root}:style`)
    }
  }
}

function assertMainStyleHotUpdateMetric(
  metric: MainStyleHotUpdateMetric | undefined,
  label: string,
  maxHotUpdateMs: number,
  expectedMutation?: {
    sourceFile: string
    verifyEscapedIn: Array<'wxml' | 'js'>
    verifyClassLiteralIn?: Array<'wxml' | 'js'>
  },
) {
  expect(metric, `${label} should include the main-style hot-update guard`).toBeDefined()
  if (!metric) {
    throw new Error(`${label} missing main-style hot-update guard`)
  }
  expect(metric.label).toBe('text-[102.43rpx] to text-[103.43rpx]')
  expect(metric.mutationKind, `${label} main-style hot-update should edit the template carrier`).toBe('template')
  if (expectedMutation) {
    expect(normalizePathLike(metric.sourceFile), `${label} main-style hot-update should use configured mutation source`).toBe(normalizePathLike(expectedMutation.sourceFile))
    expect(metric.verifyEscapedIn, `${label} main-style hot-update should keep configured output verification`).toEqual(expectedMutation.verifyEscapedIn)
    expect(metric.verifyClassLiteralIn, `${label} main-style hot-update should keep configured literal verification`).toEqual(expectedMutation.verifyClassLiteralIn ?? [])
  }
  expect(metric.fromClassToken).toBe('text-[102.43rpx]')
  expect(metric.toClassToken).toBe('text-[103.43rpx]')
  expect(metric.fromEscapedClass).toContain('102')
  expect(metric.toEscapedClass).toContain('103')
  expect(metric.verifiedGlobalStyleEscapedClasses).toContain(metric.toEscapedClass)
  expect(metric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(metric.minRequiredGlobalStyleEscapedClasses)
  expect(metric.hotUpdateEffectiveMs).toBeGreaterThan(0)
  expect(metric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
  expect(metric.rollbackEffectiveMs).toBeGreaterThan(0)
}

function assertWebOnlyHotUpdateReport(report: HotUpdateReport, target: WatchCaseName, maxHotUpdateMs: number) {
  assertAllHotUpdateSamplesWithinBudget(report, maxHotUpdateMs)
  expect(report.options?.webOnly).toBe(true)
  expect(report.summary.count).toBeGreaterThan(0)
  expect(report.cases.length).toBe(report.summary.count)
  expect(Object.keys(report.summaryByProject).length).toBe(report.summary.count)

  const expectedGroup = resolveExpectedGroup(target)
  if (expectedGroup) {
    expect(report.summaryByGroup[expectedGroup]?.count).toBe(report.summary.count)
  }

  for (const item of report.cases) {
    expect(shouldHaveWebHmr(item), `[${item.project}] should be a configured Web/H5 HMR case`).toBe(true)
    expect(item.initialReadyMs).toBeGreaterThan(0)
    expect(item.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(item.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(item.rollbackEffectiveMs).toBeGreaterThan(0)
    expect(item.classTokens).toEqual(expect.arrayContaining(['bg-[#123456]', 'w-[88px]', 'h-[44px]']))
    expect(item.rounds).toEqual([])
    expect(item.mutationMetrics).toEqual([])
    expect(item.subPackageMutationMetrics ?? []).toEqual([])
    if (expectedGroup) {
      expect(item.projectGroup).toBe(expectedGroup)
    }
    assertWebHmrCase(item, maxHotUpdateMs)
    assertHmrDurationReport(report, item, maxHotUpdateMs)
  }
}

function assertMainStyleOnlyHotUpdateReport(report: HotUpdateReport, target: WatchCaseName, maxHotUpdateMs: number) {
  assertAllHotUpdateSamplesWithinBudget(report, maxHotUpdateMs)
  expect(report.options?.mainStyleOnly).toBe(true)
  expect(report.summary.count).toBeGreaterThan(0)
  expect(report.cases.length).toBe(report.summary.count)
  expect(Object.keys(report.summaryByProject).length).toBe(report.summary.count)

  const expectedGroup = resolveExpectedGroup(target)
  if (expectedGroup) {
    expect(report.summaryByGroup[expectedGroup]?.count).toBe(report.summary.count)
  }

  for (const item of report.cases) {
    const configuredWatchCase = configuredWatchCasesByName.get(item.name)
    expect(item.initialReadyMs).toBeGreaterThan(0)
    assertMainStyleHotUpdateMetric(item.mainStyleHotUpdate, `[${item.project}]`, maxHotUpdateMs, configuredWatchCase?.templateMutation)
    expect(item.rounds).toEqual([])
    expect(item.mutationMetrics).toEqual([])
    expect(item.subPackageMutationMetrics ?? []).toEqual([])

    const subPackageMainStyleHotUpdates = item.subPackageMainStyleHotUpdates ?? []
    if (SUBPACKAGE_HMR_CASES.has(item.name)) {
      const subPackageLimit = report.options?.mainStyleSubPackageLimit
      const expectedSubPackageCount = subPackageLimit == null ? 2 : Math.min(2, Math.max(0, subPackageLimit))
      expect(subPackageMainStyleHotUpdates.length).toBe(expectedSubPackageCount)
      if (subPackageLimit == null) {
        expect(subPackageMainStyleHotUpdates.map(metric => metric.root).sort()).toEqual(['sub-independent', 'sub-normal'])
        expect(subPackageMainStyleHotUpdates.some(metric => metric.independent)).toBe(true)
      }
    }
    for (const subPackage of subPackageMainStyleHotUpdates) {
      const configuredSubPackageMutation = configuredWatchCase?.subPackageMutations?.find(item => item.root === subPackage.root)
      assertMainStyleHotUpdateMetric(
        subPackage.mainStyleHotUpdate,
        `[${item.project}:${subPackage.root}]`,
        maxHotUpdateMs,
        configuredSubPackageMutation?.mainStyleMutation ?? configuredSubPackageMutation?.templateMutation,
      )
    }

    if (expectedGroup) {
      expect(item.projectGroup).toBe(expectedGroup)
    }
    assertHmrDurationReport(report, item, maxHotUpdateMs)
  }
}

export function assertHotUpdateReport(report: HotUpdateReport, target: WatchCaseName, maxHotUpdateMs: number) {
  if (isWebOnlyProfile(report)) {
    assertWebOnlyHotUpdateReport(report, target, maxHotUpdateMs)
    return
  }
  if (isMainStyleOnlyProfile(report)) {
    assertMainStyleOnlyHotUpdateReport(report, target, maxHotUpdateMs)
    return
  }

  const requiredMutationRounds = resolveRequiredMutationRounds()
  const issue33RoundProfile = isIssue33RoundProfile()
  assertAllHotUpdateSamplesWithinBudget(report, maxHotUpdateMs)
  expect(report.summary.count).toBeGreaterThan(0)
  expect(report.cases.length).toBe(report.summary.count)
  for (const roundName of requiredMutationRounds) {
    expect(report.summaryByRound[roundName]?.count).toBe(report.summary.count)
  }
  expect(report.summaryByMutationKind.template?.count).toBe(report.summary.count)
  expect(report.summaryByMutationKind.script?.count).toBe(report.summary.count)
  const casesWithStyleMutation = report.cases.filter(item => item.mutationMetrics.some(metric => metric.mutationKind === 'style'))
  if (casesWithStyleMutation.length > 0) {
    expect(report.summaryByMutationKind.style?.count).toBe(casesWithStyleMutation.length)
  }
  else {
    expect(report.summaryByMutationKind.style?.count ?? 0).toBe(0)
  }
  const casesWithContentMutation = report.cases.filter(item => item.mutationMetrics.some(metric => metric.mutationKind === 'content'))
  if (casesWithContentMutation.length > 0) {
    expect(report.summaryByMutationKind.content?.count).toBe(casesWithContentMutation.length)
  }
  expect(Object.keys(report.summaryByProject).length).toBe(report.summary.count)

  const expectedGroup = resolveExpectedGroup(target)
  if (expectedGroup) {
    expect(report.summaryByGroup[expectedGroup]?.count).toBe(report.summary.count)
  }

  if (target === 'demo' || isDemoWatchShardName(target)) {
    const projects = new Set(report.cases.map(item => item.project))
    const requiredProjects = target === 'demo' ? criticalDemoProjects : criticalDemoProjectsByShard[target]
    for (const project of requiredProjects) {
      expect(projects.has(project)).toBe(true)
    }
  }

  for (const item of report.cases) {
    const configuredWatchCase = configuredWatchCasesByName.get(item.name)
    expect(item.initialReadyMs).toBeGreaterThan(0)
    expect(item.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(item.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(item.rollbackEffectiveMs).toBeGreaterThan(0)
    expect(item.classTokens.length).toBeGreaterThan(0)
    expect(item.escapedClasses.length).toBe(item.classTokens.length)
    expect(item.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
    const hasContentMutation = item.mutationMetrics.some(metric => metric.mutationKind === 'content')
    const subPackageMutationMetrics = item.subPackageMutationMetrics ?? []
    const hasStyleMutation = item.mutationMetrics.some(metric => metric.mutationKind === 'style')
    expect(item.mutationMetrics.length).toBe(2 + (hasStyleMutation ? 1 : 0) + (hasContentMutation ? 1 : 0))
    if (SUBPACKAGE_HMR_CASES.has(item.name)) {
      expect(subPackageMutationMetrics.length).toBe(2)
      expect(subPackageMutationMetrics.map(metric => metric.root).sort()).toEqual(['sub-independent', 'sub-normal'])
      expect(subPackageMutationMetrics.some(metric => metric.independent)).toBe(true)
    }
    else {
      expect(subPackageMutationMetrics).toEqual([])
    }
    expect(item.summaryByMutationKind.template?.count).toBe(1)
    expect(item.summaryByMutationKind.script?.count).toBe(1)
    expect(item.summaryByMutationKind.style?.count ?? 0).toBe(hasStyleMutation ? 1 : 0)
    expect(item.summaryByMutationKind.content?.count ?? 0).toBe(hasContentMutation ? 1 : 0)
    assertHmrDurationReport(report, item, maxHotUpdateMs)
    assertHasWxssOutput(normalizeGlobalStyleOutputs(item.globalStyleOutputs ?? item.globalStyleOutput), `[${item.project}] case global style outputs`)
    assertMainStyleHotUpdateMetric(item.mainStyleHotUpdate, `[${item.project}]`, maxHotUpdateMs, configuredWatchCase?.templateMutation)
    for (const subPackage of subPackageMutationMetrics) {
      const configuredSubPackageMutation = configuredWatchCase?.subPackageMutations?.find(item => item.root === subPackage.root)
      assertMainStyleHotUpdateMetric(
        subPackage.mainStyleHotUpdate,
        `[${item.project}:${subPackage.root}]`,
        maxHotUpdateMs,
        configuredSubPackageMutation?.templateMutation,
      )
    }
    if (expectedGroup) {
      expect(item.projectGroup).toBe(expectedGroup)
    }

    const baselineRound = item.rounds.find(round => round.roundName === 'baseline-arbitrary')
    const complexRound = item.rounds.find(round => round.roundName === 'complex-corpus')
    const hexRound = item.rounds.find(round => round.roundName === 'hex-arbitrary')
    expect(baselineRound).toBeDefined()
    expect(complexRound).toBeDefined()
    expect(hexRound).toBeDefined()
    expect(baselineRound?.classTokens.length).toBeGreaterThanOrEqual(3)
    expect(complexRound?.classTokens.length).toBeGreaterThanOrEqual(12)
    expect(hexRound?.classTokens.length).toBeGreaterThanOrEqual(3)
    expect(hexRound?.classTokens.some(token => token.startsWith('bg-[#'))).toBe(true)
    expect(complexRound?.classTokens).toEqual(expect.arrayContaining(['!mt-2', '-translate-y-1', 'data-[state=open]:opacity-100', 'supports-[display:grid]:grid', '[mask-type:luminance]']))
    expect(complexRound?.classTokens.some(token => token.startsWith('w-[calc(100%_-_'))).toBe(true)
    expect(complexRound?.classTokens.some(token => token.startsWith('grid-cols-[200rpx_minmax(900rpx,_1fr)_'))).toBe(true)
    expect(complexRound?.classTokens.some(token => token.startsWith('after:ml-'))).toBe(true)
    expect(complexRound?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(complexRound?.rollbackEffectiveMs).toBeGreaterThan(0)

    if (issue33RoundProfile) {
      const issue33Round = item.rounds.find(round => round.roundName === 'issue33-arbitrary')
      expect(issue33Round?.classTokens.length).toBeGreaterThanOrEqual(ISSUE33_MODIFY_CLASS_TOKENS.length)
    }
    expect(hexRound?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(hexRound?.rollbackEffectiveMs).toBeGreaterThan(0)
    expect(item.roundComparison).toBeDefined()
    expect(item.roundComparison?.hotUpdateRatio).toBeGreaterThan(0)
    expect(item.roundComparison?.rollbackRatio).toBeGreaterThan(0)

    if (item.classTokens.length >= 12) {
      expect(item.classLiteral).toContain('text-[23.')
      expect(item.classLiteral).toContain('space-y-2.')
      expect(item.classLiteral).toContain('w-[calc(100%_-_')
      expect(item.classLiteral).toContain('grid-cols-[200rpx_minmax(900rpx,_1fr)_')
      expect(item.classLiteral).toContain('!mt-2')
      expect(item.classLiteral).toContain('-translate-y-1')
      expect(item.classLiteral).toContain('max-[712px]:p-[13px]')
      expect(item.classLiteral).toContain('bg-[rgb(12,34,56)]')
      expect(item.classLiteral).toContain('grid-rows-[auto_minmax(0,_1fr)]')
      expect(item.classLiteral).toContain('supports-[backdrop-filter:blur(2px)]:backdrop-blur-[2px]')
      expect(item.classLiteral).toContain('after:ml-')
      expect(item.classLiteral).toContain('text-black/[0.')
      expect(item.classLiteral).toContain('ring-[1.')
      expect(item.classLiteral).toContain('data-[state=open]:opacity-100')
      expect(item.classLiteral).toContain('supports-[display:grid]:grid')
      expect(item.classLiteral).toContain('[mask-type:luminance]')
    }
    else {
      expect(item.classTokens.some(token => token.startsWith('bg-[#'))).toBe(true)
      expect(item.classTokens.some(token => token.startsWith('text-['))).toBe(true)
      expect(item.classTokens.some(token => token.startsWith('h-['))).toBe(true)
    }

    const templateMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'template')
    const contentMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'content')
    const scriptMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'script')
    const styleMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'style')

    expect(templateMetric).toBeDefined()
    expect(scriptMetric).toBeDefined()
    if (hasStyleMutation) {
      expect(styleMetric).toBeDefined()
    }
    else {
      expect(styleMetric).toBeUndefined()
    }

    if (item.name === 'uni-app-vite-tailwindcss-v4') {
      const userReportedHotUpdate = item.userReportedHotUpdate
      expect(userReportedHotUpdate, `[${item.project}] should include the user reported hot-update scenario`).toBeDefined()
      if (!userReportedHotUpdate) {
        throw new Error(`[${item.project}] missing user reported hot-update metric`)
      }
      expect(normalizePathLike(userReportedHotUpdate.sourceFile)).toContain('src/pages/index/index.vue')
      expect(userReportedHotUpdate.classTokens.length).toBeGreaterThan(0)
      expect(userReportedHotUpdate.escapedClasses.length).toBe(userReportedHotUpdate.classTokens.length)
      expect(userReportedHotUpdate.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(userReportedHotUpdate.minRequiredGlobalStyleEscapedClasses)
      expect(userReportedHotUpdate.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(userReportedHotUpdate.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
      expect(userReportedHotUpdate.rollbackEffectiveMs).toBeGreaterThan(0)
      if (item.name === 'uni-app-vite-tailwindcss-v4') {
        expect(userReportedHotUpdate.label).toBe('cardsColor bg-[#4268EA] to bg-[red]')
        expect([userReportedHotUpdate.from, userReportedHotUpdate.to]).toEqual(expect.arrayContaining(['bg-[#4268EA] shadow-indigo-100', 'bg-[red] shadow-indigo-100']))
        expect(userReportedHotUpdate.classTokens.some(token => token === 'bg-[red]' || token === 'bg-[#4268EA]')).toBe(true)
      }
      if (item.name === 'uni-app-vite-tailwindcss-v4') {
        expect(userReportedHotUpdate.label).toBe('index text-[102.43rpx] to text-[103.43rpx]')
        expect([userReportedHotUpdate.from, userReportedHotUpdate.to]).toEqual(expect.arrayContaining(['text-[#00f285] text-[102.43rpx] font-bold underline', 'text-[#00f285] text-[103.43rpx] font-bold underline']))
        expect(userReportedHotUpdate.classTokens.some(token => token === 'text-[102.43rpx]' || token === 'text-[103.43rpx]')).toBe(true)
      }
    }

    if (shouldHaveWebHmr(item)) {
      assertWebHmrCase(item, maxHotUpdateMs)
    }
    else {
      expect(item.webHmr, `[${item.project}] should not include web HMR metrics`).toBeUndefined()
    }

    expect(templateMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(scriptMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(templateMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(scriptMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)

    if (contentMetric && contentMetric.mutationKind !== 'style') {
      expect(contentMetric.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(contentMetric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
      expect(contentMetric.sourceFile).not.toMatch(INDEX_HTML_RE)
      const canContainTemplate = TEMPLATE_SOURCE_FILE_RE.test(contentMetric.sourceFile)
      const canContainScript = SCRIPT_SOURCE_FILE_RE.test(contentMetric.sourceFile)
      expect(canContainTemplate || canContainScript).toBe(true)
      if (!canContainScript) {
        expect(contentMetric.verifyEscapedIn).toContain('wxml')
        expect(contentMetric.verifyClassLiteralIn).toContain('wxml')
      }
      if (!canContainTemplate) {
        expect(contentMetric.verifyEscapedIn).toContain('js')
        expect(contentMetric.verifyClassLiteralIn).toContain('js')
      }
      expect(contentMetric.verifyEscapedIn.length + contentMetric.verifyClassLiteralIn.length).toBeGreaterThan(0)
      expect(contentMetric.rounds.length).toBe(1)
      expect(contentMetric.rounds[0]?.roundName).toBe(ISSUE33_REQUIRED_MUTATION_ROUND)
      expect(contentMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(contentMetric.minRequiredGlobalStyleEscapedClasses)
      assertHasWxssOutput(normalizeGlobalStyleOutputs(contentMetric.globalStyleOutputs ?? contentMetric.globalStyleOutput), `[${item.project}] content mutation global style outputs`)
      const issue33Round = contentMetric.rounds.find(round => round.roundName === ISSUE33_REQUIRED_MUTATION_ROUND)
      expect(issue33Round).toBeDefined()
      expect(issue33Round?.classTokens.some(token => token.startsWith('bg-[#'))).toBe(true)
    }

    if (templateMetric && templateMetric.mutationKind !== 'style') {
      expect(templateMetric.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
      for (const roundName of requiredMutationRounds) {
        expect(templateMetric.rounds.some(round => round.roundName === roundName)).toBe(true)
      }
      expect(templateMetric.verifyEscapedIn.length).toBeGreaterThan(0)
      expect(templateMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(templateMetric.minRequiredGlobalStyleEscapedClasses)
      assertHasWxssOutput(normalizeGlobalStyleOutputs(templateMetric.globalStyleOutputs ?? templateMetric.globalStyleOutput), `[${item.project}] template mutation global style outputs`)
      const addedClassHmr = templateMetric.addedClassHmr
      expect(addedClassHmr).toBeDefined()
      if (!addedClassHmr) {
        throw new Error(`[${item.project}] missing addedClassHmr metric in template mutation`)
      }
      expect(addedClassHmr.addedClassTokens.length).toBeGreaterThanOrEqual(6)
      expect(addedClassHmr.addedEscapedClasses.length).toBe(addedClassHmr.addedClassTokens.length)
      expect(addedClassHmr.classLiteralAfter).toContain(addedClassHmr.classLiteralBefore)
      expect(addedClassHmr.classLiteralAfter).toContain(addedClassHmr.addedClassLiteral)
      expect(addedClassHmr.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(addedClassHmr.rollbackEffectiveMs).toBeGreaterThan(0)
      expect(addedClassHmr.verifiedAddedEscapedClasses.length).toBeGreaterThanOrEqual(addedClassHmr.minRequiredEscapedClasses)
    }

    if (scriptMetric && scriptMetric.mutationKind !== 'style') {
      expect(scriptMetric.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
      for (const roundName of requiredMutationRounds) {
        expect(scriptMetric.rounds.some(round => round.roundName === roundName)).toBe(true)
      }
      expect(scriptMetric.verifyEscapedIn).toContain('js')
      expect(scriptMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(scriptMetric.minRequiredGlobalStyleEscapedClasses)
      assertHasWxssOutput(normalizeGlobalStyleOutputs(scriptMetric.globalStyleOutputs ?? scriptMetric.globalStyleOutput), `[${item.project}] script mutation global style outputs`)
      const addedClassHmr = scriptMetric.addedClassHmr
      expect(addedClassHmr).toBeDefined()
      if (!addedClassHmr) {
        throw new Error(`[${item.project}] missing addedClassHmr metric in script mutation`)
      }
      expect(addedClassHmr.addedClassTokens.length).toBeGreaterThanOrEqual(6)
      expect(addedClassHmr.addedEscapedClasses.length).toBe(addedClassHmr.addedClassTokens.length)
      expect(addedClassHmr.classLiteralAfter).toContain(addedClassHmr.classLiteralBefore)
      expect(addedClassHmr.classLiteralAfter).toContain(addedClassHmr.addedClassLiteral)
      expect(addedClassHmr.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(addedClassHmr.rollbackEffectiveMs).toBeGreaterThan(0)
      expect(addedClassHmr.verifiedAddedEscapedClasses.length).toBeGreaterThanOrEqual(addedClassHmr.minRequiredEscapedClasses)
      const sameClassLiteralHmr = scriptMetric.sameClassLiteralHmr
      expect(sameClassLiteralHmr).toBeDefined()
      if (!sameClassLiteralHmr) {
        throw new Error(`[${item.project}] missing sameClassLiteralHmr metric in script mutation`)
      }
      expect(sameClassLiteralHmr.classLiteral).toBe(scriptMetric.classLiteral)
      expect(sameClassLiteralHmr.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(sameClassLiteralHmr.rollbackEffectiveMs).toBeGreaterThan(0)
      expect(sameClassLiteralHmr.verifiedEscapedClasses.length).toBeGreaterThanOrEqual(sameClassLiteralHmr.minRequiredEscapedClasses)
      if (sameClassLiteralHmr.stableGlobalStyleRequired) {
        expect(sameClassLiteralHmr.stableGlobalStyleOutputs.length, `[${item.project}] same-class-literal should keep at least one global style output stable`).toBeGreaterThan(0)
      }

      if (issue33RoundProfile) {
        const issue33Round = scriptMetric.rounds.find(round => round.roundName === ISSUE33_REQUIRED_MUTATION_ROUND)
        expect(issue33Round).toBeDefined()
        expect(issue33Round?.classTokens).toEqual(expect.arrayContaining([...ISSUE33_MODIFY_CLASS_TOKENS]))
        expect(issue33Round?.classLiteral).toContain(ISSUE33_MODIFY_CLASS_TOKENS[0])
        expect(issue33Round?.classLiteral).toContain(ISSUE33_MODIFY_CLASS_TOKENS[1])
        expect(issue33Round?.classLiteral ?? '').not.toMatch(INVALID_BG_HEX_WITH_SPACE_RE)
        expect(issue33Round?.classLiteral ?? '').not.toMatch(INVALID_BG_UNTERMINATED_RE)
        expect(issue33Round?.classLiteral ?? '').not.toMatch(INVALID_PX_UNTERMINATED_RE)
        expect(issue33Round?.classLiteral ?? '').not.toMatch(INVALID_BG_INNER_SPACE_RE)
        expect(issue33Round?.classLiteral ?? '').not.toMatch(INVALID_PX_INNER_SPACE_RE)
        expect(scriptMetric.verifiedGlobalStyleEscapedClasses.length, `[${item.project}] issue33 script round should hit transformed classes in wxss outputs`).toBeGreaterThan(0)
      }

      if (commentCarrierRequiredCases.has(item.name)) {
        const commentCarrierHmr = scriptMetric.commentCarrierHmr
        expect(commentCarrierHmr).toBeDefined()
        if (!commentCarrierHmr) {
          throw new Error(`[${item.project}] missing commentCarrierHmr metric in script mutation`)
        }
        expect(commentCarrierHmr.classLiteral.length).toBeGreaterThan(0)
        expect(commentCarrierHmr.hotUpdateEffectiveMs).toBeGreaterThan(0)
        expect(commentCarrierHmr.rollbackEffectiveMs).toBeGreaterThan(0)
        expect(commentCarrierHmr.verifiedEscapedClasses.length).toBeGreaterThanOrEqual(commentCarrierHmr.minRequiredEscapedClasses)
      }
    }

    if (issue33RoundProfile && templateMetric && templateMetric.mutationKind !== 'style') {
      const issue33Round = templateMetric.rounds.find(round => round.roundName === ISSUE33_REQUIRED_MUTATION_ROUND)
      expect(issue33Round).toBeDefined()
      expect(issue33Round?.classTokens).toEqual(expect.arrayContaining([...ISSUE33_MODIFY_CLASS_TOKENS]))
    }

    if (styleMetric && styleMetric.mutationKind === 'style') {
      expect(styleMetric.outputStyle).toContain('.wxss')
      expect(styleMetric.styleNeedle).toContain('.tw-watch-style-')
      if (noApplyValidationCases.has(item.name)) {
        expect(styleMetric.applyUtilities.length).toBe(0)
        expect(styleMetric.expectedApplyDeclarations.length).toBe(0)
      }
      else {
        expect(styleMetric.applyUtilities.length).toBeGreaterThan(0)
        expect(styleMetric.expectedApplyDeclarations.length).toBeGreaterThan(0)
      }
      if (noFunctionValidationCases.has(item.name)) {
        expect(styleMetric.functionNeedle).toBeUndefined()
        expect(styleMetric.functionDeclarations.length).toBe(0)
        expect(styleMetric.expectedFunctionDeclarations.length).toBe(0)
        expect(styleMetric.forbiddenFunctionFragments.length).toBe(0)
      }
      else {
        expect(styleMetric.functionNeedle).toContain('.tw-watch-style-')
        expect(styleMetric.functionDeclarations.length).toBeGreaterThan(0)
        expect(styleMetric.expectedFunctionDeclarations.length).toBeGreaterThan(0)
        expect(styleMetric.forbiddenFunctionFragments).toContain('theme(')
      }
      if (referenceDirectiveRequiredCases.has(item.name)) {
        expect(styleMetric.referenceDirective).toBe('@reference "tailwindcss";')
      }
      else {
        expect(styleMetric.referenceDirective).toBeUndefined()
      }
      expect(styleMetric.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expectStyleRollbackMetric(styleMetric, `[${item.name}] style`)
      expect(styleMetric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    }

    for (const subPackageMetric of subPackageMutationMetrics) {
      expect(subPackageMetric.outputWxml).toContain(subPackageMetric.root)
      expect(subPackageMetric.outputJs).toContain(subPackageMetric.root)
      expect(subPackageMetric.globalStyleOutputs.length).toBeGreaterThan(0)
      expect(subPackageMetric.template.sourceFile).toContain(subPackageMetric.root)
      expect(subPackageMetric.template.marker).toContain('tw-watch-subpackage-')
      expect(subPackageMetric.template.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
      expect(subPackageMetric.template.verifyEscapedIn.length + subPackageMetric.template.verifyClassLiteralIn.length).toBeGreaterThan(0)
      expect(subPackageMetric.template.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(subPackageMetric.template.minRequiredGlobalStyleEscapedClasses)
      expect(subPackageMetric.template.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(subPackageMetric.template.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
      expect(subPackageMetric.template.rollbackEffectiveMs).toBeGreaterThan(0)
      if (!subPackageMetric.style) {
        continue
      }
      expect(subPackageMetric.style.sourceFile).toContain(subPackageMetric.root)
      expect(subPackageMetric.globalStyleOutputs).toContain(subPackageMetric.style.outputStyle)
      expect(subPackageMetric.style.styleNeedle).toContain('.tw-watch-style-')
      if (!noApplyValidationCases.has(item.name)) {
        expect(subPackageMetric.style.applyUtilities.length).toBeGreaterThan(0)
        expect(subPackageMetric.style.expectedApplyDeclarations.length).toBeGreaterThan(0)
      }
      expect(subPackageMetric.style.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(subPackageMetric.style.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
      expectStyleRollbackMetric(subPackageMetric.style, `[${item.name}/${subPackageMetric.root}] subpackage style`)
      if (subPackageMetric.independent) {
        expect(subPackageMetric.root).toBe('sub-independent')
      }
    }
  }

  const commentCarrierSummary: CommentCarrierSummaryItem[] = report.cases
    .filter(item => commentCarrierRequiredCases.has(item.name))
    .map((item) => {
      const scriptMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'script')
      if (!scriptMetric || scriptMetric.mutationKind === 'style') {
        throw new Error(`[${item.project}] missing script metric for comment-carrier summary`)
      }
      if (!scriptMetric.sameClassLiteralHmr) {
        throw new Error(`[${item.project}] missing sameClassLiteralHmr for comment-carrier summary`)
      }
      if (!scriptMetric.commentCarrierHmr) {
        throw new Error(`[${item.project}] missing commentCarrierHmr for comment-carrier summary`)
      }
      return {
        name: item.name,
        project: item.project,
        stableGlobalStyleRequired: scriptMetric.sameClassLiteralHmr.stableGlobalStyleRequired,
        sameClassStable: scriptMetric.sameClassLiteralHmr.changedGlobalStyleOutputs.length === 0,
        sameClassVerifiedEscapedClasses: scriptMetric.sameClassLiteralHmr.verifiedEscapedClasses.length,
        sameClassMinRequiredEscapedClasses: scriptMetric.sameClassLiteralHmr.minRequiredEscapedClasses,
        commentCarrierVerifiedEscapedClasses: scriptMetric.commentCarrierHmr.verifiedEscapedClasses.length,
        commentCarrierMinRequiredEscapedClasses: scriptMetric.commentCarrierHmr.minRequiredEscapedClasses,
        hotUpdateEffectiveMs: scriptMetric.commentCarrierHmr.hotUpdateEffectiveMs,
        rollbackEffectiveMs: scriptMetric.commentCarrierHmr.rollbackEffectiveMs,
      }
    })
    .sort((left, right) => left.project.localeCompare(right.project))

  if (commentCarrierSummary.length > 0) {
    expect(
      commentCarrierSummary.map(item => item.project),
      '[comment-carrier] summary should cover all current-report required projects in stable order',
    ).toEqual([...commentCarrierSummary.map(item => item.project)].sort((left, right) => left.localeCompare(right)))
    for (const item of commentCarrierSummary) {
      if (item.stableGlobalStyleRequired) {
        expect(item.sameClassVerifiedEscapedClasses, `[${item.project}] same-class-literal should keep transformed classes verifiable`).toBeGreaterThan(0)
      }
      expect(item.sameClassVerifiedEscapedClasses, `[${item.project}] same-class-literal should verify escaped classes`).toBeGreaterThanOrEqual(item.sameClassMinRequiredEscapedClasses)
      expect(item.commentCarrierVerifiedEscapedClasses, `[${item.project}] comment-carrier should verify escaped classes`).toBeGreaterThanOrEqual(item.commentCarrierMinRequiredEscapedClasses)
      expect(item.hotUpdateEffectiveMs, `[${item.project}] comment-carrier hot update should be positive`).toBeGreaterThan(0)
      expect(item.rollbackEffectiveMs, `[${item.project}] comment-carrier rollback should be positive`).toBeGreaterThan(0)
    }
  }
}

export async function runHotUpdateTarget(target: WatchCaseName) {
  const cwd = path.resolve(__dirname, '../..')
  const caseName = resolveCaseName()
  const runTarget = isConcreteWatchCaseName(caseName) && getBaseWatchCaseName(caseName) === target
    ? caseName
    : target
  const timeoutMs = toNumberEnv('E2E_WATCH_TIMEOUT_MS', 240000)
  const pollMs = toNumberEnv('E2E_WATCH_POLL_MS', 40)
  const maxHotUpdateMs = toNumberEnv('E2E_WATCH_MAX_HOT_UPDATE_MS', timeoutMs)
  const maxPluginProcessMs = toNumberEnv('E2E_WATCH_MAX_PLUGIN_PROCESS_MS', DEFAULT_PLUGIN_PROCESS_BUDGET_MS)
  const commandTimeoutMs = toNumberEnv('E2E_WATCH_COMMAND_TIMEOUT_MS', resolveDefaultWatchCommandTimeoutMs(runTarget, timeoutMs))
  const skipBuild = toBoolEnv('E2E_WATCH_SKIP_BUILD', true)
  const quietSass = toBoolEnv('E2E_WATCH_QUIET_SASS', true)
  const mainStyleOnly = toBoolEnv('E2E_WATCH_MAIN_STYLE_ONLY', false)
  const mainStyleSubPackageLimit = process.env.E2E_WATCH_MAIN_STYLE_SUBPACKAGE_LIMIT
  const reportFile = createReportFilePath(cwd, runTarget)

  const args = [
    '--filter',
    'weapp-tailwindcss',
    'test:watch-hmr',
    '--',
    '--case',
    runTarget,
    '--timeout',
    String(timeoutMs),
    '--poll',
    String(pollMs),
    '--max-hot-update-ms',
    String(maxHotUpdateMs),
    '--max-plugin-process-ms',
    String(maxPluginProcessMs),
    '--report',
    reportFile,
  ]

  if (skipBuild) {
    args.push('--skip-build')
  }

  if (quietSass) {
    args.push('--quiet-sass')
  }

  if (isWebOnlyProfile()) {
    args.push('--web-only')
  }

  if (mainStyleOnly) {
    args.push('--main-style-only')
  }

  if (mainStyleSubPackageLimit) {
    args.push('--main-style-subpackage-limit', mainStyleSubPackageLimit)
  }

  await runWatchHmrCommand(cwd, args, commandTimeoutMs)

  const raw = await fs.readFile(reportFile, 'utf8')
  const report = JSON.parse(raw) as HotUpdateReport
  process.stdout.write(`[e2e-watch] hmr report saved: ${reportFile}\n`)
  assertHotUpdateReport(report, runTarget, maxHotUpdateMs)

  if (isIssue33RoundProfile()) {
    const snapshotsDir = path.resolve(cwd, './benchmark/e2e-watch-hmr/snapshots')
    const entries = await fs.readdir(snapshotsDir).catch(() => [])
    const expectedPhases = ['-template-add-success', '-template-modify-success', '-template-delete-success', '-script-add-success', '-script-modify-success', '-script-delete-success']
    for (const phaseSuffix of expectedPhases) {
      expect(
        entries.some(item => item.includes(phaseSuffix)),
        `[issue33] missing snapshot phase output: ${phaseSuffix}`,
      ).toBe(true)
    }
  }
}
