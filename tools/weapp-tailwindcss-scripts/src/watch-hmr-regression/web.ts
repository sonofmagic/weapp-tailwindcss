import type { Buffer } from 'node:buffer'
import type { Browser, Page } from 'playwright'
import type { CliOptions, HmrMemoryDebugSample, MemoryUsageSample, PluginProcessSample, WatchCase, WebHmrConfig, WebHmrMetrics, WebHmrSourceClassReplacementMetrics } from './types'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { chromium } from 'playwright'
import {
  createLineCollector,
  createSpawnEnv,
  killProcessTreeOnPosix,
  killProcessTreeOnWindows,
  normalizeLogLine,
  parsePluginProcessSample,
  sampleProcessTreeMemory,
  sleep,
  spawnPnpm,
} from './session'
import { waitFor, writeFilePreserveEol } from './text'
import { resolveReloadAcceptAttemptTimeout, waitForWebCompileSettled } from './web-compile-settle'

const LOCAL_URL_RE = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])\S*/i
const RGB_RE = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
const DOM_REPLACEMENT_SELECTOR = '[data-tw-watch-web-dom]'
const WEB_HMR_MARKER_ATTACH_MIN_TIMEOUT_MS = 1_000

export function isWebCompileReadyLogLine(line: string) {
  return /ready in \d+|compiled successfully|compiled with (?:(?:some|\d+) )?warnings?|webpack\s+[\d.]+\s+compiled|webpack compiled|dev server running|(?:^|\s)Local:\s+https?:\/\/|开发服务已就绪|构建完成|编译成功/u.test(line)
}

export function isWebCompileDoneLogLine(line: string) {
  return /ready in \d+|compiled successfully|compiled with (?:(?:some|\d+) )?warnings?|webpack\s+[\d.]+\s+compiled|webpack compiled|构建完成|编译成功/u.test(line)
}

function collectPluginProcessMetrics(samples: PluginProcessSample[], startedAt: number) {
  const phaseSamples = samples.filter(sample => sample.at >= startedAt)
  const totalSamples = phaseSamples.filter(sample => sample.metric === 'total' || sample.phase === 'total')
  const budgetSamples = totalSamples.length > 0 ? totalSamples : phaseSamples
  return {
    samples: phaseSamples,
    totalMs: Math.max(0, ...budgetSamples.map(sample => sample.durationMs)),
  }
}

function hashPortSeed(value: string) {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 6)
  return Number.parseInt(hex, 16)
}

function resolveWebPort(watchCase: WatchCase) {
  const basePort = 42_000
  return basePort + (hashPortSeed(watchCase.name) % 1000)
}

function normalizeRgb(value: string) {
  const matched = value.trim().match(RGB_RE)
  if (!matched) {
    return value.trim()
  }
  return `rgb(${Number(matched[1])}, ${Number(matched[2])}, ${Number(matched[3])})`
}

function normalizeExpectedStyle(style: NonNullable<WebHmrConfig['expectedStyle']>) {
  return {
    backgroundColor: style.backgroundColor ? normalizeRgb(style.backgroundColor) : undefined,
    width: style.width,
    height: style.height,
  }
}

function resolveExpectedStyle(config: WebHmrConfig) {
  return normalizeExpectedStyle(config.expectedStyle ?? {
    backgroundColor: 'rgb(18, 52, 86)',
    width: '88px',
    height: '44px',
  })
}

function resolveRollbackExpectedStyle(config: WebHmrConfig) {
  return normalizeExpectedStyle(config.rollbackExpectedStyle ?? {
    backgroundColor: 'rgb(101, 67, 33)',
    width: '44px',
    height: '22px',
  })
}

function resolveRollbackClassLiteral(config: WebHmrConfig) {
  return config.rollbackClassLiteral ?? 'bg-[#654321] w-[44px] h-[22px]'
}

function createCssEntryContent(source: string, marker: string, classLiteral: string) {
  return `${source.trimEnd()}\n[data-tw-watch-web="${marker}"] { @apply ${classLiteral}; }\n`
}

export function resolveWebHmrMarkerAttachTimeout(pollMs: number) {
  return Math.max(pollMs, WEB_HMR_MARKER_ATTACH_MIN_TIMEOUT_MS)
}

