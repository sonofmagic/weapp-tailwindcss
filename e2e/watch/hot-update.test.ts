import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { describe, it } from 'vitest'

interface HotUpdateCaseReport {
  name: 'taro' | 'uni' | 'mpx' | 'rax' | 'mina' | 'weapp-vite'
  label: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs: number
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

interface HotUpdateReport {
  summary: HotUpdateSummary
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
    || value === 'both'
    || value === 'all'
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

function createReportFilePath(cwd: string, caseName: ReturnType<typeof resolveCaseName>) {
  const reportDir = path.resolve(cwd, './benchmark/e2e-watch-hmr')
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
  return path.join(reportDir, `${timestamp}-${caseName}.json`)
}

describe('e2e watch hot-update', () => {
  it('should apply complex class updates and report latency', async () => {
    const cwd = path.resolve(__dirname, '../..')
    const caseName = resolveCaseName()
    const timeoutMs = toNumberEnv('E2E_WATCH_TIMEOUT_MS', 240000)
    const pollMs = toNumberEnv('E2E_WATCH_POLL_MS', 240)
    const maxHotUpdateMs = toNumberEnv('E2E_WATCH_MAX_HOT_UPDATE_MS', 15000)
    const skipBuild = toBoolEnv('E2E_WATCH_SKIP_BUILD', true)
    const quietSass = toBoolEnv('E2E_WATCH_QUIET_SASS', true)

    const reportFile = createReportFilePath(cwd, caseName)

    const args = [
      '--filter',
      'weapp-tailwindcss',
      'test:watch-hmr',
      '--',
      '--case',
      caseName,
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

    for (const item of report.cases) {
      expect(item.hotUpdateEffectiveMs).toBeGreaterThan(0)
      expect(item.hotUpdateEffectiveMs).toBeLessThanOrEqual(maxHotUpdateMs)
      expect(item.rollbackEffectiveMs).toBeGreaterThan(0)
      expect(item.classTokens.length).toBeGreaterThanOrEqual(7)
      expect(item.escapedClasses.length).toBe(item.classTokens.length)

      expect(item.classLiteral).toContain('text-[23.')
      expect(item.classLiteral).toContain('space-y-2.')
      expect(item.classLiteral).toContain('w-[calc(100%_-_')
      expect(item.classLiteral).toContain('grid-cols-[200rpx_minmax(900rpx,_1fr)_')
      expect(item.classLiteral).toContain('after:ml-')
      expect(item.classLiteral).toContain('text-black/[0.')
      expect(item.classLiteral).toContain('ring-[1.')
    }
  })
})
