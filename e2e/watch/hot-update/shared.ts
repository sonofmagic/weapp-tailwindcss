import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { expect } from 'vitest'
import { DEFAULT_PLUGIN_PROCESS_BUDGET_MS } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'

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
    | 'weapp-vite-tailwindcss-v3'
    | 'weapp-vite-tailwindcss-v4'
export type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo'
type MutationKind = 'template' | 'script' | 'style' | 'content'
type MutationRoundName = 'baseline-arbitrary' | 'complex-corpus' | 'hex-arbitrary' | 'issue33-arbitrary'
const BASE_REQUIRED_MUTATION_ROUNDS: MutationRoundName[] = ['baseline-arbitrary', 'complex-corpus', 'hex-arbitrary']
const ISSUE33_REQUIRED_MUTATION_ROUND: MutationRoundName = 'issue33-arbitrary'
const INDEX_HTML_RE = /index\.html$/
const SCRIPT_SOURCE_FILE_RE = /\.(?:js|ts|tsx|vue|mpx)$/
const TEMPLATE_SOURCE_FILE_RE = /\.(?:wxml|vue|mpx)$/
const ISSUE33_MODIFY_CLASS_TOKENS = [
  'bg-[#0f0]',
  'px-[256.25px]',
  'w-[calc(100%_-_24px)]',
  'bg-[rgb(98,12,45)]',
  'bg-[var(--primary-color-bg)]',
  'text-[22px]',
] as const
const INVALID_BG_HEX_WITH_SPACE_RE = /\bbg-\s+\[#?[0-9a-fA-F]{3,8}\]?/g
const INVALID_BG_UNTERMINATED_RE = /\bbg-\[[^\]]*$/gm
const INVALID_PX_UNTERMINATED_RE = /\bpx-\[[^\]]*$/gm
const INVALID_BG_INNER_SPACE_RE = /\bbg-\[[^\]\s]*\s[^\]\s]*\]/g
const INVALID_PX_INNER_SPACE_RE = /\bpx-\[[^\]\s]*\s[^\]\s]*\]/g

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

type HotUpdateMutationMetric = TemplateOrScriptMutationMetric | StyleMutationMetric

interface SubPackageMutationMetric {
  root: 'sub-normal' | 'sub-independent'
  independent: boolean
  outputWxml: string
  outputJs: string
  globalStyleOutputs: string[]
  template: TemplateOrScriptMutationMetric
  style: StyleMutationMetric
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
  subPackageMutationMetrics?: SubPackageMutationMetric[]
  summaryByMutationKind: Partial<Record<MutationKind, HotUpdateSummary>>
  initialReadyMs: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  totalMs: number
}

interface HotUpdateReport {
  summary: HotUpdateSummary
  summaryByRound: Partial<Record<MutationRoundName, HotUpdateSummary>>
  summaryByGroup: Partial<Record<WatchProjectGroup, HotUpdateSummary>>
  summaryByProject: Record<string, HotUpdateSummary>
  summaryByMutationKind: Partial<Record<MutationKind, HotUpdateSummary>>
  cases: HotUpdateCaseReport[]
}

const criticalDemoProjects = [
  'demo/gulp-tailwindcss-v3',
  'demo/gulp-tailwindcss-v4',
  'demo/mpx-tailwindcss-v3',
  'demo/mpx-tailwindcss-v4',
  'demo/taro-webpack-react-tailwindcss-v3',
  'demo/taro-webpack-react-tailwindcss-v4',
  'demo/taro-webpack-vue3-tailwindcss-v3',
  'demo/taro-webpack-vue3-tailwindcss-v4',
  'demo/taro-vite-react-tailwindcss-v3',
  'demo/taro-vite-react-tailwindcss-v4',
  'demo/taro-vite-vue3-tailwindcss-v3',
  'demo/taro-vite-vue3-tailwindcss-v4',
  'demo/uni-app-vite-tailwindcss-v3',
  'demo/uni-app-vite-tailwindcss-v4',
  'demo/weapp-vite-tailwindcss-v3',
  'demo/weapp-vite-tailwindcss-v4',
] as const

const bothCases = new Set<ConcreteWatchCaseName>(['taro-webpack-react-tailwindcss-v3', 'uni-app-vite-tailwindcss-v3'])
const noApplyValidationCases = new Set<ConcreteWatchCaseName>([
  'mpx-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
])
const noFunctionValidationCases = new Set<ConcreteWatchCaseName>([
  'mpx-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
])
const referenceDirectiveRequiredCases = new Set<ConcreteWatchCaseName>([
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v4',
  'weapp-vite-tailwindcss-v4',
])
const commentCarrierRequiredCases = new Set<ConcreteWatchCaseName>([
  'mpx-tailwindcss-v3',
  'taro-vite-react-tailwindcss-v3',
  'taro-vite-react-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v3',
  'taro-webpack-react-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v3',
  'weapp-vite-tailwindcss-v3',
  'weapp-vite-tailwindcss-v4',
])

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
    outputs.some(output => output.includes('.wxss')),
    `${label} should contain *.wxss output`,
  ).toBe(true)
}