function normalizeDomExpectedStyle(style: NonNullable<NonNullable<WebHmrConfig['sourceDomReplacementSequence']>[number]['expectedStyle']>) {
  return {
    color: style.color ? normalizeRgb(style.color) : undefined,
    backgroundColor: style.backgroundColor ? normalizeRgb(style.backgroundColor) : undefined,
    width: style.width,
    height: style.height,
  }
}

async function getElementComputedStyle(page: Page, marker: string) {
  return page.locator(`[data-tw-watch-web="${marker}"]`).evaluate((element) => {
    const style = window.getComputedStyle(element)
    return {
      backgroundColor: style.backgroundColor,
      width: style.width,
      height: style.height,
    }
  })
}

async function ensureInjectedMarkerElement(page: Page, marker: string, classLiteral?: string) {
  await page.evaluate(({ currentMarker, currentClassLiteral }) => {
    const selector = `[data-tw-watch-web="${currentMarker}"]`
    const existed = document.querySelector(selector)
    if (existed) {
      if (currentClassLiteral != null) {
        existed.className = currentClassLiteral
      }
      return
    }
    const element = document.createElement('div')
    element.dataset['twWatchWeb'] = currentMarker
    if (currentClassLiteral != null) {
      element.className = currentClassLiteral
    }
    element.textContent = `${currentMarker}-web`
    document.body.appendChild(element)
  }, {
    currentClassLiteral: classLiteral,
    currentMarker: marker,
  })
}

function createWebSourceMutation(config: WebHmrConfig, marker: string) {
  const classLiteral = config.classLiteral ?? 'bg-[#123456] w-[88px] h-[44px]'
  return {
    marker,
    classLiteral,
    mutate(source: string) {
      return config.mutate(source, {
        marker,
        classLiteral,
        classVariableName: '__twWatchWebClass',
      })
    },
  }
}

function createWebRollbackSourceMutation(config: WebHmrConfig, source: string, marker: string) {
  return config.mutate(source, {
    marker,
    classLiteral: resolveRollbackClassLiteral(config),
    classVariableName: '__twWatchWebRollbackClass',
  })
}

function assertComputedStyle(
  watchCase: WatchCase,
  marker: string,
  actual: Awaited<ReturnType<typeof getElementComputedStyle>>,
  expected: ReturnType<typeof resolveExpectedStyle>,
) {
  const normalizedActual = {
    ...actual,
    backgroundColor: normalizeRgb(actual.backgroundColor),
  }
  const failures = [
    expected.backgroundColor && normalizedActual.backgroundColor !== expected.backgroundColor
      ? `backgroundColor=${normalizedActual.backgroundColor}, expected=${expected.backgroundColor}`
      : undefined,
    expected.width && normalizedActual.width !== expected.width
      ? `width=${normalizedActual.width}, expected=${expected.width}`
      : undefined,
    expected.height && normalizedActual.height !== expected.height
      ? `height=${normalizedActual.height}, expected=${expected.height}`
      : undefined,
  ].filter(Boolean)

  if (failures.length > 0) {
    throw new Error(`[${watchCase.label}] web hmr computed style mismatch for ${marker}: ${failures.join('; ')}`)
  }

  return normalizedActual
}

function resolveDomReplacementSelector(item: NonNullable<WebHmrConfig['sourceDomReplacementSequence']>[number]) {
  return item.selector ?? DOM_REPLACEMENT_SELECTOR
}

async function getDomReplacementComputedStyle(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const style = window.getComputedStyle(element)
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      height: style.height,
      text: element.textContent ?? '',
      width: style.width,
    }
  })
}

