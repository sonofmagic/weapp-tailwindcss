import process from 'node:process'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'
import { getFrameworkIdeCases, getFrameworkIdeExemptCases } from './frameworkSupportMatrix'

const describeFrameworkIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))
const transientIdeErrorPatterns = [
  /DevTools did not respond to protocol method/i,
  /Framework IDE probe reLaunch timed out/i,
]

function readNumberEnv(name: string, fallback: number) {
  return Number(process.env[name] ?? fallback)
}

function getProbeTiming() {
  const timeoutMs = readNumberEnv('E2E_AUTOMATOR_TIMEOUT_MS', 30_000)
  const closeTimeoutMs = readNumberEnv('E2E_IDE_CLOSE_TIMEOUT_MS', 10_000)
  const buildTimeoutMs = process.env['E2E_IDE_BUILD'] === '1'
    ? readNumberEnv('E2E_IDE_BUILD_TIMEOUT_MS', 120_000)
    : 0
  const settleTimeoutMs = readNumberEnv('E2E_IDE_SETTLE_MS', 1500)
  const maxAttempts = readNumberEnv('E2E_IDE_PROBE_RETRIES', 2) + 1
  const attemptTimeoutMs = buildTimeoutMs + timeoutMs + closeTimeoutMs + 5000
  const testTimeoutMs = (attemptTimeoutMs + settleTimeoutMs) * maxAttempts

  return {
    attemptTimeoutMs,
    closeTimeoutMs,
    maxAttempts,
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

async function runFrameworkIdeProbe(entryName: string, timeoutMs: number, testTimeoutMs: number) {
  await execa('node', ['--import', 'tsx', './e2e/frameworkIdeProbe.ts', entryName], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      E2E_IDE_PROBE_TIMEOUT_MS: String(timeoutMs),
      E2E_IDE_BUILD: process.env['E2E_IDE_BUILD'] ?? '0',
    },
    stdio: process.env['E2E_IDE_DEBUG'] === '1' ? 'inherit' : 'pipe',
    timeout: testTimeoutMs - 1000,
    killSignal: 'SIGKILL',
    forceKillAfterDelay: 1000,
  })
}

describeFrameworkIde.sequential('framework support matrix ide', () => {
  it('keeps non-IDE framework cases documented as explicit exemptions', () => {
    for (const entry of getFrameworkIdeExemptCases()) {
      expect(entry.ide.reason?.length).toBeGreaterThan(0)
    }
  })

  for (const entry of getFrameworkIdeCases()) {
    it(`${entry.name} opens in WeChat DevTools automator`, async () => {
      const {
        attemptTimeoutMs,
        maxAttempts,
        settleTimeoutMs,
        timeoutMs,
      } = getProbeTiming()

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await runFrameworkIdeProbe(entry.name, timeoutMs, attemptTimeoutMs)
          return
        }
        catch (error) {
          if (attempt >= maxAttempts || !isTransientIdeError(error)) {
            throw error
          }
          process.stderr.write(`[e2e:ide] retry ${entry.name} after transient DevTools error (${attempt}/${maxAttempts - 1})\n`)
        }
        finally {
          await cleanupDevTools()
          await wait(settleTimeoutMs)
        }
      }
    }, getProbeTiming().testTimeoutMs)
  }
})