export function resolveCaseName() {
  const value = process.env.E2E_WATCH_CASE
  if (
    value === 'gulp-tailwindcss-v3'
    || value === 'gulp-tailwindcss-v4'
    || value === 'mpx-tailwindcss-v3'
    || value === 'mpx-tailwindcss-v4'
    || value === 'taro-webpack-react-tailwindcss-v3'
    || value === 'taro-webpack-react-tailwindcss-v4'
    || value === 'taro-vite-react-tailwindcss-v3'
    || value === 'taro-vite-react-tailwindcss-v4'
    || value === 'taro-webpack-vue3-tailwindcss-v3'
    || value === 'taro-webpack-vue3-tailwindcss-v4'
    || value === 'taro-vite-vue3-tailwindcss-v3'
    || value === 'taro-vite-vue3-tailwindcss-v4'
    || value === 'uni-app-vite-tailwindcss-v3'
    || value === 'uni-app-vite-tailwindcss-v4'
    || value === 'weapp-vite-tailwindcss-v4'
    || value === 'weapp-vite-tailwindcss-v3'
    || value === 'both'
    || value === 'all'
    || value === 'demo'
  ) {
    return value
  }
  return 'all'
}

function isConcreteWatchCaseName(value: WatchCaseName): value is ConcreteWatchCaseName {
  return value !== 'all' && value !== 'both' && value !== 'demo'
}

export function resolveExpectedGroup(target: WatchCaseName): WatchProjectGroup | undefined {
  if (target === 'demo') {
    return target
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
    return true
  }

  if (caseName === 'both') {
    return bothCases.has(target)
  }

  if (caseName === 'demo') {
    return false
  }

  if (isConcreteWatchCaseName(caseName)) {
    return caseName === target
  }

  return false
}

