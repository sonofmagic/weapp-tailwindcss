import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { expect } from 'vitest'

export type WatchProjectGroup = 'demo' | 'apps'
export type ConcreteWatchCaseName = 'taro' | 'uni' | 'mpx' | 'rax' | 'mina' | 'weapp-vite' | 'uni-app-vue3-vite' | 'uni-app-tailwindcss-v4' | 'taro-vite-tailwindcss-v4' | 'taro-app-vite' | 'taro-webpack-tailwindcss-v4' | 'taro-vue3-app' | 'taro-webpack' | 'vite-native-ts'
export type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo' | 'apps'
type MutationKind = 'template' | 'script' | 'style'
type MutationRoundName = 'baseline-arbitrary' | 'complex-corpus' | 'hex-arbitrary' | 'issue33-arbitrary'
const BASE_REQUIRED_MUTATION_ROUNDS: MutationRoundName[] = ['baseline-arbitrary', 'complex-corpus', 'hex-arbitrary']
const ISSUE33_REQUIRED_MUTATION_ROUND: MutationRoundName = 'issue33-arbitrary'
const ISSUE33_MODIFY_CLASS_TOKENS = ['bg-[#0f0f0f]', 'px-[256.25px]'] as const
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
  mutationKind: 'template' | 'script'
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
  sameClassLiteralHmr?: SameClassLiteralHmrMetric
  commentCarrierHmr?: CommentCarrierHmrMetric
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
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackNeedleCleared?: boolean
}

type HotUpdateMutationMetric = TemplateOrScriptMutationMetric | StyleMutationMetric

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
  'demo/uni-app-vue3-vite',
  'demo/uni-app-tailwindcss-v4',
  'demo/taro-vite-tailwindcss-v4',
  'demo/taro-app-vite',
  'demo/taro-webpack-tailwindcss-v4',
  'demo/taro-vue3-app',
] as const

const bothCases = new Set<ConcreteWatchCaseName>(['taro', 'uni'])
const noApplyValidationCases = new Set<ConcreteWatchCaseName>([
  'uni-app-tailwindcss-v4',
  'taro-vite-tailwindcss-v4',
  'taro-webpack-tailwindcss-v4',
  'taro-webpack',
])
const commentCarrierRequiredCases = new Set<ConcreteWatchCaseName>([
  'mpx',
  'taro-webpack',
  'taro-app-vite',
  'taro-vite-tailwindcss-v4',
  'taro-webpack-tailwindcss-v4',
  'uni',
  'uni-app-vue3-vite',
  'vite-native-ts',
  'weapp-vite',
])

interface CommentCarrierSummaryItem {
  name: ConcreteWatchCaseName
  project: string
  sameClassStable: boolean
  sameClassVerifiedEscapedClasses: number
  sameClassMinRequiredEscapedClasses: number
  commentCarrierVerifiedEscapedClasses: number
  commentCarrierMinRequiredEscapedClasses: number
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs: number
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
    value === 'taro'
    || value === 'uni'
    || value === 'mpx'
    || value === 'rax'
    || value === 'mina'
    || value === 'weapp-vite'
    || value === 'uni-app-vue3-vite'
    || value === 'uni-app-tailwindcss-v4'
    || value === 'taro-vite-tailwindcss-v4'
    || value === 'taro-app-vite'
    || value === 'taro-webpack-tailwindcss-v4'
    || value === 'taro-vue3-app'
    || value === 'taro-webpack'
    || value === 'vite-native-ts'
    || value === 'both'
    || value === 'all'
    || value === 'demo'
    || value === 'apps'
  ) {
    return value
  }
  return 'all'
}

function isConcreteWatchCaseName(value: WatchCaseName): value is ConcreteWatchCaseName {
  return value !== 'all' && value !== 'both' && value !== 'demo' && value !== 'apps'
}

export function resolveExpectedGroup(target: WatchCaseName): WatchProjectGroup | undefined {
  if (target === 'demo' || target === 'apps') {
    return target
  }

  if (target === 'both') {
    return 'demo'
  }

  if (target === 'taro-webpack' || target === 'vite-native-ts') {
    return 'apps'
  }

  if (
    target === 'taro'
    || target === 'uni'
    || target === 'mpx'
    || target === 'rax'
    || target === 'mina'
    || target === 'weapp-vite'
    || target === 'uni-app-vue3-vite'
    || target === 'uni-app-tailwindcss-v4'
    || target === 'taro-vite-tailwindcss-v4'
    || target === 'taro-app-vite'
    || target === 'taro-webpack-tailwindcss-v4'
    || target === 'taro-vue3-app'
  ) {
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

  if (caseName === 'demo' || caseName === 'apps') {
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
  const maxAttempts = 2
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
      if (attempt >= maxAttempts) {
        throw error
      }
      const message = error instanceof Error ? error.message : String(error)
      process.stdout.write(`[e2e-watch] watch-hmr attempt ${attempt} failed, retrying once: ${message}\n`)
    }
  }
}

