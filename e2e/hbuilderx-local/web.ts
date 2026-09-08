import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import type { Browser, Page } from 'playwright'
import type { WebHmrStep, WebRuntimeStyleAssertion } from './cases'
import type { WebPageDiagnostics } from './web/runtime'

import { appendFileSync } from 'node:fs'
import fs from 'node:fs/promises'

import path from 'pathe'
import { chromium } from 'playwright'

import {
  collectProcessOutput,
  fetchText,
  findFreePort,
  joinUrl,
  killProcessTree,
  pollIntervalMs,
  resolveBaseUrls,
  resolveChromeExecutable,
  runPnpm,
  serverTimeoutMs,
  wait,
} from './process'
import { appendHmrSourceMutation, createHmrSourceRestore } from './source-mutations'
import { cleanupWebHmrSession } from './web/cleanup'
import { clearDevProcess, createDevServer, createHBuilderXDevServer } from './web/dev-server'
import { assertServerIdentity, sameSourceFile } from './web/identity'
import { readRuntimeStyles, waitForHmrMarker, waitForInitialPageText, waitForRuntimeStyles } from './web/runtime'
import { rewriteHmrMarker } from './web/source'

export { clearDevProcess, getDevProcess } from './web/dev-server'

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
  const missing = entries.filter((entry) => {
    return typeof entry === 'string' ? !latest.includes(entry) : !entry.test(latest)
  })
  throw new Error(`等待 CSS 内容超时：${url}\nmissing=${missing.map(String).join(', ')}\n${latest.slice(0, 1000)}\n${logs.join('')}`)
}

