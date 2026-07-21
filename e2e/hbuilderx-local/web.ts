import type { ChildProcess } from 'node:child_process'
import type { Page } from 'playwright'
import type { WebHmrStep, WebRuntimeStyleAssertion } from './cases'

import fs from 'node:fs/promises'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  collectProcessOutput,
  fetchText,
  findFreePort,
  joinUrl,
  pollIntervalMs,
  readUtf8,
  resolveBaseUrls,
  resolveChromeExecutable,
  runPnpm,
  serverTimeoutMs,
  spawnPnpm,
  wait,
} from './process'

let devProcess: ChildProcess | undefined

interface WebPageDiagnostics {
  errors: string[]
  requests: string[]
  warnings: string[]
}

export function getDevProcess() {
  return devProcess
}

export function clearDevProcess() {
  devProcess = undefined
}

function createDevServer(projectRoot: string, port: number) {
  const childEnv: Record<string, string | undefined> = {
    BROWSER: 'none',
    BROWSERSLIST_ENV: 'development',
    NODE_ENV: 'development',
    WEAPP_TW_HMR_TIMING: '1',
    WEAPP_TW_WATCH_REGRESSION: '1',
    VITE_WEAPP_TW_WATCH_REGRESSION: '1',
    HOST: '127.0.0.1',
    PORT: String(port),
    UNI_CLI_SERVER_HOST: '127.0.0.1',
    UNI_CLI_SERVER_PORT: String(port),
    CHOKIDAR_USEPOLLING: process.env['CHOKIDAR_USEPOLLING'] ?? '1',
    CHOKIDAR_INTERVAL: process.env['CHOKIDAR_INTERVAL'] ?? '50',
  }
  childEnv['VITEST'] = undefined
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('VITEST_')) {
      childEnv[key] = undefined
    }
  }

  const child = spawnPnpm(projectRoot, [
    'exec',
    'cross-env',
    'WEAPP_TW_HMR_TIMING=1',
    'UNI_INPUT_DIR=.',
    'uni',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
  ], childEnv)
  devProcess = child
  return child
}

async function waitForUrl(url: string, child: ChildProcess, logs: string[], timeoutMs = serverTimeoutMs) {
  let lastError: unknown
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode != null) {
      throw new Error(`dev:h5 提前退出，exit=${child.exitCode}\n${logs.join('')}`)
    }
    try {
      return await fetchText(url)
    }
    catch (error) {
      lastError = error
    }
    await wait(pollIntervalMs)
  }

  throw new Error(`等待 URL 超时：${url}\nlast=${lastError instanceof Error ? lastError.message : String(lastError)}\n${logs.join('')}`)
}

async function waitForPath(baseUrl: string, requestPath: string, child: ChildProcess, logs: string[], timeoutMs = serverTimeoutMs) {
  let lastError: unknown
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    for (const candidate of resolveBaseUrls(logs, baseUrl)) {
      try {
        return {
          baseUrl: candidate,
          text: await waitForUrl(joinUrl(candidate, requestPath), child, logs, pollIntervalMs * 2),
        }
      }
      catch (error) {
        lastError = error
        if (child.exitCode != null) {
          throw error
        }
      }
    }
    await wait(pollIntervalMs)
  }

  throw new Error(`等待路径超时：${requestPath}\nlast=${lastError instanceof Error ? lastError.message : String(lastError)}\n${logs.join('')}`)
}

async function waitForCss(url: string, entries: Array<string | RegExp>, child: ChildProcess, logs: string[]) {
  const startedAt = Date.now()
  let latest = ''
  while (Date.now() - startedAt < serverTimeoutMs) {
    latest = await waitForUrl(url, child, logs, pollIntervalMs * 2)
    const ok = entries.every((entry) => {
      return typeof entry === 'string' ? latest.includes(entry) : entry.test(latest)
    })
    if (ok) {
      return latest
    }
    await wait(pollIntervalMs)
  }
  throw new Error(`等待 CSS 内容超时：${url}\n${latest.slice(0, 1000)}\n${logs.join('')}`)
}