function assertDomReplacement(
  watchCase: WatchCase,
  actual: Awaited<ReturnType<typeof getDomReplacementComputedStyle>>,
  expected: NonNullable<WebHmrConfig['sourceDomReplacementSequence']>[number],
) {
  const expectedStyle = normalizeDomExpectedStyle(expected.expectedStyle ?? {})
  const normalizedActual = {
    ...actual,
    backgroundColor: normalizeRgb(actual.backgroundColor),
    color: normalizeRgb(actual.color),
  }
  const actualText = normalizedActual.text.trim()
  const failures = [
    actualText !== expected.expectedText
      ? `text=${actualText}, expected=${expected.expectedText}`
      : undefined,
    expectedStyle.color && normalizedActual.color !== expectedStyle.color
      ? `color=${normalizedActual.color}, expected=${expectedStyle.color}`
      : undefined,
    expectedStyle.backgroundColor && normalizedActual.backgroundColor !== expectedStyle.backgroundColor
      ? `backgroundColor=${normalizedActual.backgroundColor}, expected=${expectedStyle.backgroundColor}`
      : undefined,
    expectedStyle.width && normalizedActual.width !== expectedStyle.width
      ? `width=${normalizedActual.width}, expected=${expectedStyle.width}`
      : undefined,
    expectedStyle.height && normalizedActual.height !== expectedStyle.height
      ? `height=${normalizedActual.height}, expected=${expectedStyle.height}`
      : undefined,
  ].filter(Boolean)

  if (failures.length > 0) {
    throw new Error(`[${watchCase.label}] web source DOM replacement mismatch for ${expected.label}: ${failures.join('; ')}`)
  }

  return {
    ...(expectedStyle.color ? { color: normalizedActual.color } : {}),
    ...(expectedStyle.backgroundColor ? { backgroundColor: normalizedActual.backgroundColor } : {}),
    ...(expectedStyle.width ? { width: normalizedActual.width } : {}),
    ...(expectedStyle.height ? { height: normalizedActual.height } : {}),
  }
}

async function collectStyleText(page: Page) {
  return await page.evaluate(() => {
    return [...document.querySelectorAll('style')]
      .map(style => style.textContent ?? '')
      .join('\n')
  })
}

export async function waitForWebPageReady(
  page: Pick<Page, 'goto' | 'locator'>,
  url: string,
  readySelector: string,
  options: Pick<CliOptions, 'timeoutMs' | 'pollMs'> & {
    ensureRunning?: () => void
    message?: string
  },
  startedAt = Date.now(),
) {
  const attemptTimeoutMs = Math.min(
    Math.max(options.pollMs * 1_500, 60_000),
    180_000,
    Math.max(options.timeoutMs, 1),
  )
  let lastError = ''

  return await waitFor(
    async () => {
      try {
        options.ensureRunning?.()
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: attemptTimeoutMs,
        })
        await page.locator(readySelector).waitFor({
          state: 'attached',
          timeout: attemptTimeoutMs,
        })
        return true
      }
      catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        return false
      }
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: options.message ?? `web page did not become ready in time: ${url}`,
    },
    startedAt,
  ).catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}${lastError ? `\n${lastError}` : ''}`)
  })
}

export async function waitForWebPageReloadReady(
  page: Pick<Page, 'reload' | 'locator'>,
  readySelector: string,
  options: Pick<CliOptions, 'timeoutMs' | 'pollMs'> & {
    ensureRunning?: () => void
    message?: string
  },
  startedAt = Date.now(),
) {
  const attemptTimeoutMs = Math.min(
    Math.max(options.pollMs * 100, 5_000),
    15_000,
    Math.max(options.timeoutMs, 1),
  )
  let lastError = ''

  return await waitFor(
    async () => {
      try {
        options.ensureRunning?.()
        await page.reload({
          waitUntil: 'domcontentloaded',
          timeout: attemptTimeoutMs,
        })
        await page.locator(readySelector).waitFor({
          state: 'attached',
          timeout: attemptTimeoutMs,
        })
        return true
      }
      catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        return false
      }
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: options.message ?? 'web page did not become ready after reload in time',
    },
    startedAt,
  ).catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}${lastError ? `\n${lastError}` : ''}`)
  })
}

