import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import type { Browser, Page } from 'playwright'
import type { TaroWebHmrCase } from './taro-web-demo-hmr-cases'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { chromium } from 'playwright'
import { afterEach, describe, it } from 'vitest'
import {
  fetchText,
  findFreePort,
  joinUrl,
  pollIntervalMs,
  resolveChromeExecutable,
  wait,
} from './hbuilderx-local/process'
import { taroWebHmrCases } from './taro-web-demo-hmr-cases'

const repoRoot = path.resolve(__dirname, '..')
const serverTimeoutMs = Number(process.env['E2E_TARO_WEB_HMR_TIMEOUT_MS'] ?? 240_000)

let devProcess: ChildProcess | undefined
let browser: Browser | undefined
let restoreSource: (() => Promise<void>) | undefined
let currentLogs: string[] = []

function rememberLog(line: string) {
  currentLogs.push(line)
  if (currentLogs.length > 120) {
    currentLogs.splice(0, currentLogs.length - 120)
  }
}

async function restoreCurrentSource() {
  if (!restoreSource) {
    return
  }
  const restore = restoreSource
  restoreSource = undefined
  await restore()
}

function killProcessTree(child: ChildProcess) {
  const pid = child.pid
  if (!pid || child.exitCode != null) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    })
    return
  }

  try {
    process.kill(-pid, 'SIGTERM')
  }
  catch {
    child.kill('SIGTERM')
  }
}

function collectProcessOutput(child: ChildProcess) {
  const logs: string[] = []
  const collect = (chunk: Buffer | string) => {
    logs.push(chunk.toString())
    if (logs.length > 160) {
      logs.splice(0, logs.length - 160)
    }
  }
  child.stdout?.on('data', collect)
  child.stderr?.on('data', collect)
  return logs
}

function createDevServer(projectRoot: string, port: number) {
  const child = spawn('pnpm', ['exec', 'taro', 'build', '--type', 'h5', '--watch', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: projectRoot,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      BROWSER: 'none',
      BROWSERSLIST_ENV: 'development',
      CHOKIDAR_INTERVAL: process.env['CHOKIDAR_INTERVAL'] ?? '50',
      CHOKIDAR_USEPOLLING: process.env['CHOKIDAR_USEPOLLING'] ?? '1',
      HOST: '127.0.0.1',
      NODE_ENV: 'development',
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
      PORT: String(port),
      TARO_ENV: 'h5',
      WEAPP_TW_HMR_TIMING: '1',
      WEAPP_TW_WATCH_REGRESSION: '1',
    },
  })
  devProcess = child
  return child
}

async function cleanViteCache(projectRoot: string) {
  await fs.rm(path.resolve(projectRoot, 'node_modules/.vite'), {
    force: true,
    recursive: true,
  })
}