export function shouldRunGroupedTarget(caseName: WatchCaseName, target: WatchProjectGroup) {
  return caseName === target
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
      const timedOut = typeof error === 'object' && error !== null && 'timedOut' in error
        ? Boolean((error as { timedOut?: boolean }).timedOut)
        : false
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

    for (const subPackage of oneCase.subPackageMutationMetrics ?? []) {
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

function assertHotUpdateReport(report: HotUpdateReport, target: WatchCaseName, maxHotUpdateMs: number) {
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
  expect(report.summaryByMutationKind.style?.count).toBe(report.summary.count)
  const casesWithContentMutation = report.cases.filter(
    item => item.mutationMetrics.some(metric => metric.mutationKind === 'content'),
  )
  if (casesWithContentMutation.length > 0) {
    expect(report.summaryByMutationKind.content?.count).toBe(casesWithContentMutation.length)
  }
  expect(Object.keys(report.summaryByProject).length).toBe(report.summary.count)

  const expectedGroup = resolveExpectedGroup(target)
  if (expectedGroup) {
    expect(report.summaryByGroup[expectedGroup]?.count).toBe(report.summary.count)
  }

  if (target === 'demo') {
    const projects = new Set(report.cases.map(item => item.project))
    for (const project of criticalDemoProjects) {
      expect(projects.has(project)).toBe(true)
    }
  }

  for (const item of report.cases) {
    expect(item.initialReadyMs).toBeGreaterThan(0)
    expect(item.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(item.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(item.rollbackEffectiveMs).toBeGreaterThan(0)
    expect(item.classTokens.length).toBeGreaterThan(0)
    expect(item.escapedClasses.length).toBe(item.classTokens.length)
    expect(item.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
    const hasContentMutation = item.mutationMetrics.some(metric => metric.mutationKind === 'content')
    const subPackageMutationMetrics = item.subPackageMutationMetrics ?? []
    expect(item.mutationMetrics.length).toBe(hasContentMutation ? 4 : 3)
    expect(subPackageMutationMetrics.length).toBe(2)
    expect(subPackageMutationMetrics.map(metric => metric.root).sort()).toEqual(['sub-independent', 'sub-normal'])
    expect(subPackageMutationMetrics.some(metric => metric.independent)).toBe(true)
    expect(item.summaryByMutationKind.template?.count).toBe(1)
    expect(item.summaryByMutationKind.script?.count).toBe(1)
    expect(item.summaryByMutationKind.style?.count).toBe(1)
    expect(item.summaryByMutationKind.content?.count ?? 0).toBe(hasContentMutation ? 1 : 0)
    assertHasWxssOutput(
      normalizeGlobalStyleOutputs(item.globalStyleOutputs ?? item.globalStyleOutput),
      `[${item.project}] case global style outputs`,
    )
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
    expect(complexRound?.classTokens).toEqual(expect.arrayContaining([
      '!mt-2',
      '-translate-y-1',
      'data-[state=open]:opacity-100',
      'supports-[display:grid]:grid',
      '[mask-type:luminance]',
    ]))
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
    expect(contentMetric).toBeDefined()
    expect(scriptMetric).toBeDefined()
    expect(styleMetric).toBeDefined()

    expect(templateMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(contentMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(scriptMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(templateMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(contentMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(scriptMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)

    if (contentMetric && contentMetric.mutationKind !== 'style') {
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
      expect(contentMetric.verifyEscapedIn.length).toBeGreaterThan(0)
      expect(contentMetric.verifyClassLiteralIn.length).toBeGreaterThan(0)
      expect(contentMetric.rounds.length).toBe(1)
      expect(contentMetric.rounds[0]?.roundName).toBe(ISSUE33_REQUIRED_MUTATION_ROUND)
      expect(contentMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(contentMetric.minRequiredGlobalStyleEscapedClasses)
      assertHasWxssOutput(
        normalizeGlobalStyleOutputs(contentMetric.globalStyleOutputs ?? contentMetric.globalStyleOutput),
        `[${item.project}] content mutation global style outputs`,
      )
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
      assertHasWxssOutput(
        normalizeGlobalStyleOutputs(templateMetric.globalStyleOutputs ?? templateMetric.globalStyleOutput),
        `[${item.project}] template mutation global style outputs`,
      )
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
      assertHasWxssOutput(
        normalizeGlobalStyleOutputs(scriptMetric.globalStyleOutputs ?? scriptMetric.globalStyleOutput),
        `[${item.project}] script mutation global style outputs`,
      )
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
        expect(
          sameClassLiteralHmr.stableGlobalStyleOutputs.length,
          `[${item.project}] same-class-literal should keep at least one global style output stable`,
        ).toBeGreaterThan(0)
        expect(
          sameClassLiteralHmr.changedGlobalStyleOutputs,
          `[${item.project}] same-class-literal should not rewrite global style outputs when class literal is unchanged`,
        ).toEqual([])
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
        expect(
          scriptMetric.verifiedGlobalStyleEscapedClasses.length,
          `[${item.project}] issue33 script round should hit transformed classes in wxss outputs`,
        ).toBeGreaterThan(0)
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
      expect(subPackageMetric.template.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(
        subPackageMetric.template.minRequiredGlobalStyleEscapedClasses,
      )
      expect(subPackageMetric.template.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(subPackageMetric.template.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
      expect(subPackageMetric.template.rollbackEffectiveMs).toBeGreaterThan(0)
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
      const scriptMetric = item.mutationMetrics.find(
        mutation => mutation.mutationKind === 'script',
      )
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
        expect(item.sameClassStable, `[${item.project}] same-class-literal should keep global styles stable`).toBe(true)
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
  const timeoutMs = toNumberEnv('E2E_WATCH_TIMEOUT_MS', 240000)
  const pollMs = toNumberEnv('E2E_WATCH_POLL_MS', 40)
  const maxHotUpdateMs = toNumberEnv('E2E_WATCH_MAX_HOT_UPDATE_MS', timeoutMs)
  const maxPluginProcessMs = toNumberEnv('E2E_WATCH_MAX_PLUGIN_PROCESS_MS', DEFAULT_PLUGIN_PROCESS_BUDGET_MS)
  const commandTimeoutMs = toNumberEnv(
    'E2E_WATCH_COMMAND_TIMEOUT_MS',
    Math.max(timeoutMs * 2 + 60_000, 240_000),
  )
  const skipBuild = toBoolEnv('E2E_WATCH_SKIP_BUILD', true)
  const quietSass = toBoolEnv('E2E_WATCH_QUIET_SASS', true)
  const reportFile = createReportFilePath(cwd, target)

  const args = [
    '--filter',
    'weapp-tailwindcss',
    'test:watch-hmr',
    '--',
    '--case',
    target,
    '--timeout',
    String(timeoutMs),
    '--poll',
    String(pollMs),
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

  await runWatchHmrCommand(cwd, args, commandTimeoutMs)

  const raw = await fs.readFile(reportFile, 'utf8')
  const report = JSON.parse(raw) as HotUpdateReport
  process.stdout.write(`[e2e-watch] hmr report saved: ${reportFile}\n`)
  assertHotUpdateReport(report, target, maxHotUpdateMs)

  if (isIssue33RoundProfile()) {
    const snapshotsDir = path.resolve(cwd, './benchmark/e2e-watch-hmr/snapshots')
    const entries = await fs.readdir(snapshotsDir).catch(() => [])
    const expectedPhases = [
      '-template-add-success',
      '-template-modify-success',
      '-template-delete-success',
      '-script-add-success',
      '-script-modify-success',
      '-script-delete-success',
    ]
    for (const phaseSuffix of expectedPhases) {
      expect(
        entries.some(item => item.includes(phaseSuffix)),
        `[issue33] missing snapshot phase output: ${phaseSuffix}`,
      ).toBe(true)
    }
  }
}