async function runSourceClassReplacementSequence(
  watchCase: WatchCase,
  options: CliOptions,
  page: Page,
  config: WebHmrConfig,
  sourceOriginal: string,
) {
  const sequence = config.sourceClassReplacementSequence ?? []
  if (sequence.length === 0) {
    return undefined
  }

  const results: WebHmrSourceClassReplacementMetrics[] = []
  let currentSource = sourceOriginal

  for (const item of sequence) {
    if (!currentSource.includes(item.from)) {
      throw new Error(`[${watchCase.label}] web HMR source replacement anchor not found for ${item.label}: ${item.from}`)
    }
    const nextSource = currentSource.replace(item.from, item.to)
    if (nextSource === currentSource) {
      throw new Error(`[${watchCase.label}] web HMR source replacement produced no change for ${item.label}`)
    }

    const hotUpdateStartedAt = Date.now()
    process.stdout.write(
      `[watch-hmr] ${watchCase.label} web source-replacement=${item.label} from=${item.from} to=${item.to}\n`,
    )
    await writeFilePreserveEol(config.sourceFile, nextSource, sourceOriginal)

    let verifiedCssIncludes: string[] = []
    let lastError = ''
    const hotUpdateEffectiveMs = await waitFor(
      async () => {
        try {
          const styleText = await collectStyleText(page)
          verifiedCssIncludes = (item.expectedCssIncludes ?? [])
            .filter(needle => styleText.includes(needle))
          if (verifiedCssIncludes.length !== (item.expectedCssIncludes ?? []).length) {
            const missing = (item.expectedCssIncludes ?? []).filter(needle => !verifiedCssIncludes.includes(needle))
            throw new Error(`[${watchCase.label}] web HMR source replacement ${item.label} missing CSS fragments: ${missing.join(', ')}`)
          }
          return true
        }
        catch (error) {
          lastError = error instanceof Error ? error.message : String(error)
          return false
        }
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] web HMR source replacement did not apply: ${item.label}`,
      },
      hotUpdateStartedAt,
    ).catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`${message}${lastError ? `\n${lastError}` : ''}`)
    })

    results.push({
      label: item.label,
      from: item.from,
      to: item.to,
      verifiedCssIncludes,
      hotUpdateEffectiveMs,
    })
    currentSource = nextSource
  }

  return results
}

async function runSourceDomReplacementSequence(
  watchCase: WatchCase,
  options: CliOptions,
  page: Page,
  config: WebHmrConfig,
  sourceOriginal: string,
) {
  const sequence = config.sourceDomReplacementSequence ?? []
  if (sequence.length === 0) {
    return undefined
  }

  const results = []
  let currentSource = sourceOriginal

  for (const item of sequence) {
    const mutation = item.mutate(currentSource)
    if (mutation.next === currentSource) {
      throw new Error(`[${watchCase.label}] web source DOM replacement produced no change for ${item.label}`)
    }

    const hotUpdateStartedAt = Date.now()
    process.stdout.write(
      `[watch-hmr] ${watchCase.label} web source-dom-replacement=${item.label} from=${mutation.from} to=${mutation.to}\n`,
    )
    await writeFilePreserveEol(config.sourceFile, mutation.next, sourceOriginal)

    const selector = resolveDomReplacementSelector(item)
    let verifiedCssIncludes: string[] = []
    let computedStyle: ReturnType<typeof assertDomReplacement> | undefined
    let lastError = ''
    const hotUpdateEffectiveMs = await waitFor(
      async () => {
        try {
          await page.locator(selector).waitFor({
            state: 'attached',
            timeout: options.pollMs,
          })
          const styleText = await collectStyleText(page)
          verifiedCssIncludes = (item.expectedCssIncludes ?? [])
            .filter(needle => styleText.includes(needle))
          if (verifiedCssIncludes.length !== (item.expectedCssIncludes ?? []).length) {
            const missing = (item.expectedCssIncludes ?? []).filter(needle => !verifiedCssIncludes.includes(needle))
            throw new Error(`[${watchCase.label}] web source DOM replacement ${item.label} missing CSS fragments: ${missing.join(', ')}`)
          }
          computedStyle = assertDomReplacement(
            watchCase,
            await getDomReplacementComputedStyle(page, selector),
            item,
          )
          return true
        }
        catch (error) {
          lastError = error instanceof Error ? error.message : String(error)
          return false
        }
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] web source DOM replacement did not apply: ${item.label}`,
      },
      hotUpdateStartedAt,
    ).catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`${message}${lastError ? `\n${lastError}` : ''}`)
    })

    results.push({
      label: item.label,
      ...(item.selector ? { selector: item.selector } : {}),
      from: mutation.from,
      to: mutation.to,
      expectedText: item.expectedText,
      verifiedCssIncludes,
      computedStyle: computedStyle ?? {},
      hotUpdateEffectiveMs,
    })
    currentSource = mutation.next
  }

  return results
}

