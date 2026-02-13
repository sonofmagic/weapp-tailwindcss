import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { describe, it } from 'vitest'

type WatchProjectGroup = 'demo' | 'apps'
type ConcreteWatchCaseName = 'taro' | 'uni' | 'mpx' | 'rax' | 'mina' | 'weapp-vite' | 'uni-app-vue3-vite' | 'uni-app-tailwindcss-v4' | 'taro-vite-tailwindcss-v4' | 'taro-app-vite' | 'taro-webpack-tailwindcss-v4' | 'taro-vue3-app' | 'taro-webpack' | 'vite-native-ts'
type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo' | 'apps'
type MutationKind = 'template' | 'script' | 'style'
type MutationRoundName = 'baseline-arbitrary' | 'complex-corpus'

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
  globalStyleOutput: string
  minRequiredGlobalStyleEscapedClasses: number
  verifiedGlobalStyleEscapedClasses: string[]
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
  globalStyleOutput: string
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

function resolveCaseName() {
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

function resolveExecutionTargets(caseName: WatchCaseName): WatchCaseName[] {
  if (caseName === 'all') {
    return ['demo', 'apps']
  }
  return [caseName]
}

function resolveExpectedGroup(target: WatchCaseName): WatchProjectGroup | undefined {
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

const criticalDemoProjects = [
  'demo/uni-app-vue3-vite',
  'demo/uni-app-tailwindcss-v4',
  'demo/taro-vite-tailwindcss-v4',
  'demo/taro-app-vite',
  'demo/taro-webpack-tailwindcss-v4',
  'demo/taro-vue3-app',
] as const

describe('e2e watch hot-update', () => {
  const caseName = resolveCaseName()
  const targets = resolveExecutionTargets(caseName)

  for (const target of targets) {
    it(`should verify template/script/style hot updates and project report for ${target}`, async () => {
      const cwd = path.resolve(__dirname, '../..')
      const timeoutMs = toNumberEnv('E2E_WATCH_TIMEOUT_MS', 240000)
      const pollMs = toNumberEnv('E2E_WATCH_POLL_MS', 240)
      const maxHotUpdateMs = toNumberEnv('E2E_WATCH_MAX_HOT_UPDATE_MS', 15000)
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

      await execa('pnpm', args, {
        cwd,
        stdio: 'inherit',
        env: process.env,
      })

      const raw = await fs.readFile(reportFile, 'utf8')
      const report = JSON.parse(raw) as HotUpdateReport

      process.stdout.write(`[e2e-watch] hmr report saved: ${reportFile}\n`)

      expect(report.summary.count).toBeGreaterThan(0)
      expect(report.cases.length).toBe(report.summary.count)
      expect(report.summaryByRound['baseline-arbitrary']?.count).toBe(report.summary.count)
      expect(report.summaryByRound['complex-corpus']?.count).toBe(report.summary.count)
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
        expect(item.rounds.length).toBe(2)
        expect(item.mutationMetrics.length).toBe(3)
        expect(item.summaryByMutationKind.template?.count).toBe(1)
        expect(item.summaryByMutationKind.script?.count).toBe(1)
        expect(item.summaryByMutationKind.style?.count).toBe(1)
        expect(item.globalStyleOutput).toContain('.wxss')
        if (expectedGroup) {
          expect(item.projectGroup).toBe(expectedGroup)
        }

        const baselineRound = item.rounds.find(round => round.roundName === 'baseline-arbitrary')
        const complexRound = item.rounds.find(round => round.roundName === 'complex-corpus')
        expect(baselineRound).toBeDefined()
        expect(complexRound).toBeDefined()
        expect(baselineRound?.classTokens.length).toBeGreaterThanOrEqual(7)
        expect(complexRound?.classTokens.length).toBeGreaterThanOrEqual(12)
        expect(complexRound?.hotUpdateEffectiveMs).toBeGreaterThan(0)
        expect(complexRound?.rollbackEffectiveMs).toBeGreaterThan(0)
        expect(item.roundComparison).toBeDefined()
        expect(item.roundComparison?.hotUpdateRatio).toBeGreaterThan(0)
        expect(item.roundComparison?.rollbackRatio).toBeGreaterThan(0)

        expect(item.classLiteral).toContain('text-[23.')
        expect(item.classLiteral).toContain('space-y-2.')
        expect(item.classLiteral).toContain('w-[calc(100%_-_')
        expect(item.classLiteral).toContain('grid-cols-[200rpx_minmax(900rpx,_1fr)_')
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
          expect(templateMetric.rounds.length).toBe(2)
          expect(templateMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(templateMetric.minRequiredGlobalStyleEscapedClasses)
          expect(templateMetric.globalStyleOutput).toContain('.wxss')
        }

        if (scriptMetric && scriptMetric.mutationKind !== 'style') {
          expect(scriptMetric.rounds.length).toBe(2)
          expect(scriptMetric.verifiedGlobalStyleEscapedClasses.length).toBeGreaterThanOrEqual(scriptMetric.minRequiredGlobalStyleEscapedClasses)
          expect(scriptMetric.globalStyleOutput).toContain('.wxss')
        }

        if (styleMetric && styleMetric.mutationKind === 'style') {
          expect(styleMetric.outputStyle).toContain('.wxss')
          expect(styleMetric.styleNeedle).toContain('.tw-watch-style-')
          expect(styleMetric.hotUpdateEffectiveMs).toBeGreaterThan(0)
          expect(styleMetric.rollbackEffectiveMs).toBeGreaterThan(0)
          expect(styleMetric.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
        }
      }
    })
  }
})