async function waitForReadyUrl(child: ChildProcess, logs: string[], fallbackUrl: string, item: TaroWebHmrCase) {
  let lastError: unknown
  const startedAt = Date.now()

  while (Date.now() - startedAt < serverTimeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`Taro H5 dev server 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }
    for (const baseUrl of [fallbackUrl]) {
      try {
        await fetchText(joinUrl(baseUrl, '/'))
        if (item.appConfigProbe) {
          const appConfig = await fetchText(joinUrl(baseUrl, '/app.config.ts'))
          if (!appConfig.includes('window.__taroAppConfig')) {
            lastError = new Error(`${baseUrl} app.config.ts has not been transformed for H5 yet\n${appConfig.slice(0, 500)}`)
            continue
          }
        }
        return baseUrl
      }
      catch (error) {
        lastError = error
      }
    }
    await wait(pollIntervalMs)
  }

  throw new Error(`等待 Taro H5 dev server 超时：${lastError instanceof Error ? lastError.message : String(lastError)}\n${logs.join('')}`)
}

async function mutateSource(item: TaroWebHmrCase, sourceFile: string) {
  const original = await fs.readFile(sourceFile, 'utf8')
  const anchor = item.anchors.find(candidate => original.includes(candidate))
  if (!anchor) {
    throw new Error(`${item.name} 找不到 HMR 插入锚点：${sourceFile}`)
  }
  const next = original.replace(anchor, `${item.insertion}\n${anchor}`)
  if (next === original) {
    throw new Error(`${item.name} Taro Web HMR 源码替换没有产生变化`)
  }
  await fs.writeFile(sourceFile, next, 'utf8')
  restoreSource = async () => {
    await fs.writeFile(sourceFile, original, 'utf8')
  }
}

function hasTaroConfigTransientError() {
  return currentLogs.some(line => line.includes('app.config.ts') && line.includes('require is not defined'))
}

async function waitForDomHmr(page: Page, item: TaroWebHmrCase, baseUrl: string, child: ChildProcess, logs: string[]) {
  let lastError = ''
  let reloadAttempts = 0
  const startedAt = Date.now()

  while (Date.now() - startedAt < serverTimeoutMs) {
    try {
      const locator = page.locator(`[data-taro-web-hmr="${item.markerAttr}"]`)
      const count = await locator.count()
      if (count === 0) {
        lastError = 'marker not found'
        if (reloadAttempts < 3 && hasTaroConfigTransientError()) {
          reloadAttempts += 1
          currentLogs = []
          await waitForReadyUrl(child, logs, baseUrl, item)
          await gotoReadyPage(page, baseUrl, child, logs)
        }
        await wait(pollIntervalMs)
        continue
      }
      const actual = await locator.first().evaluate((element) => {
        const style = window.getComputedStyle(element)
        return {
          color: style.color.replace(/\s+/g, ' '),
          text: element.textContent?.trim() ?? '',
        }
      }, undefined, { timeout: 1000 })
      if (actual.text === item.markerText && actual.color === 'rgb(255, 0, 0)') {
        return
      }
      lastError = JSON.stringify(actual)
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await wait(pollIntervalMs)
  }

  const body = await page.locator('body').textContent().catch(error => String(error))
  throw new Error(`${item.name} Taro Web HMR DOM 未更新：${lastError}\nbody=${body}\nlogs=${currentLogs.join('\n')}`)
}

async function waitForCssHmr(item: TaroWebHmrCase, baseUrl: string, child: ChildProcess, logs: string[]) {
  let latest = ''
  let lastError = ''
  const startedAt = Date.now()
  const cssPaths = item.cssPaths ?? []

  while (Date.now() - startedAt < serverTimeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`Taro H5 dev server 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }
    for (const cssPath of cssPaths) {
      try {
        latest = await fetchText(joinUrl(baseUrl, cssPath))
        if (/(?:#|_h)ff0000|rgb\(255(?:\s+|,\s*)0(?:\s+|,\s*)0\)/i.test(latest)) {
          return
        }
        lastError = `${cssPath} missing generated red text color`
      }
      catch (error) {
        lastError = `${cssPath}: ${error instanceof Error ? error.message : String(error)}`
      }
    }
    await wait(pollIntervalMs)
  }

  throw new Error(`${item.name} Taro Web HMR CSS 未更新：${lastError}\nlatest=${latest.slice(0, 1000)}\nlogs=${currentLogs.join('\n')}`)
}

async function gotoReadyPage(page: Page, baseUrl: string, child: ChildProcess, logs: string[]) {
  let lastError: unknown
  const startedAt = Date.now()

  while (Date.now() - startedAt < serverTimeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`Taro H5 dev server 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }
    try {
      await page.goto(baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: Math.min(serverTimeoutMs, 15_000),
      })
      return
    }
    catch (error) {
      lastError = error
      await wait(pollIntervalMs)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

describe('demo Taro H5 source HMR', () => {
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void restoreCurrentSource().finally(() => {
        process.kill(process.pid, signal)
      })
    })
  }

  afterEach(async () => {
    await restoreCurrentSource()
    if (browser) {
      await browser.close()
      browser = undefined
    }
    if (devProcess) {
      killProcessTree(devProcess)
      devProcess = undefined
    }
    currentLogs = []
  }, 30_000)

  it.each(taroWebHmrCases)('updates marker text and arbitrary text color for $name', async (item) => {
    const projectRoot = path.resolve(repoRoot, item.projectDir)
    const sourceFile = path.resolve(projectRoot, item.sourceFile)
    const port = await findFreePort()
    await cleanViteCache(projectRoot)
    const child = createDevServer(projectRoot, port)
    const logs = collectProcessOutput(child)
    const baseUrl = await waitForReadyUrl(child, logs, `http://127.0.0.1:${port}/`, item)

    browser = await chromium.launch({
      executablePath: await resolveChromeExecutable(),
      headless: true,
    })
    const page = await browser.newPage()
    page.on('console', msg => rememberLog(`[console:${msg.type()}] ${msg.text()}`))
    page.on('pageerror', error => rememberLog(`[pageerror] ${error.stack ?? error.message}`))
    page.on('requestfailed', request => rememberLog(`[requestfailed] ${request.url()} ${request.failure()?.errorText ?? ''}`))
    await gotoReadyPage(page, baseUrl, child, logs)

    await mutateSource(item, sourceFile)
    if (item.assertion === 'css') {
      await waitForCssHmr(item, baseUrl, child, logs)
    }
    else {
      await waitForDomHmr(page, item, baseUrl, child, logs)
    }
  }, serverTimeoutMs + 30_000)
})
