import process from 'node:process'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'
import { getFrameworkIdeCases, getFrameworkIdeExemptCases } from './frameworkSupportMatrix'

const describeFrameworkIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))

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

describeFrameworkIde.sequential('framework support matrix ide', () => {
  it('keeps non-IDE framework cases documented as explicit exemptions', () => {
    for (const entry of getFrameworkIdeExemptCases()) {
      expect(entry.ide.reason?.length).toBeGreaterThan(0)
    }
  })

  for (const entry of getFrameworkIdeCases()) {
    it(`${entry.name} opens in WeChat DevTools automator`, async () => {
      const timeoutMs = Number(process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 30_000)
      const closeTimeoutMs = Number(process.env['E2E_IDE_CLOSE_TIMEOUT_MS'] ?? 10_000)
      const buildTimeoutMs = process.env['E2E_IDE_BUILD'] === '1'
        ? Number(process.env['E2E_IDE_BUILD_TIMEOUT_MS'] ?? 120_000)
        : 0
      const testTimeoutMs = buildTimeoutMs + timeoutMs + closeTimeoutMs + 5000

      try {
        await execa('node', ['--import', 'tsx', './e2e/frameworkIdeProbe.ts', entry.name], {
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
      finally {
        await cleanupDevTools()
        await wait(Number(process.env['E2E_IDE_SETTLE_MS'] ?? 1500))
      }
    }, Number(process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 30_000) + Number(process.env['E2E_IDE_BUILD_TIMEOUT_MS'] ?? 120_000) + Number(process.env['E2E_IDE_CLOSE_TIMEOUT_MS'] ?? 10_000) + 5000)
  }
})
