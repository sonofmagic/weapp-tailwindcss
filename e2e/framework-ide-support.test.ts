import process from 'node:process'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'
import { getFrameworkIdeCases, getFrameworkIdeExemptCases } from './frameworkSupportMatrix'

const describeFrameworkIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))
const transientIdeErrorPatterns = [
  /DevTools did not respond to protocol method/i,
  /Failed to launch wechat web devTools/i,
  /Framework IDE probe reLaunch timed out/i,
  /page ".*" is not found/i,
]

function readNumberEnv(name: string, fallback: number) {
  return Number(process.env[name] ?? fallback)
}

function getProbeTiming(entryName: string) {
  const baseTimeoutMs = readNumberEnv('E2E_AUTOMATOR_TIMEOUT_MS', 20_000)
  const timeoutMs = Math.max(
    baseTimeoutMs,
    entryName.startsWith('taro-vite-') ? readNumberEnv('E2E_IDE_TARO_VITE_TIMEOUT_MS', 60_000) : 0,
    entryName.startsWith('uni-app-vite-') ? readNumberEnv('E2E_IDE_UNI_APP_VITE_TIMEOUT_MS', 60_000) : 0,
  )
  const relaunchTimeoutMs = readNumberEnv('E2E_IDE_RELAUNCH_TIMEOUT_MS', 60_000)
  const closeTimeoutMs = readNumberEnv('E2E_IDE_CLOSE_TIMEOUT_MS', 5000)
  const hotUpdateTimeoutMs = process.env['E2E_IDE_HOT_UPDATE'] === '0'
    ? 0
    : readNumberEnv('E2E_IDE_HOT_UPDATE_TIMEOUT_MS', readNumberEnv('E2E_WATCH_TIMEOUT_MS', 120_000))
  const buildTimeoutMs = process.env['E2E_IDE_BUILD'] === '1'
    ? readNumberEnv('E2E_IDE_BUILD_TIMEOUT_MS', 90_000)
    : 0
  const hotUpdateTotalTimeoutMs = process.env['E2E_IDE_HOT_UPDATE'] === '0'
    ? 0
    : readNumberEnv('E2E_IDE_HOT_UPDATE_TOTAL_TIMEOUT_MS', hotUpdateTimeoutMs)
  const settleTimeoutMs = readNumberEnv('E2E_IDE_SETTLE_MS', 800)
  const maxAttempts = readNumberEnv('E2E_IDE_PROBE_RETRIES', 1) + 1
  const attemptTimeoutMs = buildTimeoutMs + hotUpdateTotalTimeoutMs + timeoutMs + relaunchTimeoutMs + closeTimeoutMs + 5000
  const parentGraceMs = readNumberEnv('E2E_IDE_PARENT_TIMEOUT_GRACE_MS', 15_000)
  const testTimeoutMs = (attemptTimeoutMs + settleTimeoutMs + parentGraceMs) * maxAttempts

  return {
    attemptTimeoutMs,
    closeTimeoutMs,
    maxAttempts,
    relaunchTimeoutMs,
    settleTimeoutMs,
    testTimeoutMs,
    timeoutMs,
  }
}

async function cleanupDevTools() {
  if (process.platform !== 'darwin') {
    return
  }
  try {
    await execa('osascript', ['-e', 'quit app "wechatwebdevtools"'], {
      timeout: Number(process.env['E2E_IDE_CLEANUP_TIMEOUT_MS'] ?? 5000),
    })
  }
  catch {}
}

function isTransientIdeError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }
  const candidate = error as {
    message?: string
    stderr?: string
    shortMessage?: string
  }
  const text = [
    candidate.message,
    candidate.shortMessage,
    candidate.stderr,
  ].filter(Boolean).join('\n')
  return transientIdeErrorPatterns.some(pattern => pattern.test(text))
}

async function runFrameworkIdeProbe(entryName: string, timeoutMs: number, relaunchTimeoutMs: number, testTimeoutMs: number) {
  let result
  try {
    result = await execa('node', ['--import', 'tsx', './e2e/frameworkIdeProbe.ts', entryName], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        E2E_IDE_PROBE_TIMEOUT_MS: String(timeoutMs),
        E2E_IDE_RELAUNCH_TIMEOUT_MS: String(relaunchTimeoutMs),
        E2E_IDE_BUILD: process.env['E2E_IDE_BUILD'] ?? '0',
      },
      stdio: process.env['E2E_IDE_DEBUG'] === '1' ? 'inherit' : 'pipe',
      timeout: testTimeoutMs - 1000,
      killSignal: 'SIGKILL',
      forceKillAfterDelay: 1000,
    })
  }
  catch (error) {
    if (error instanceof Error && !('stderr' in error && typeof error.stderr === 'string' && error.stderr.includes('[e2e:ide] diagnostics'))) {
      const diagnostics = await collectFrameworkIdeDiagnostics(entryName)
      error.message = `${error.message}\n${diagnostics}`
    }
    throw error
  }

  if (process.env['E2E_IDE_DEBUG'] !== '1') {
    const visibleLines = result.stdout
      ?.split(/\r?\n/)
      .filter(line => line.includes('[e2e:ide]'))
      .join('\n')
    if (visibleLines) {
      process.stdout.write(`${visibleLines}\n`)
    }
  }
}

describeFrameworkIde.sequential('framework support matrix ide', () => {
  it('keeps non-IDE framework cases documented as explicit exemptions', () => {
    for (const entry of getFrameworkIdeExemptCases()) {
      expect(entry.ide.reason?.length).toBeGreaterThan(0)
    }
  })

  it('covers Tailwind CSS v3 and v4 IDE hot updates for every supported framework family', () => {
    if (process.env['E2E_PROJECT_FILTER']) {
      return
    }

    const requiredPairs = [
      ['uni-app', 'v3'],
      ['uni-app', 'v4'],
      ['taro-react', 'v3'],
      ['taro-react', 'v4'],
      ['mpx', 'v3'],
      ['mpx', 'v4'],
      ['native', 'v3'],
      ['native', 'v4'],
    ] as const
    const ideCases = getFrameworkIdeCases()

    for (const [framework, tailwindcss] of requiredPairs) {
      expect(
        ideCases.some(entry => entry.framework === framework && entry.tailwindcss === tailwindcss),
        `${framework} should run tailwindcss@${tailwindcss.slice(1)} in e2e:ide`,
      ).toBe(true)
    }
  })

  for (const entry of getFrameworkIdeCases()) {
    const probeTiming = getProbeTiming(entry.name)
    it(`${entry.name} opens in WeChat DevTools automator and applies a visible hot update`, async () => {
      const {
        attemptTimeoutMs,
        maxAttempts,
        relaunchTimeoutMs,
        settleTimeoutMs,
        timeoutMs,
      } = probeTiming

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await runFrameworkIdeProbe(entry.name, timeoutMs, relaunchTimeoutMs, attemptTimeoutMs)
          return
        }
        catch (error) {
          if (attempt >= maxAttempts || !isTransientIdeError(error)) {
            throw error
          }
          process.stderr.write(`[e2e:ide] retry ${entry.name} after transient DevTools error (${attempt}/${maxAttempts - 1})\n${await collectFrameworkIdeDiagnostics(entry.name)}\n`)
        }
        finally {
          await cleanupDevTools()
          await wait(settleTimeoutMs)
        }
      }
    }, probeTiming.testTimeoutMs)
  }
})