function formatRuntimeStyleAssertions(assertions: WebRuntimeStyleAssertion[]) {
  return assertions.map(assertion => `${assertion.selector}: ${Object.keys(assertion.styles).join(', ')}`).join('; ')
}

function matchRuntimeStyles(actual: Record<string, string>, assertion: WebRuntimeStyleAssertion) {
  for (const [property, expected] of Object.entries(assertion.styles)) {
    const value = actual[property]
    if (typeof expected === 'string') {
      if (value !== expected) {
        return false
      }
    }
    else if (!expected.test(value ?? '')) {
      return false
    }
  }
  return true
}

async function readRuntimeStyles(page: Page, assertion: WebRuntimeStyleAssertion) {
  try {
    return await page.evaluate(({ selector, properties }) => {
      const element = document.querySelector(selector)
      if (!element) {
        return null
      }
      const computed = getComputedStyle(element)
      return Object.fromEntries(properties.map(property => [property, computed[property as keyof CSSStyleDeclaration]?.toString() ?? '']))
    }, {
      properties: Object.keys(assertion.styles),
      selector: assertion.selector,
    })
  }
  catch (error) {
    if (error instanceof Error && /Execution context was destroyed|Cannot find context with specified id/.test(error.message)) {
      return null
    }
    throw error
  }
}

