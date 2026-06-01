import type { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import {
  createLineCollector,
  createSpawnEnv,
  killProcessTreeOnPosix,
  killProcessTreeOnWindows,
  sleep,
  spawnPnpm,
} from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'
import { clearProjectBuildState } from './projectTest'

const projectRoot = path.resolve(__dirname, '../demo/uni-app-vite-tailwindcss-v3')
const outputCss = path.resolve(projectRoot, 'dist/dev/mp-weixin/app.wxss')
const devTimeoutMs = 240_000

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

async function readFileIfExists(file: string) {
  try {
    return await fs.readFile(file, 'utf8')
  }
  catch (error: any) {
    if (error?.code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

function expectDevAppWxss(css: string) {
  expect(css, 'dev app.wxss should not keep raw Tailwind directives').not.toMatch(/@(tailwind|apply)\b/)
  expect(css, 'dev app.wxss should not keep unsupported @layer wrappers').not.toMatch(/@layer\b/)
  expect(css, 'dev app.wxss should keep raw-btn from Sass @layer components').toMatch(
    /\.raw-btn\s*\{[\s\S]*?display:\s*inline-flex[\s\S]*?gap:\s*16rpx/,
  )
  expect(css, 'dev app.wxss should keep raw-btn after variant from @apply').toMatch(
    /\.raw-btn(?:::|:)after\s*\{[\s\S]*?border-style:\s*none/,
  )
  expect(css, 'dev app.wxss should keep btn declarations inherited from raw-btn').toMatch(
    /\.btn\s*\{[\s\S]*?display:\s*inline-flex[\s\S]*?gap:\s*16rpx/,
  )
  expect(css, 'dev app.wxss should keep btn after variant inherited from raw-btn').toMatch(
    /\.btn(?:::|:)after\s*\{[\s\S]*?border-style:\s*none/,
  )
  expect(css, 'dev app.wxss should keep btn gradient utilities from @apply').toMatch(
    /\.btn\s*\{[\s\S]*?background-image:\s*linear-gradient\(to right,\s*var\(--tw-gradient-stops\)\)[\s\S]*?padding-left:\s*16rpx[\s\S]*?color:\s*rgba\(255,\s*255,\s*255/,
  )
}

async function waitForGeneratedAppWxss(child: ReturnType<typeof spawnPnpm>, logs: string[]) {
  const startedAt = Date.now()
  let lastCss = ''

  while (Date.now() - startedAt < devTimeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`dev:mp-weixin exited before app.wxss was generated: ${child.exitCode}\n${logs.join('\n')}`)
    }

    const css = await readFileIfExists(outputCss)
    if (css) {
      lastCss = css
      try {
        expectDevAppWxss(css)
        return css
      }
      catch {
      }
    }

    await sleep(500)
  }

  throw new Error([
    'timed out waiting for dev mp-weixin app.wxss layer output',
    `last app.wxss preview:\n${lastCss.slice(0, 4000)}`,
    `logs:\n${logs.join('\n')}`,
  ].join('\n\n'))
}

describe('uni-app vite Tailwind v3 dev mp-weixin layer output', () => {
  it('keeps Sass @layer component classes in dist/dev/mp-weixin/app.wxss', async () => {
    await clearProjectBuildState(projectRoot)

    const child = spawnPnpm(['run', 'dev:mp-weixin'], {
      cwd: projectRoot,
      env: createSpawnEnv(process.env, {
        CHOKIDAR_INTERVAL: process.env.CHOKIDAR_INTERVAL ?? '50',
        CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1',
        WEAPP_TW_WATCH_REGRESSION: '1',
      }),
      detached: process.platform !== 'win32',
      stdio: 'pipe',
    })
    const logs: string[] = []
    const collect = createLineCollector('uni-dev-mp-weixin', logs, 180, {
      quietSass: true,
    })
    const onData = (chunk: Buffer | string) => collect(chunk)

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)

    try {
      const css = await waitForGeneratedAppWxss(child, logs)
      expectDevAppWxss(css)
    }
    finally {
      await stopProcessTree(child)
    }
  }, 300_000)
})