function assertHotUpdateReport(report: HotUpdateReport, target: WatchCaseName, maxHotUpdateMs: number) {
  const requiredMutationRounds = resolveRequiredMutationRounds()
  const issue33RoundProfile = isIssue33RoundProfile()
  expect(report.summary.count).toBeGreaterThan(0)
  expect(report.cases.length).toBe(report.summary.count)
  for (const roundName of requiredMutationRounds) {
    expect(report.summaryByRound[roundName]?.count).toBe(report.summary.count)
  }
  expect(report.summaryByMutationKind.template?.count).toBe(report.summary.count)
  expect(report.summaryByMutationKind.script?.count).toBe(report.summary.count)
  expect(report.summaryByMutationKind.style?.count).toBe(report.summary.count)
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
    expect(item.classTokens.length).toBeGreaterThanOrEqual(12)
    expect(item.escapedClasses.length).toBe(item.classTokens.length)
    expect(item.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
    const hasContentMutation = item.mutationMetrics.some(metric => metric.mutationKind === 'content')
    expect(item.mutationMetrics.length).toBe(hasContentMutation ? 4 : 3)
    expect(item.summaryByMutationKind.template?.count).toBe(1)
    expect(item.summaryByMutationKind.script?.count).toBe(1)
    expect(item.summaryByMutationKind.style?.count).toBe(1)
    if (hasContentMutation) {
      expect(item.summaryByMutationKind.content?.count).toBe(1)
    }
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
    expect(baselineRound?.classTokens.length).toBeGreaterThanOrEqual(7)
    expect(complexRound?.classTokens.length).toBeGreaterThanOrEqual(12)
    expect(hexRound?.classTokens.length).toBeGreaterThanOrEqual(5)
    expect(hexRound?.classTokens.some(token => token.startsWith('bg-[#'))).toBe(true)
    expect(complexRound?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(complexRound?.rollbackEffectiveMs).toBeGreaterThan(0)
    expect(hexRound?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(hexRound?.rollbackEffectiveMs).toBeGreaterThan(0)
    expect(item.roundComparison).toBeDefined()
    expect(item.roundComparison?.hotUpdateRatio).toBeGreaterThan(0)
    expect(item.roundComparison?.rollbackRatio).toBeGreaterThan(0)

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

    const templateMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'template')
    const scriptMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'script')
    const styleMetric = item.mutationMetrics.find(mutation => mutation.mutationKind === 'style')

    expect(templateMetric).toBeDefined()
    expect(scriptMetric).toBeDefined()
    expect(styleMetric).toBeDefined()

    expect(templateMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(scriptMetric?.hotUpdateEffectiveMs).toBeGreaterThan(0)
    expect(templateMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
    expect(scriptMetric?.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)

    if (templateMetric && templateMetric.mutationKind !== 'style') {
      expect(templateMetric.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
      for (const roundName of requiredMutationRounds) {
        expect(templateMetric.rounds.some(round => round.roundName === roundName)).toBe(true)
      }
      expect(templateMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(templateMetric.minRequiredGlobalStyleEscapedClasses)
      assertHasWxssOutput(
        normalizeGlobalStyleOutputs(templateMetric.globalStyleOutputs ?? templateMetric.globalStyleOutput),
        `[${item.project}] template mutation global style outputs`,
      )
    }

    if (scriptMetric && scriptMetric.mutationKind !== 'style') {
      expect(scriptMetric.rounds.length).toBeGreaterThanOrEqual(requiredMutationRounds.length)
      for (const roundName of requiredMutationRounds) {
        expect(scriptMetric.rounds.some(round => round.roundName === roundName)).toBe(true)
      }
      expect(scriptMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(scriptMetric.minRequiredGlobalStyleEscapedClasses)
      assertHasWxssOutput(
        normalizeGlobalStyleOutputs(scriptMetric.globalStyleOutputs ?? scriptMetric.globalStyleOutput),
        `[${item.project}] script mutation global style outputs`,
      )
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
      expect(styleMetric.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(styleMetric.rollbackEffectiveMs).toBeGreaterThan(0)
      expect(styleMetric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
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
      expect(item.sameClassStable, `[${item.project}] same-class-literal should keep global styles stable`).toBe(true)
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
  const pollMs = toNumberEnv('E2E_WATCH_POLL_MS', 240)
  const maxHotUpdateMs = toNumberEnv('E2E_WATCH_MAX_HOT_UPDATE_MS', 15000)
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
    '--max-hot-update-ms',
    String(maxHotUpdateMs),
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
