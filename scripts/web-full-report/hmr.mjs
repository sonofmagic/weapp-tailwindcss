import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fssync from 'node:fs'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { hmrCases } from './constants.mjs'
import { rel, runCapture, wait } from './utils.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const localUrlRE = /Local:\s*(https?:\/\/\S+)/i

async function findFreePort() {
  return await new Promise((resolve, reject) => {
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

function collectProcessOutput(child) {
  const logs = []
  const collect = (chunk) => {
    logs.push(chunk.toString())
    if (logs.length > 160) {
      logs.splice(0, logs.length - 160)
    }
  }
  child.stdout?.on('data', collect)
  child.stderr?.on('data', collect)
  return logs
}

function killProcessTree(child) {
  const pid = child.pid
  if (!pid || child.exitCode != null) {
    return
  }
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true })
    return
  }
  try {
    process.kill(-pid, 'SIGTERM')
  }
  catch {
    child.kill('SIGTERM')
  }
}

function resolveBaseUrls(logs, fallbackUrl) {
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

async function waitForReadyUrl(item, child, logs, fallbackUrl, timeoutMs) {
  let lastError
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`dev server 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }
    for (const baseUrl of resolveBaseUrls(logs, fallbackUrl)) {
      try {
        const response = await fetch(baseUrl)
        if (response.ok && (!item.readyLog || item.readyLog.test(logs.join('')))) {
          return { baseUrl, durationMs: Date.now() - startedAt }
        }
        lastError = new Error(`${baseUrl} -> HTTP ${response.status} ${response.statusText}`)
      }
      catch (error) {
        lastError = error
      }
    }
    await wait(100)
  }
  throw new Error(`等待 Web demo dev server 超时：${lastError instanceof Error ? lastError.message : String(lastError)}\n${logs.join('')}`)
}

async function waitForInitialRender(page, item, baseUrl, timeoutMs) {
  let lastError = ''
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const title = await page.locator('h1').textContent({ timeout: 2_000 })
      if (title?.trim() === item.titleFrom) {
        return Date.now() - startedAt
      }
      lastError = `h1=${title}`
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: Math.min(timeoutMs, 60_000) }).catch((error) => {
      lastError = error instanceof Error ? error.message : String(error)
    })
    await wait(100)
  }
  const body = await page.locator('body').textContent().catch(error => String(error))
  throw new Error(`${item.name} Web HMR 初始页面未渲染：${lastError}\nbody=${body}`)
}

async function waitForDomHmr(page, item, timeoutMs) {
  let lastError = ''
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
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
      if (actual.text === item.titleTo && styleMatched && actual.marker === item.markerAttr) {
        return Date.now() - startedAt
      }
      lastError = JSON.stringify(actual)
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await wait(100)
  }
  const body = await page.locator('body').textContent().catch(error => String(error))
  throw new Error(`${item.name} Web HMR DOM 未更新：${lastError}\nbody=${body}`)
}

function resolveChromeExecutablePath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    process.env.E2E_HBUILDERX_CHROME_PATH,
    process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined,
    process.platform === 'darwin' ? '/Applications/Chromium.app/Contents/MacOS/Chromium' : undefined,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  return candidates.find(candidate => fssync.existsSync(candidate))
}

async function runPredev(repoRoot, projectRoot) {
  const result = runCapture('pnpm', ['run', 'predev'], { cwd: projectRoot, repoRoot })
  if (result.exitCode !== 0) {
    throw new Error(`predev 失败，exit=${result.exitCode}\n${result.stdout}${result.stderr}`)
  }
}

async function runHmrCase(context, item, browser) {
  const projectRoot = path.join(context.repoRoot, 'demo', 'web', item.project)
  const sourceFile = path.join(projectRoot, item.sourceFile)
  const beforeHash = createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex')
  const port = await findFreePort()
  let child
  let logs = []
  let page
  let restored = false
  const totalStartedAt = Date.now()
  try {
    await runPredev(context.repoRoot, projectRoot)
    const args = item.devCommand.map(arg => arg === '{port}' ? String(port) : arg)
    child = spawn('pnpm', args, {
      cwd: projectRoot,
      detached: process.platform !== 'win32',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        BROWSER: 'none',
        NODE_ENV: 'development',
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
      },
    })
    logs = collectProcessOutput(child)
    const ready = await waitForReadyUrl(item, child, logs, `http://127.0.0.1:${port}/`, context.timeoutMs)
    page = await browser.newPage()
    await page.goto(ready.baseUrl, { waitUntil: 'domcontentloaded', timeout: Math.min(context.timeoutMs, 60_000) })
    const initialRenderMs = await waitForInitialRender(page, item, ready.baseUrl, context.timeoutMs)

    const original = await fs.readFile(sourceFile, 'utf8')
    const next = original.replace(item.classFrom, item.classTo).replace(item.titleFrom, item.titleTo)
    if (next === original) {
      throw new Error(`${item.name} 源码替换没有产生变化`)
    }
    await fs.writeFile(sourceFile, next, 'utf8')
    const sourceWriteToDomUpdateMs = await waitForDomHmr(page, item, context.timeoutMs)
    await fs.writeFile(sourceFile, original, 'utf8')
    restored = true
    await wait(300)
    const afterHash = createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex')
    if (afterHash !== beforeHash) {
      throw new Error(`${item.name} HMR 源文件未恢复：${rel(context.repoRoot, sourceFile)}`)
    }
    return {
      name: item.name,
      project: item.project,
      status: 'passed',
      devReadyMs: ready.durationMs,
      initialRenderMs,
      sourceWriteToDomUpdateMs,
      totalMs: Date.now() - totalStartedAt,
      sourceFile: rel(context.repoRoot, sourceFile),
      baseUrl: ready.baseUrl,
    }
  }
  catch (error) {
    if (!restored) {
      try {
        const current = await fs.readFile(sourceFile, 'utf8')
        const originalCandidate = current.replace(item.classTo, item.classFrom).replace(item.titleTo, item.titleFrom)
        if (originalCandidate !== current) {
          await fs.writeFile(sourceFile, originalCandidate, 'utf8')
          restored = true
        }
      }
      catch {
        // 失败详情会通过 sourceRestored 和 error 字段体现。
      }
    }
    const afterHash = createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex')
    return {
      name: item.name,
      project: item.project,
      status: 'failed',
      totalMs: Date.now() - totalStartedAt,
      sourceFile: rel(context.repoRoot, sourceFile),
      sourceRestored: afterHash === beforeHash,
      error: error instanceof Error ? error.message : String(error),
      logs: logs.join('').slice(-12_000),
    }
  }
  finally {
    if (page) {
      await page.close().catch(() => undefined)
    }
    if (child) {
      killProcessTree(child)
      await wait(700)
    }
  }
}

export async function runHmr(context) {
  const executablePath = resolveChromeExecutablePath()
  const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { headless: true })
  const cases = []
  try {
    for (const item of hmrCases) {
      console.log(`[hmr] ${item.project}`)
      cases.push(await runHmrCase(context, item, browser))
    }
  }
  finally {
    await browser.close()
  }
  const report = {
    generatedAt: new Date().toISOString(),
    timeoutMs: context.timeoutMs,
    cases,
  }
  await fs.writeFile(context.hmrOutFile, JSON.stringify(report, null, 2))
  return report
}
