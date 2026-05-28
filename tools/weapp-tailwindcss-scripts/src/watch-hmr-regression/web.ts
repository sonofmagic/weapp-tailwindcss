import type { Buffer } from 'node:buffer'
import type { Browser, Page } from 'playwright'
import type { CliOptions, WatchCase, WebHmrConfig, WebHmrMetrics, WebHmrSourceClassReplacementMetrics } from './types'
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
  sleep,
  spawnPnpm,
} from './session'
import { waitFor, writeFilePreserveEol } from './text'

const LOCAL_URL_RE = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])\S*/i
const RGB_RE = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/

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

async function ensureInjectedMarkerElement(page: Page, marker: string) {
  await page.evaluate((currentMarker) => {
    const selector = `[data-tw-watch-web="${currentMarker}"]`
    if (document.querySelector(selector)) {
      return
    }
    const element = document.createElement('div')
    element.dataset['twWatchWeb'] = currentMarker
    element.textContent = `${currentMarker}-web`
    document.body.appendChild(element)
  }, marker)
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

async function collectStyleText(page: Page) {
  return await page.evaluate(() => {
    return [...document.querySelectorAll('style')]
      .map(style => style.textContent ?? '')
      .join('\n')
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
        readyAt = Date.now()
      }
      if (/ready in \d+|compiled successfully|webpack\s+[\d.]+\s+compiled|webpack compiled|dev server running|local:/i.test(normalized)) {
        readyAt = Date.now()
        lastCompileSignalAt = readyAt
      }
    }
    collectLine(chunk)
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const waitForWebCompileSettled = async (phaseStartedAt: number, phase: string) => {
    const stableWindowMs = Math.min(Math.max(options.pollMs * 2, 600), 1500)
    const timeoutMs = Math.min(options.timeoutMs, 30_000)
    await waitFor(
      () => {
        if (child.exitCode != null) {
          throw new Error(`[${watchCase.label}] web watch process exited unexpectedly with code ${child.exitCode}`)
        }
        return lastCompileSignalAt > phaseStartedAt
          && Date.now() - lastCompileSignalAt >= stableWindowMs
      },
      {
        timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] web ${phase} compile did not settle in time`,
      },
      phaseStartedAt,
    )
  }

  const stop = async () => {
    if (child.exitCode != null) {
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
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: Math.min(options.timeoutMs, 60_000),
    })
    await page.locator(config.readySelector ?? 'body').waitFor({
      state: 'attached',
      timeout: Math.min(options.timeoutMs, 60_000),
    })
    if ((config.initialMutationDelayMs ?? 0) > 0) {
      await sleep(config.initialMutationDelayMs!)
    }
    if (config.injectMarkerElement) {
      await ensureInjectedMarkerElement(page, marker)
    }

    const initialReadyMs = Date.now() - startedAt
    const hotUpdateStartedAt = Date.now()
    if (!config.injectMarkerElement) {
      await writeFilePreserveEol(config.sourceFile, mutatedSource, sourceOriginal)
    }
    if (config.cssEntryFile && cssEntryOriginal != null) {
      await writeFilePreserveEol(
        config.cssEntryFile,
        createCssEntryContent(cssEntryOriginal, marker, mutation.classLiteral),
        cssEntryOriginal,
      )
    }
    if (config.reloadAfterCssMutation) {
      await waitForWebCompileSettled(hotUpdateStartedAt, 'hot-update')
      await page.reload({
        waitUntil: 'domcontentloaded',
        timeout: Math.min(options.timeoutMs, 60_000),
      })
      await page.locator(config.readySelector ?? 'body').waitFor({
        state: 'attached',
        timeout: Math.min(options.timeoutMs, 60_000),
      })
    }
    const expectedStyle = resolveExpectedStyle(config)
    let computedStyle: WebHmrMetrics['computedStyle'] | undefined
    let lastStyleError = ''
    let hotUpdateEffectiveMs = 0
    try {
      hotUpdateEffectiveMs = await waitFor(
        async () => {
          try {
            if (config.injectMarkerElement) {
              await ensureInjectedMarkerElement(page, marker)
            }
            await page.locator(`[data-tw-watch-web="${marker}"]`).waitFor({
              state: 'attached',
              timeout: options.pollMs,
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
    if (!config.injectMarkerElement) {
      await writeFilePreserveEol(config.sourceFile, sourceOriginal, sourceOriginal)
    }
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
      await waitForWebCompileSettled(rollbackStartedAt, 'rollback')
      await page.reload({
        waitUntil: 'domcontentloaded',
        timeout: Math.min(options.timeoutMs, 60_000),
      })
      await page.locator(config.readySelector ?? 'body').waitFor({
        state: 'attached',
        timeout: Math.min(options.timeoutMs, 60_000),
      })
    }
    const rollbackEffectiveMs = await waitFor(
      async () => {
        try {
          if (config.injectMarkerElement) {
            await ensureInjectedMarkerElement(page, marker)
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
    const sourceClassReplacementSequence = await runSourceClassReplacementSequence(
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
      rollbackEffectiveMs,
      ...(sourceClassReplacementSequence ? { sourceClassReplacementSequence } : {}),
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
