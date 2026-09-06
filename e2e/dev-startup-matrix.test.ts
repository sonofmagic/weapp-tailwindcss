import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { buildCases, demoWatchShardCases } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import { createWatchSession, sleep } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'

const repoRoot = path.resolve(__dirname, '..')
const startupTimeoutMs = Number(process.env['E2E_DEV_STARTUP_TIMEOUT_MS'] ?? 180_000)
const settleMs = Number(process.env['E2E_DEV_STARTUP_SETTLE_MS'] ?? 1_500)
const enabled = process.env['E2E_DEV_STARTUP_RUN'] === '1'
const requested = process.env['E2E_DEV_STARTUP_CASE']

const stableNames = new Set(Object.values(demoWatchShardCases).flat())
const cases = buildCases(repoRoot)
  .filter(item => item.group === 'demo' && stableNames.has(item.name))
  .filter(item => !requested || requested === 'all' || requested.split(',').includes(item.name))

async function waitForInitialCompile(session: ReturnType<typeof createWatchSession>, name: string) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < startupTimeoutMs) {
    session.ensureRunning()
    if (session.lastCompileSuccessAt() > 0) {
      await sleep(settleMs)
      session.ensureRunning()
      return
    }
    // 部分 demo 的 dev 脚本是等待内部 builder 就绪的 wrapper，不会转发 builder 的成功行。
    // wrapper 已输出 Tailwind 初始化日志且进程持续运行时，使用稳定窗口作为首次编译证据。
    if (Date.now() - startedAt >= 8_000 && /Tailwind CSS|Weapp-tailwindcss/u.test(session.logs())) {
      await sleep(settleMs)
      session.ensureRunning()
      return
    }
    await sleep(250)
  }
  throw new Error(`[${name}] dev server did not complete its first compile in ${startupTimeoutMs}ms\n${session.logs()}`)
}

describe('demo normal dev startup matrix', () => {
  it('declares an explicit executable selection', () => {
    expect(cases.length, 'dev startup selection should resolve at least one registered case').toBeGreaterThan(0)
  })

  const run = enabled ? it : it.skip
  for (const item of cases) {
    run(`starts ${item.name} and keeps the process alive after the first compile`, async () => {
      const session = createWatchSession(item.cwd, item.devScript, { quietSass: true }, {
        WEAPP_TW_WATCH_REGRESSION: '1',
      })
      try {
        await waitForInitialCompile(session, item.name)
        const logs = session.logs()
        expect(logs, `${item.name} should not report CSS/PostCSS parse errors`).not.toMatch(/Unknown word|\[plugin:vite:css\]|SassError|invalid declaration/i)
      }
      finally {
        await session.stop()
      }
    }, startupTimeoutMs + settleMs + 15_000)
  }
})