export function resolveChromiumLaunchOptions() {
  const candidates = [
    process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'],
    process.env['CHROME_BIN'],
    process.env['CHROMIUM_BIN'],
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter((item): item is string => Boolean(item))

  for (const executablePath of candidates) {
    if (existsSync(executablePath)) {
      return { executablePath, headless: true }
    }
  }

  return { headless: true }
}

async function launchBrowser() {
  try {
    return await chromium.launch(resolveChromiumLaunchOptions())
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[watch-hmr] failed to launch Playwright Chromium for web HMR: ${message}`)
  }
}

export async function runWebHmr(
  watchCase: WatchCase,
  options: CliOptions,
  sourceOriginals: Map<string, string>,
): Promise<WebHmrMetrics | undefined> {
  const config = watchCase.webHmr
  if (!config) {
    return undefined
  }

  const sourceOriginal = sourceOriginals.get(config.sourceFile)
  if (sourceOriginal == null) {
    throw new Error(`[${watchCase.label}] missing web HMR source original`)
  }
  const cssEntryOriginal = config.cssEntryFile ? sourceOriginals.get(config.cssEntryFile) : undefined
  if (config.cssEntryFile && cssEntryOriginal == null) {
    throw new Error(`[${watchCase.label}] missing web HMR CSS entry original`)
  }

  const startedAt = Date.now()
  const port = resolveWebPort(watchCase)
  const marker = `tw-watch-web-${watchCase.name}-${Date.now().toString().slice(-6)}`
  const mutation = createWebSourceMutation(config, marker)
  const mutatedSource = mutation.mutate(sourceOriginal)
  if (!config.injectMarkerElement && mutatedSource === sourceOriginal) {
    throw new Error(`[${watchCase.label}] web HMR mutation produced no source change`)
  }

  const lines: string[] = []
  let url = `http://127.0.0.1:${port}/`
  let readyAt = 0
  let lastCompileSignalAt = 0
  const pluginProcessSamples: PluginProcessSample[] = []
  const memoryDebugSamples: HmrMemoryDebugSample[] = []
  const memorySamples: MemoryUsageSample[] = []
  const child = spawnPnpm(['run', config.devScript, ...(config.devArgs ?? [])], {
    cwd: watchCase.cwd,
    env: createSpawnEnv(process.env, {
      BROWSER: 'none',
      WEAPP_TW_WATCH_REGRESSION: '1',
      VITE_WEAPP_TW_WATCH_REGRESSION: '1',
      HOST: '127.0.0.1',
      PORT: String(port),
      UNI_CLI_SERVER_HOST: '127.0.0.1',
      UNI_CLI_SERVER_PORT: String(port),
      TARO_CLI_SERVER_HOST: '127.0.0.1',
      TARO_CLI_SERVER_PORT: String(port),
      CHOKIDAR_USEPOLLING: process.env['CHOKIDAR_USEPOLLING'] ?? '1',
      CHOKIDAR_INTERVAL: process.env['CHOKIDAR_INTERVAL'] ?? '50',
      WATCHPACK_POLLING: process.env['WATCHPACK_POLLING'] ?? '50',
      WATCHPACK_POLLING_INTERVAL: process.env['WATCHPACK_POLLING_INTERVAL'] ?? '50',
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
      ...(config.env ?? {}),
    }),
    detached: process.platform !== 'win32',
    stdio: 'pipe',
  })

  const recordMemorySample = () => {
    const sample = sampleProcessTreeMemory(child.pid)
    if (!sample) {
      return
    }
    memorySamples.push(sample)
    if (memorySamples.length > 1000) {
      memorySamples.shift()
    }
  }
  const memoryTimer = setInterval(recordMemorySample, 1000)
  memoryTimer.unref?.()
  recordMemorySample()

  const collectLine = createLineCollector('web-watch', lines, 240, {
    quietSass: options.quietSass,
  })
  const collect = (chunk: Buffer | string) => {
    const text = chunk.toString()
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      const normalized = normalizeLogLine(line)
      const matchedUrl = normalized.match(LOCAL_URL_RE)?.[0]
      if (matchedUrl) {
        url = matchedUrl
      }
      if (isWebCompileReadyLogLine(normalized)) {
        readyAt = Date.now()
      }
      if (isWebCompileDoneLogLine(normalized)) {
        lastCompileSignalAt = Date.now()
      }
      const pluginSample = parsePluginProcessSample(line)
      if (pluginSample) {
        pluginProcessSamples.push({
          at: Date.now(),
          ...pluginSample,
        })
        if (pluginProcessSamples.length > 1000) {
          pluginProcessSamples.shift()
        }
      }
      const memoryDebug = pluginSample?.details?.['memoryDebug']
      if (pluginSample && memoryDebug && typeof memoryDebug === 'object' && !Array.isArray(memoryDebug)) {
        memoryDebugSamples.push({
          at: Date.now(),
          bundler: pluginSample.bundler,
          phase: pluginSample.phase,
          durationMs: pluginSample.durationMs,
          data: memoryDebug as Record<string, unknown>,
        })
        if (memoryDebugSamples.length > 1000) {
          memoryDebugSamples.shift()
        }
      }
    }
    collectLine(chunk)
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  let stopped = false
  const cleanupProcessResources = () => {
    if (stopped) {
      return
    }
    stopped = true
    clearInterval(memoryTimer)
    recordMemorySample()
    child.stdout.off('data', collect)
    child.stderr.off('data', collect)
    try {
      child.stdin.end()
    }
    catch {
    }
    try {
      child.stdin.destroy()
    }
    catch {
    }
    try {
      child.stdout.destroy()
    }
    catch {
    }
    try {
      child.stderr.destroy()
    }
    catch {
    }
  }

  const waitForCompileSettled = async (
    phaseStartedAt: number,
    phase: string,
    acceptWhen?: () => Promise<boolean>,
  ) => {
    const configuredTimeoutMs = phase === 'initial'
      ? (config.initialCompileSettleTimeoutMs ?? config.compileSettleTimeoutMs)
      : config.compileSettleTimeoutMs
    const timeoutMs = Math.min(
      options.timeoutMs,
      configuredTimeoutMs ?? 30_000,
    )
    const settleOptions = {
      getLastCompileSignalAt: () => lastCompileSignalAt,
      label: watchCase.label,
      phase,
      phaseStartedAt,
      pollMs: options.pollMs,
      timeoutMs,
      ensureRunning() {
        if (child.exitCode != null) {
          throw new Error(`[${watchCase.label}] web watch process exited unexpectedly with code ${child.exitCode}`)
        }
      },
    }
    if (acceptWhen) {
      Object.assign(settleOptions, { acceptWhen })
    }
    await waitForWebCompileSettled(settleOptions)
  }

  const stop = async () => {
    if (child.exitCode != null) {
      cleanupProcessResources()
      return
    }
    const kill = (signal: NodeJS.Signals) => {
      const childPid = child.pid
      if (childPid != null && process.platform === 'win32') {
        killProcessTreeOnWindows(childPid)
        return
      }
      if (childPid != null) {
        killProcessTreeOnPosix(childPid, signal)
        return
      }
      try {
        child.kill(signal)
      }
      catch {
      }
    }
    kill('SIGTERM')
    const stopStartedAt = Date.now()
    while (child.exitCode == null && Date.now() - stopStartedAt < 3000) {
      await sleep(100)
    }
    if (child.exitCode == null) {
      kill('SIGKILL')
    }
    cleanupProcessResources()
  }

  let browser: Browser | undefined
  try {
    await waitFor(
      async () => {
        if (child.exitCode != null) {
          throw new Error(`[${watchCase.label}] web watch process exited unexpectedly with code ${child.exitCode}`)
        }
        if (readyAt > startedAt) {
          return true
        }
        return false
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] web dev server did not become ready in time (${config.devScript})`,
      },
    )

    browser = await launchBrowser()
    const page = await browser.newPage()
    await waitForWebPageReady(page, url, config.readySelector ?? 'body', {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] web page did not become ready in time (${url})`,
      ensureRunning() {
        if (child.exitCode != null) {
          throw new Error(`[${watchCase.label}] web watch process exited unexpectedly with code ${child.exitCode}`)
        }
      },
    })
    if ((config.initialMutationDelayMs ?? 0) > 0) {
      await sleep(config.initialMutationDelayMs!)
    }
    if (config.injectMarkerElement) {
      await ensureInjectedMarkerElement(page, marker, mutation.classLiteral)
    }
    if (config.waitForInitialCompileSettled) {
      await waitForCompileSettled(startedAt, 'initial')
    }

    let lastStyleError = ''
    const reloadTimeoutMs = Math.min(options.timeoutMs, 120_000)
    const reloadAcceptAttemptTimeoutMs = resolveReloadAcceptAttemptTimeout(reloadTimeoutMs, options.pollMs)
    const createReloadedStyleAcceptWhen = (
      expectedStyle: ReturnType<typeof resolveExpectedStyle>,
      classLiteral: string,
    ) => {
      let lastReloadAttemptAt = 0
      return async () => {
        const now = Date.now()
        if (now - lastReloadAttemptAt < Math.max(options.pollMs * 4, 500)) {
          return false
        }
        lastReloadAttemptAt = now
        try {
          await page.reload({
            waitUntil: 'domcontentloaded',
            timeout: reloadAcceptAttemptTimeoutMs,
          })
          await page.locator(config.readySelector ?? 'body').waitFor({
            state: 'attached',
            timeout: reloadAcceptAttemptTimeoutMs,
          })
          if (config.injectMarkerElement) {
            await ensureInjectedMarkerElement(page, marker, classLiteral)
          }
          await page.locator(`[data-tw-watch-web="${marker}"]`).waitFor({
            state: 'attached',
            timeout: resolveWebHmrMarkerAttachTimeout(options.pollMs),
          })
          const currentStyle = await getElementComputedStyle(page, marker)
          assertComputedStyle(watchCase, marker, currentStyle, expectedStyle)
          return true
        }
        catch (error) {
          lastStyleError = error instanceof Error ? error.message : String(error)
          return false
        }
      }
    }

    const initialReadyMs = Date.now() - startedAt
    const hotUpdateStartedAt = Date.now()
    await writeFilePreserveEol(config.sourceFile, mutatedSource, sourceOriginal)
    if (config.cssEntryFile && cssEntryOriginal != null) {
      await writeFilePreserveEol(
        config.cssEntryFile,
        createCssEntryContent(cssEntryOriginal, marker, mutation.classLiteral),
        cssEntryOriginal,
      )
    }
    const expectedStyle = resolveExpectedStyle(config)
    if (config.reloadAfterCssMutation) {
      await waitForCompileSettled(hotUpdateStartedAt, 'hot-update', createReloadedStyleAcceptWhen(expectedStyle, mutation.classLiteral))
    }
    let computedStyle: WebHmrMetrics['computedStyle'] | undefined
    let hotUpdateEffectiveMs = 0
    try {
      hotUpdateEffectiveMs = await waitFor(
        async () => {
          try {
            if (config.injectMarkerElement) {
              await ensureInjectedMarkerElement(page, marker, mutation.classLiteral)
            }
            await page.locator(`[data-tw-watch-web="${marker}"]`).waitFor({
              state: 'attached',
              timeout: resolveWebHmrMarkerAttachTimeout(options.pollMs),
            })
            const currentStyle = await getElementComputedStyle(page, marker)
            computedStyle = assertComputedStyle(watchCase, marker, currentStyle, expectedStyle)
            return true
          }
          catch (error) {
            lastStyleError = error instanceof Error ? error.message : String(error)
            return false
          }
        },
        {
          timeoutMs: options.timeoutMs,
          pollMs: options.pollMs,
          message: `[${watchCase.label}] web HMR marker did not render with expected Tailwind style: ${marker}`,
        },
        hotUpdateStartedAt,
      )
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`${message}${lastStyleError ? `\n${lastStyleError}` : ''}`)
    }

    const rollbackStartedAt = Date.now()
    const rollbackExpectedStyle = resolveRollbackExpectedStyle(config)
    await writeFilePreserveEol(
      config.sourceFile,
      config.injectMarkerElement
        ? createWebRollbackSourceMutation(config, sourceOriginal, marker)
        : sourceOriginal,
      sourceOriginal,
    )
    if (config.cssEntryFile && cssEntryOriginal != null) {
      await writeFilePreserveEol(
        config.cssEntryFile,
        config.injectMarkerElement
          ? createCssEntryContent(cssEntryOriginal, marker, resolveRollbackClassLiteral(config))
          : cssEntryOriginal,
        cssEntryOriginal,
      )
    }
    if (config.reloadAfterCssMutation) {
      await waitForCompileSettled(rollbackStartedAt, 'rollback', createReloadedStyleAcceptWhen(rollbackExpectedStyle, resolveRollbackClassLiteral(config)))
    }
    const rollbackEffectiveMs = await waitFor(
      async () => {
        try {
          if (config.injectMarkerElement) {
            await ensureInjectedMarkerElement(page, marker, rollbackExpectedStyle ? resolveRollbackClassLiteral(config) : undefined)
          }
          if (!config.injectMarkerElement) {
            return await page.locator(`[data-tw-watch-web="${marker}"]`).count() === 0
          }
          const currentStyle = await getElementComputedStyle(page, marker)
          assertComputedStyle(watchCase, marker, currentStyle, rollbackExpectedStyle)
          return true
        }
        catch (error) {
          if (config.injectMarkerElement) {
            lastStyleError = error instanceof Error ? error.message : String(error)
          }
          return false
        }
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] web HMR marker did not switch to rollback Tailwind style: ${marker}`,
      },
      rollbackStartedAt,
    ).catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`${message}${lastStyleError ? `\n${lastStyleError}` : ''}`)
    })
    if (config.injectMarkerElement) {
      await page.locator(`[data-tw-watch-web="${marker}"]`).evaluate((element) => {
        element.remove()
      }).catch(() => {})
    }
    const hotUpdatePluginMetrics = collectPluginProcessMetrics(pluginProcessSamples, hotUpdateStartedAt)
    const rollbackPluginMetrics = collectPluginProcessMetrics(pluginProcessSamples, rollbackStartedAt)
    const sourceClassReplacementSequence = await runSourceClassReplacementSequence(
      watchCase,
      options,
      page,
      config,
      sourceOriginal,
    )
    const sourceDomReplacementSequence = await runSourceDomReplacementSequence(
      watchCase,
      options,
      page,
      config,
      sourceOriginal,
    )

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} web hmr passed (hotUpdate=${hotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms, url=${url})\n`,
    )

    return {
      devScript: config.devScript,
      sourceFile: config.sourceFile,
      url,
      marker,
      classLiteral: mutation.classLiteral,
      computedStyle: computedStyle!,
      initialReadyMs,
      hotUpdateEffectiveMs,
      hotUpdatePluginProcessMs: hotUpdatePluginMetrics.totalMs,
      hotUpdatePluginProcessSamples: hotUpdatePluginMetrics.samples,
      rollbackEffectiveMs,
      rollbackPluginProcessMs: rollbackPluginMetrics.totalMs,
      rollbackPluginProcessSamples: rollbackPluginMetrics.samples,
      ...(sourceClassReplacementSequence ? { sourceClassReplacementSequence } : {}),
      ...(sourceDomReplacementSequence ? { sourceDomReplacementSequence } : {}),
      memorySamples,
      ...(memoryDebugSamples.length > 0 ? { memoryDebugSamples } : {}),
      totalMs: Date.now() - startedAt,
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}\n[${watchCase.label}] recent web watch logs:\n${lines.join('\n')}`)
  }
  finally {
    try {
      await writeFilePreserveEol(config.sourceFile, sourceOriginal, sourceOriginal)
      if (config.cssEntryFile && cssEntryOriginal != null) {
        await writeFilePreserveEol(config.cssEntryFile, cssEntryOriginal, cssEntryOriginal)
      }
    }
    catch {
    }
    await browser?.close().catch(() => {})
    await stop()
  }
}
