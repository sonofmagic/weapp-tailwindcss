import type { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import {
  createLineCollector,
  createSpawnEnv,
  killProcessTreeOnPosix,
  killProcessTreeOnWindows,
  sleep,
  spawnPnpm,
} from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'
import { resolveCaseName, shouldRunTarget } from './hot-update/shared'

const TARO_WATCH_READY_RE = /→ Watching|watching for file changes/i
const TARO_COMPILED_RE = /Compiled successfully/i
const ROOT = process.cwd()
const TARGETS = [
  'taro-webpack-react-tailwindcss-v3',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v3',
  'taro-webpack-vue3-tailwindcss-v4',
]
const STABLE_AFTER_READY_MS = 8_000

async function stopProcessTree(child: ReturnType<typeof spawnPnpm>) {
  const pid = child.pid
  if (pid == null) {
    child.kill('SIGTERM')
    return
  }

  if (process.platform === 'win32') {
    killProcessTreeOnWindows(pid)
    return
  }

  killProcessTreeOnPosix(pid, 'SIGTERM')
  await sleep(1500)
  if (child.exitCode == null) {
    killProcessTreeOnPosix(pid, 'SIGKILL')
  }
}

async function expectDemoDevWatchReady(project: string) {
  const cwd = `${ROOT}/demo/${project}`
  const child = spawnPnpm(['dev'], {
    cwd,
    env: createSpawnEnv(process.env, {
      CHOKIDAR_INTERVAL: process.env.CHOKIDAR_INTERVAL ?? '50',
      CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1',
      WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? '50',
      WATCHPACK_POLLING_INTERVAL: process.env.WATCHPACK_POLLING_INTERVAL ?? '50',
      WEAPP_TW_WATCH_REGRESSION: '1',
    }),
    detached: process.platform !== 'win32',
    stdio: 'pipe',
  })
  const logs: string[] = []
  const collect = createLineCollector('taro-dev', logs, 160, {
    quietSass: true,
  })
  let ready = false
  let readyAt = 0
  let lastReadyCompiledCount = 0
  let compiledCount = 0
  let closeResult:
    | { code: number | null, signal: NodeJS.Signals | null }
    | undefined

  const onData = (chunk: Buffer | string) => {
    const text = chunk.toString()
    collect(chunk)
    if (TARO_COMPILED_RE.test(text)) {
      compiledCount += 1
    }
    if (TARO_WATCH_READY_RE.test(text)) {
      ready = true
      readyAt = Date.now()
      lastReadyCompiledCount = compiledCount
    }
  }

  child.stdout.on('data', onData)
  child.stderr.on('data', onData)
  child.on('close', (code, signal) => {
    closeResult = { code, signal }
  })

  try {
    const startedAt = Date.now()
    while (Date.now() - startedAt < 180_000) {
      if (ready) {
        break
      }
      if (closeResult) {
        throw new Error(
          `[${project}] pnpm dev exited before watch ready: ${closeResult.signal ?? closeResult.code}\n${logs.join('\n')}`,
        )
      }
      await sleep(250)
    }

    expect(
      ready,
      `[${project}] pnpm dev should enter Taro watch mode\n${logs.join('\n')}`,
    ).toBe(true)
    expect(
      closeResult,
      `[${project}] pnpm dev should keep running after watch ready`,
    ).toBeUndefined()

    while (Date.now() - readyAt < STABLE_AFTER_READY_MS) {
      if (closeResult) {
        throw new Error(
          `[${project}] pnpm dev exited during stable watch window: ${closeResult.signal ?? closeResult.code}\n${logs.join('\n')}`,
        )
      }
      await sleep(250)
    }

    expect(
      compiledCount,
      `[${project}] pnpm dev should not self-trigger rebuilds after the final watch ready\n${logs.join('\n')}`,
    ).toBe(lastReadyCompiledCount)
    expect(
      lastReadyCompiledCount,
      `[${project}] pnpm dev should compile before entering the final watch ready\n${logs.join('\n')}`,
    ).toBeGreaterThan(0)
  }
  finally {
    await stopProcessTree(child)
  }
}

describe('e2e watch taro demo dev entry', () => {
  const caseName = resolveCaseName()

  const targets = TARGETS.filter(project => caseName === 'all' || caseName === 'demo' || shouldRunTarget(caseName, project))

  if (targets.length === 0) {
    it.skip('skips taro webpack pnpm dev smoke for current E2E_WATCH_CASE filter', () => {})
    return
  }

  for (const target of targets) {
    it(`keeps ${target} pnpm dev in watch mode`, async () => {
      await expectDemoDevWatchReady(target)
    }, 240_000)
  }
})