async function collectPageSnapshot(page: Page) {
  try {
    return await page.evaluate(() => {
      return {
        body: document.body?.innerHTML.slice(0, 1200) ?? '',
        readyState: document.readyState,
        title: document.title,
        url: location.href,
      }
    })
  }
  catch (error) {
    return {
      body: '',
      readyState: 'unknown',
      title: '',
      url: page.url(),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function isShellPage(page: Page) {
  try {
    return await page.evaluate(() => document.body?.innerHTML.includes('<!--app-html-->') ?? false)
  }
  catch {
    return false
  }
}

async function waitForRuntimeStyles(page: Page, assertions: WebRuntimeStyleAssertion[] | undefined, label: string, logs: string[], diagnostics: WebPageDiagnostics, reloadShell = false) {
  if (!assertions?.length) {
    return
  }

  const startedAt = Date.now()
  let shellReloaded = false
  let latest: Array<{ actual: Record<string, string> | null, selector: string }> = []
  while (Date.now() - startedAt < serverTimeoutMs) {
    latest = []
    let ok = true
    for (const assertion of assertions) {
      const actual = await readRuntimeStyles(page, assertion)
      latest.push({ actual, selector: assertion.selector })
      if (!actual || !matchRuntimeStyles(actual, assertion)) {
        ok = false
        break
      }
    }
    if (ok) {
      return
    }
    if (reloadShell && !shellReloaded && latest.every(item => item.actual == null) && Date.now() - startedAt > 10_000 && await isShellPage(page)) {
      shellReloaded = true
      await page.reload({ waitUntil: 'domcontentloaded' })
    }
    await wait(pollIntervalMs)
  }

  const snapshot = await collectPageSnapshot(page)
  throw new Error(`等待 Web 运行时样式超时：${label}\nexpected=${formatRuntimeStyleAssertions(assertions)}\nactual=${JSON.stringify(latest)}\npage=${JSON.stringify(snapshot)}\npageRequests=${diagnostics.requests.join('\n')}\npageErrors=${diagnostics.errors.join('\n')}\npageWarnings=${diagnostics.warnings.join('\n')}\n${logs.join('')}`)
}

function resolveAnchor(source: string, anchors: string[]) {
  return anchors.find(anchor => source.includes(anchor))
}

async function mutateFile(file: string, anchors: string[], insertion: string) {
  const original = await readUtf8(file)
  const anchor = resolveAnchor(original, anchors)
  const index = anchor ? original.indexOf(anchor) : -1
  if (index < 0) {
    throw new Error(`找不到 HMR 插入锚点：${file}`)
  }
  const next = `${original.slice(0, index)}${insertion}\n\t\t${original.slice(index)}`
  await fs.writeFile(file, next, 'utf8')
  return async () => {
    await fs.writeFile(file, original, 'utf8')
  }
}

async function rewriteHmrMarker(file: string, anchors: string[], steps: WebHmrStep[], stepIndex: number) {
  const source = await readUtf8(file)
  const markerRE = /\n\t\t<view class="[^"]+">hbuilderx-web-hmr-[^<]+<\/view>/g
  const cleaned = source.replace(markerRE, '')
  const anchor = resolveAnchor(cleaned, anchors)
  const index = anchor ? cleaned.indexOf(anchor) : -1
  if (index < 0) {
    throw new Error(`找不到 HMR 插入锚点：${file}`)
  }
  const insertion = steps
    .slice(stepIndex, stepIndex + 1)
    .map(step => `<view class="${step.markerClass}">${step.markerText}</view>`)
    .join('\n\t\t')
  const next = `${cleaned.slice(0, index)}${insertion}\n\t\t${cleaned.slice(index)}`
  await fs.writeFile(file, next, 'utf8')
}

export async function runWebHmr(
  projectRoot: string,
  sourceFile: string,
  markerAnchors: string[],
  initialCssPath: string,
  hmrCssPath: string,
  initialCssContains: Array<string | RegExp>,
  initialRuntimeStyles: WebRuntimeStyleAssertion[] | undefined,
  hmrSteps: WebHmrStep[],
) {
  const port = await findFreePort()
  await runPnpm(projectRoot, ['run', 'predev:h5'], serverTimeoutMs)
  const child = createDevServer(projectRoot, port)
  const logs = collectProcessOutput(child)
  const baseUrl = `http://127.0.0.1:${port}/`
  const executablePath = await resolveChromeExecutable()
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: true,
  })
  let restore: (() => Promise<void>) | undefined

  try {
    const ready = await waitForPath(baseUrl, '/', child, logs)
    const page = await browser.newPage()
    const diagnostics: WebPageDiagnostics = {
      errors: [],
      requests: [],
      warnings: [],
    }
    page.on('requestfailed', (request) => {
      diagnostics.requests.push(`failed ${request.url()} ${request.failure()?.errorText ?? ''}`.trim())
    })
    page.on('response', (response) => {
      const url = response.url()
      if (response.status() >= 400 || url.endsWith('/') || /\/main|App\.uvue|index\.uvue|main\.css|@vite\/client|pages-json-js/.test(url)) {
        diagnostics.requests.push(`${response.status()} ${url}`)
      }
    })
    page.on('console', (message) => {
      if (message.type() === 'error') {
        diagnostics.errors.push(message.text())
      }
      else if (message.type() === 'warning') {
        diagnostics.warnings.push(message.text())
      }
    })
    page.on('pageerror', (error) => {
      diagnostics.errors.push(error.stack ?? error.message)
    })
    await page.goto(joinUrl(ready.baseUrl, '/'), { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.readyState !== 'loading')

    await waitForRuntimeStyles(page, initialRuntimeStyles, 'initial', logs, diagnostics, true)
    const initialCss = await waitForCss(joinUrl(ready.baseUrl, initialCssPath), initialCssContains, child, logs)
    restore = await mutateFile(sourceFile, markerAnchors, '')
    const hmrCss: string[] = []
    for (const [index, step] of hmrSteps.entries()) {
      await rewriteHmrMarker(sourceFile, markerAnchors, hmrSteps, index)
      await waitForRuntimeStyles(page, step.runtimeStyles, `hmr:${step.markerText}`, logs, diagnostics)
      hmrCss.push(await waitForCss(joinUrl(ready.baseUrl, hmrCssPath), step.cssContains, child, logs))
    }

    return {
      hmrCss,
      initialCss,
      pageHtml: ready.text,
    }
  }
  finally {
    if (restore) {
      await restore()
    }
    await browser.close()
  }
}
