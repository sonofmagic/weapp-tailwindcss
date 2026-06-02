import type { CliOptions } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import process from 'node:process'

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function getDevToolsReadTimeoutMs() {
  return readNumberEnv(
    'E2E_IDE_DEVTOOLS_READ_TIMEOUT_MS',
    Math.min(readNumberEnv('E2E_AUTOMATOR_TIMEOUT_MS', 20_000), 5000),
  )
}

export function getDevToolsVisibleTimeoutMs(options: CliOptions) {
  return Math.min(options.timeoutMs, readNumberEnv('E2E_IDE_VISIBLE_TIMEOUT_MS', 30_000))
}

export function getDevToolsBestEffortVisibleTimeoutMs(options: CliOptions) {
  return Math.min(getDevToolsVisibleTimeoutMs(options), readNumberEnv('E2E_IDE_BEST_EFFORT_VISIBLE_TIMEOUT_MS', 3000))
}

export function getDevToolsRelaunchTimeoutMs(options: CliOptions) {
  return Math.min(options.timeoutMs, readNumberEnv('E2E_IDE_RELAUNCH_TIMEOUT_MS', 20_000))
}

export async function withDevToolsReadTimeout<T>(pageUrl: string, task: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`DevTools live page read timed out after ${getDevToolsReadTimeoutMs()}ms: ${pageUrl}`))
        }, getDevToolsReadTimeoutMs())
      }),
    ])
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

function stringifyLiveValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }
  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}

async function readElementContent(element: any, label: string) {
  const parts: string[] = []
  const reads: Array<[string, () => Promise<unknown>]> = [
    ['text', () => element.text()],
    ['class', () => element.attribute('class')],
    ['outerWxml', () => element.outerWxml()],
  ]

  for (const [kind, read] of reads) {
    const value = await read().catch(() => undefined)
    if (value != null && value !== '') {
      parts.push(`[${label}:${kind}] ${stringifyLiveValue(value)}`)
    }
  }
  return parts.join('\n')
}

async function readSelectorContent(page: any, selector: string, limit: number) {
  const elements: any[] = selector === 'page'
    ? [await page.$('page').catch(() => undefined)].filter(Boolean)
    : await page.$$(selector).catch(() => [])
  const parts: string[] = []
  for (const [index, element] of elements.slice(0, limit).entries()) {
    const content = await readElementContent(element, `${selector}:${index}`)
    if (content) {
      parts.push(content)
    }
  }
  return parts.join('\n')
}

async function readPageLiveContentRaw(page: any) {
  const selectorLimit = readNumberEnv('E2E_IDE_LIVE_SELECTOR_LIMIT', 80)
  const selectors = ['page', 'view', 'text', 'button']
  const parts: string[] = []

  for (const selector of selectors) {
    const content = await readSelectorContent(page, selector, selectorLimit)
    if (content) {
      parts.push(content)
    }
  }

  const pageData = await page.data().catch(() => undefined)
  if (pageData != null) {
    parts.push(`[page:data] ${stringifyLiveValue(pageData)}`)
  }

  if (parts.length === 0) {
    throw new TypeError('Failed to read live page content for IDE hot update')
  }
  return parts.join('\n')
}

export async function readPageLiveContent(page: any, pageUrl: string) {
  return await withDevToolsReadTimeout(pageUrl, readPageLiveContentRaw(page))
}
