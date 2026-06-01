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
const TARGET = 'taro-webpack-react-tailwindcss-v4'
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
  let compiledAfterReady = 0
  let closeResult:
    | { code: number | null, signal: NodeJS.Signals | null }
    | undefined

  const onData = (chunk: Buffer | string) => {
    const text = chunk.toString()
    collect(chunk)
    if (ready && TARO_COMPILED_RE.test(text)) {
      compiledAfterReady += 1
    }
    if (TARO_WATCH_READY_RE.test(text)) {
      ready = true
      readyAt = Date.now()
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
      compiledAfterReady,
      `[${project}] pnpm dev should not self-trigger rebuilds after watch ready\n${logs.join('\n')}`,
    ).toBe(0)
  }
  finally {
    await stopProcessTree(child)
  }
}

describe('e2e watch taro demo dev entry', () => {
  const caseName = resolveCaseName()

  if (
    caseName !== 'all'
    && caseName !== 'demo'
    && !shouldRunTarget(caseName, TARGET)
  ) {
    it.skip('skips taro webpack react tailwindcss v4 pnpm dev smoke for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('keeps taro webpack react tailwindcss v4 pnpm dev in watch mode', async () => {
    await expectDemoDevWatchReady(TARGET)
  }, 240_000)
})