export async function runWebHmr(
  projectRoot: string,
  sourceFile: string,
  markerAnchors: string[],
  initialCssPath: string,
  hmrCssPath: string,
  initialCssContains: Array<string | RegExp>,
  initialRuntimeStyles: WebRuntimeStyleAssertion[] | undefined,
  persistentRuntimeStyles: WebRuntimeStyleAssertion[] | undefined,
  hmrSteps: WebHmrStep[],
  launchWithHBuilderX = false,
  initialTextContains: string[] = [],
  serverIdentityPath?: string,
) {
  const port = await findFreePort()
  const artifactRoot = path.resolve(__dirname, '../.artifacts/web-hmr', `${path.basename(projectRoot)}-${Date.now()}`)
  await fs.mkdir(artifactRoot, { recursive: true })
  const logFile = path.join(artifactRoot, 'server.log')
  await fs.writeFile(logFile, '')
  let hbuilderxLaunch: Awaited<ReturnType<typeof createHBuilderXDevServer>> | undefined
  let child: ChildProcess | undefined
  let browser: Browser | undefined
  let page: Page | undefined
  const diagnostics: WebPageDiagnostics = { errors: [], requests: [], warnings: [] }
  let restore: (() => Promise<void>) | undefined

  try {
    await runPnpm(projectRoot, ['run', 'predev:h5'], serverTimeoutMs)
    hbuilderxLaunch = launchWithHBuilderX ? await createHBuilderXDevServer(projectRoot) : undefined
    child = hbuilderxLaunch?.child ?? createDevServer(projectRoot, port)
    const logs = hbuilderxLaunch?.logs ?? collectProcessOutput(child)
    // runner 的内存日志是滚动窗口；验收必须保留开始版本和中途错误的完整记录。
    let logBytes = 0
    let logError: unknown
    const captureLog = (chunk: Buffer) => {
      if (logError) {
        return
      }
      try {
        logBytes += chunk.length
        if (logBytes > 32 * 1024 * 1024) {
          throw new Error('Web 验证日志超过 32 MiB，停止以避免不完整证据')
        }
        appendFileSync(logFile, chunk)
      }
      catch (error) {
        logError = error
      }
    }
    child.stdout?.on('data', captureLog)
    child.stderr?.on('data', captureLog)
    const baseUrl = `http://127.0.0.1:${port}/`
    const executablePath = await resolveChromeExecutable()
    browser = await chromium.launch({
      ...(executablePath ? { executablePath } : {}),
      headless: true,
    })
    const ready = await waitForPath(baseUrl, '/', child, logs)
    if (serverIdentityPath) {
      const identity = JSON.parse(await fetchText(joinUrl(ready.baseUrl, serverIdentityPath)))
      assertServerIdentity(identity, await fs.realpath(projectRoot))
      await fs.writeFile(path.join(artifactRoot, 'identity.json'), JSON.stringify(identity, null, 2))
    }
    page = await browser.newPage()
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
        const location = message.location().url
        diagnostics.errors.push(`${message.text()}${location ? ` (${location})` : ''}`)
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
    await waitForInitialPageText(page, initialTextContains, logs, diagnostics)

    await waitForRuntimeStyles(page, initialRuntimeStyles, 'initial', logs, diagnostics, true)
    const initialCss = await waitForCss(joinUrl(ready.baseUrl, initialCssPath), initialCssContains, child, logs)
    await fs.writeFile(path.join(artifactRoot, 'initial.css'), initialCss)
    await page.screenshot({ path: path.join(artifactRoot, 'initial.png') })
    restore = await createHmrSourceRestore([
      sourceFile,
      ...hmrSteps.flatMap(step => step.sourceMutation ? [path.resolve(projectRoot, step.sourceMutation.file)] : []),
    ])
    const hmrCss: string[] = []
    for (const [index, step] of hmrSteps.entries()) {
      const sameFileReplace = step.sourceMutation?.replace && sameSourceFile(projectRoot, step.sourceMutation.file, sourceFile)
      if (step.sourceMutation && !sameFileReplace) {
        await appendHmrSourceMutation(projectRoot, step.sourceMutation)
        if (step.sourceMutation.cssContains?.length) {
          hmrCss.push(await waitForCss(joinUrl(ready.baseUrl, hmrCssPath), step.sourceMutation.cssContains, child, logs))
        }
      }
      await rewriteHmrMarker(sourceFile, markerAnchors, hmrSteps, index, sameFileReplace ? step.sourceMutation?.replace : undefined)
      await waitForHmrMarker(page, step.markerText)
      await waitForRuntimeStyles(page, [
        ...(persistentRuntimeStyles ?? []),
        ...(step.runtimeStyles ?? []),
      ], `hmr:${step.markerText}`, logs, diagnostics)
      const css = await waitForCss(joinUrl(ready.baseUrl, hmrCssPath), step.cssContains, child, logs)
      hmrCss.push(css)
      await fs.writeFile(path.join(artifactRoot, `save-${index + 1}.css`), css)
      await page.screenshot({ path: path.join(artifactRoot, `save-${index + 1}.png`) })
      if (step.reload) {
        await page.reload({ waitUntil: 'domcontentloaded' })
        await waitForHmrMarker(page, step.markerText)
        await waitForRuntimeStyles(page, [...(persistentRuntimeStyles ?? []), ...(step.runtimeStyles ?? [])], `reload:${step.markerText}`, logs, diagnostics)
      }
      await fs.writeFile(path.join(artifactRoot, `save-${index + 1}.json`), JSON.stringify({
        marker: step.markerText,
        styles: await Promise.all((step.runtimeStyles ?? []).map(assertion => readRuntimeStyles(page!, assertion))),
      }, null, 2))
    }
    const errorOverlay = page.locator('vite-error-overlay')
    const pageOverlayText = await errorOverlay.count() > 0
      ? await errorOverlay.first().textContent()
      : undefined
    if (logError) {
      throw logError
    }

    return {
      hmrCss,
      initialCss,
      pageErrors: diagnostics.errors,
      pageHtml: ready.text,
      pageOverlayText,
      pageWarnings: diagnostics.warnings,
      serverLogs: await fs.readFile(logFile, 'utf8'),
    }
  }
  catch (error) {
    await fs.writeFile(path.join(artifactRoot, 'failure.txt'), error instanceof Error ? error.stack ?? error.message : String(error))
    throw error
  }
  finally {
    try {
      await fs.writeFile(path.join(artifactRoot, 'diagnostics.json'), JSON.stringify(diagnostics, null, 2))
      if (page) {
        await fs.writeFile(path.join(artifactRoot, 'page.html'), await page.content().catch(() => ''))
        await page.screenshot({ path: path.join(artifactRoot, 'final.png') }).catch(() => {})
      }
    }
    finally {
      await cleanupWebHmrSession({
        closeBrowser: async () => browser?.close(),
        stopServer: () => {
          if (child) {
            killProcessTree(child)
            clearDevProcess()
          }
        },
        restoreSource: async () => restore?.(),
        closeProject: async () => hbuilderxLaunch?.cleanup(),
      })
    }
  }
}
