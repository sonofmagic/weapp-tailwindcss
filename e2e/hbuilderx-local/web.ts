import type { ChildProcess } from 'node:child_process'
import type { WebHmrStep } from './cases'

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
  serverTimeoutMs,
  spawnPnpm,
  wait,
} from './process'

let devProcess: ChildProcess | undefined

export function getDevProcess() {
  return devProcess
}

export function clearDevProcess() {
  devProcess = undefined
}

function createDevServer(projectRoot: string, port: number) {
  const child = spawnPnpm(projectRoot, ['run', 'dev:h5'], {
    BROWSER: 'none',
    WEAPP_TW_HMR_TIMING: '1',
    WEAPP_TW_WATCH_REGRESSION: '1',
    VITE_WEAPP_TW_WATCH_REGRESSION: '1',
    HOST: '127.0.0.1',
    PORT: String(port),
    UNI_CLI_SERVER_HOST: '127.0.0.1',
    UNI_CLI_SERVER_PORT: String(port),
    CHOKIDAR_USEPOLLING: process.env['CHOKIDAR_USEPOLLING'] ?? '1',
    CHOKIDAR_INTERVAL: process.env['CHOKIDAR_INTERVAL'] ?? '50',
  })
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
    .slice(0, stepIndex + 1)
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
  hmrSteps: WebHmrStep[],
) {
  const port = await findFreePort()
  const child = createDevServer(projectRoot, port)
  const logs = collectProcessOutput(child)
  const baseUrl = `http://127.0.0.1:${port}/`
  const browser = await chromium.launch({
    executablePath: await resolveChromeExecutable(),
    headless: true,
  })
  let restore: (() => Promise<void>) | undefined

  try {
    const ready = await waitForPath(baseUrl, '/', child, logs)
    const page = await browser.newPage()
    await page.goto(joinUrl(ready.baseUrl, '/'), { waitUntil: 'domcontentloaded' })

    const initialCss = await waitForCss(joinUrl(ready.baseUrl, initialCssPath), initialCssContains, child, logs)
    restore = await mutateFile(sourceFile, markerAnchors, '')
    const hmrCss: string[] = []
    for (const [index, step] of hmrSteps.entries()) {
      await rewriteHmrMarker(sourceFile, markerAnchors, hmrSteps, index)
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
