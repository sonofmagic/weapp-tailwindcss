import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import type { Browser, Page } from 'playwright'
import type { WebViteHmrCase } from './web-vite-demo-hmr-cases'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import net from 'node:net'
import process from 'node:process'
import path from 'pathe'
import { chromium } from 'playwright'
import { afterEach, describe, it } from 'vitest'
import { resolveChromeExecutable } from './hbuilderx-local/process'
import { webViteHmrCases } from './web-vite-demo-hmr-cases'

const repoRoot = path.resolve(__dirname, '..')
const localUrlRE = /Local:\s*(https?:\/\/\S+)/i
const serverTimeoutMs = Number(process.env['E2E_WEB_VITE_HMR_TIMEOUT_MS'] ?? 120_000)
const pollIntervalMs = 100

let devProcess: ChildProcess | undefined
let browser: Browser | undefined
let restoreSource: (() => Promise<void>) | undefined

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function findFreePort() {
  return await new Promise<number>((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('无法解析可用端口')))
        return
      }
      const { port } = address
      server.close(() => resolve(port))
    })
  })
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
    if (logs.length > 120) {
      logs.splice(0, logs.length - 120)
    }
  }
  child.stdout?.on('data', collect)
  child.stderr?.on('data', collect)
  return logs
}

function runPredev(projectRoot: string) {
  const result = spawnSync('pnpm', ['run', 'predev'], {
    cwd: projectRoot,
    shell: process.platform === 'win32',
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
    },
  })

  if (result.status !== 0) {
    throw new Error(`Web Vite demo predev 失败，exit=${result.status}\n${result.stdout.toString()}${result.stderr.toString()}`)
  }
}

function createDevServer(item: WebViteHmrCase, projectRoot: string, port: number) {
  runPredev(projectRoot)
  const args = item.devCommand.map(arg => arg === '{port}' ? String(port) : arg)
  const child = spawn('pnpm', args, {
    cwd: projectRoot,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      BROWSER: 'none',
      NODE_ENV: 'development',
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
    },
  })
  devProcess = child
  return child
}

function resolveBaseUrls(logs: string[], fallbackUrl: string) {
  const urls = new Set([fallbackUrl])
  for (const chunk of logs) {
    for (const line of chunk.split(/\r?\n/)) {
      const matched = line.match(localUrlRE)?.[1]
      if (matched) {
        urls.add(matched)
      }
    }
  }
  return Array.from(urls)
}

async function waitForReadyUrl(item: WebViteHmrCase, child: ChildProcess, logs: string[], fallbackUrl: string) {
  let lastError: unknown
  const startedAt = Date.now()

  while (Date.now() - startedAt < serverTimeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`dev server 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }
    for (const baseUrl of resolveBaseUrls(logs, fallbackUrl)) {
      try {
        const response = await fetch(baseUrl)
        if (response.ok && (!item.readyLog || item.readyLog.test(logs.join('')))) {
          return baseUrl
        }
        lastError = new Error(`${baseUrl} -> HTTP ${response.status} ${response.statusText}`)
      }
      catch (error) {
        lastError = error
      }
    }
    await wait(pollIntervalMs)
  }

  throw new Error(`等待 Web Vite dev server 超时：${lastError instanceof Error ? lastError.message : String(lastError)}\n${logs.join('')}`)
}

async function mutateSource(item: WebViteHmrCase, sourceFile: string) {
  const original = await fs.readFile(sourceFile, 'utf8')
  const next = original
    .replace(item.classFrom, item.classTo)
    .replace(item.titleFrom, item.titleTo)
  if (next === original) {
    throw new Error(`${item.name} Web HMR 源码替换没有产生变化`)
  }
  await fs.writeFile(sourceFile, next, 'utf8')
  restoreSource = async () => {
    await fs.writeFile(sourceFile, original, 'utf8')
  }
}

async function waitForInitialRender(page: Page, item: WebViteHmrCase, baseUrl: string) {
  let lastError = ''
  const startedAt = Date.now()

  while (Date.now() - startedAt < serverTimeoutMs) {
    try {
      const title = await page.locator('h1').textContent({ timeout: 2_000 })
      if (title?.trim() === item.titleFrom) {
        return
      }
      lastError = `h1=${title}`
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: Math.min(serverTimeoutMs, 60_000),
    }).catch((error) => {
      lastError = error instanceof Error ? error.message : String(error)
    })
    await wait(pollIntervalMs)
  }

  const body = await page.locator('body').textContent().catch(error => String(error))
  throw new Error(`${item.name} Web HMR 初始页面未渲染：${lastError}\nbody=${body}`)
}

async function waitForDomHmr(page: Page, item: WebViteHmrCase) {
  let lastError = ''
  const startedAt = Date.now()

  while (Date.now() - startedAt < serverTimeoutMs) {
    try {
      const actual = await page.locator('h1').evaluate((element) => {
        const style = window.getComputedStyle(element)
        return {
          color: style.color.replace(/\s+/g, ' '),
          text: element.textContent?.trim() ?? '',
          marker: element.getAttribute('data-web-vite-hmr'),
        }
      })
      const styleMatched = item.styleRequired === false || actual.color === 'rgb(255, 0, 0)'
      if (actual.text === item.titleTo && styleMatched) {
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
  throw new Error(`${item.name} Web HMR DOM 未更新：${lastError}\nbody=${body}`)
}

async function cleanupWithTimeout(name: string, task: () => Promise<void> | void, timeoutMs = 5_000) {
  let timeout: NodeJS.Timeout | undefined
  try {
    await Promise.race([
      Promise.resolve().then(task),
      new Promise<void>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`${name} cleanup timed out after ${timeoutMs}ms`))
        }, timeoutMs)
        timeout.unref?.()
      }),
    ])
  }
  finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

async function cleanupBestEffort(name: string, task: () => Promise<void> | void, timeoutMs = 5_000) {
  await cleanupWithTimeout(name, task, timeoutMs).catch(() => undefined)
}

describe('demo/web source HMR', () => {
  afterEach(async () => {
    if (restoreSource) {
      await cleanupWithTimeout('restore source', restoreSource)
      restoreSource = undefined
    }
    if (devProcess) {
      killProcessTree(devProcess)
      devProcess = undefined
    }
    if (browser) {
      await cleanupBestEffort('close browser', () => browser?.close())
      browser = undefined
    }
  }, 30_000)

  it.each(webViteHmrCases)('updates title and arbitrary text color for $name', async (item) => {
    const projectRoot = path.resolve(repoRoot, item.projectDir)
    const sourceFile = path.resolve(projectRoot, item.sourceFile)
    const port = await findFreePort()
    const child = createDevServer(item, projectRoot, port)
    const logs = collectProcessOutput(child)
    const baseUrl = await waitForReadyUrl(item, child, logs, `http://127.0.0.1:${port}/`)

    browser = await chromium.launch({
      executablePath: await resolveChromeExecutable(),
      headless: true,
    })
    const page = await browser.newPage()
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: Math.min(serverTimeoutMs, 60_000),
    })
    await waitForInitialRender(page, item, baseUrl)

    await mutateSource(item, sourceFile)
    await waitForDomHmr(page, item)
  }, serverTimeoutMs + 30_000)
})
