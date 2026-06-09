import type { Buffer } from 'node:buffer'
import type { Browser, Page } from 'playwright'
import type { RuntimeContext } from './types.ts'
import fs from 'node:fs/promises'
import path from 'pathe'
import { PNG } from 'pngjs'

function analyzeScreenshot(buffer: Buffer) {
  const { data, height, width } = PNG.sync.read(buffer)
  let visiblePixels = 0
  let nonWhitePixels = 0
  const totalPixels = width * height
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 255
    if (alpha < 8) {
      continue
    }
    visiblePixels += 1
    const red = data[index] ?? 255
    const green = data[index + 1] ?? 255
    const blue = data[index + 2] ?? 255
    if (red < 248 || green < 248 || blue < 248) {
      nonWhitePixels += 1
    }
  }
  return {
    height,
    nonWhitePixels,
    nonWhiteRatio: totalPixels === 0 ? 0 : nonWhitePixels / totalPixels,
    totalPixels,
    visiblePixels,
    width,
  }
}

function assertScreenshotVisible(visual: Awaited<ReturnType<typeof analyzeScreenshot>>, name: string) {
  const minNonWhitePixels = Math.max(200, Math.floor(visual.totalPixels * 0.001))
  if (visual.visiblePixels === 0 || visual.nonWhitePixels < minNonWhitePixels) {
    throw new Error(
      `Demo visual screenshot "${name}" looks blank: nonWhitePixels=${visual.nonWhitePixels}, `
      + `visiblePixels=${visual.visiblePixels}, totalPixels=${visual.totalPixels}`,
    )
  }
}

export async function collectPageEvidence(page: Page) {
  return await page.evaluate(`(() => {
    const pick = (selector) => {
      const el = document.querySelector(selector)
      if (!el) {
        return null
      }
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        selector,
        text: el.textContent?.trim().slice(0, 120) ?? '',
        className: el.getAttribute('class') ?? '',
        rect: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        },
        display: style.display,
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        fontSize: style.fontSize,
      }
    }
    return {
      readyState: document.readyState,
      title: document.title,
      url: location.href,
      bodyText: document.body?.textContent?.trim().slice(0, 240) ?? '',
      bodyHeight: document.body?.scrollHeight ?? 0,
      samples: ['body', '#app', '#root', 'main', 'page', '.taro_page', '.content', '.index']
        .map(pick)
        .filter(Boolean),
    }
  })()`)
}

async function hideKnownDevOverlays(page: Page) {
  return await page.evaluate(`(() => {
    const overlayTextRE = /Compiled with problems:|webpackExports|webpack-dev-server|WARNING in/i
    const removed = []
    const hidden = []
    const candidates = [
      ...document.querySelectorAll('iframe, [id*="webpack"], [class*="webpack"], [id*="overlay"], [class*="overlay"], [style*="z-index"]'),
    ]
    for (const el of candidates) {
      const text = el.textContent || ''
      const html = el.outerHTML || ''
      if (!overlayTextRE.test(text) && !overlayTextRE.test(html)) {
        continue
      }
      const label = [
        el.tagName.toLowerCase(),
        el.id ? '#' + el.id : '',
        el.getAttribute('class') ? '.' + String(el.getAttribute('class')).replace(/\\s+/g, '.') : '',
      ].join('')
      removed.push(label)
      el.remove()
    }
    for (const root of [document.body, document.documentElement]) {
      if (!root) {
        continue
      }
      const text = root.textContent || ''
      if (!overlayTextRE.test(text)) {
        continue
      }
      for (const el of document.querySelectorAll('body > *')) {
        const style = getComputedStyle(el)
        const zIndex = Number.parseInt(style.zIndex || '0', 10)
        if ((style.position === 'fixed' || style.position === 'absolute') && zIndex >= 1000 && overlayTextRE.test(el.textContent || '')) {
          hidden.push(el.tagName.toLowerCase())
          el.remove()
        }
      }
    }
    return {
      removed,
      hidden,
      remainingOverlayText: overlayTextRE.test(document.body?.textContent || ''),
    }
  })()`)
}

export async function prepareScreenshotPage(browser: Browser, url: string, context: RuntimeContext) {
  const page = await browser.newPage({ viewport: context.viewport })
  const diagnostics = {
    console: [] as string[],
    requests: [] as string[],
  }
  page.on('console', message => diagnostics.console.push(`${message.type()}: ${message.text()}`))
  page.on('requestfailed', request => diagnostics.requests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`.trim()))
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Math.min(context.timeoutMs, 60_000) })
  await page.waitForFunction(() => document.readyState !== 'loading', undefined, { timeout: 30_000 })
  await page.waitForFunction(() => (document.body?.textContent?.trim().length ?? 0) > 0, undefined, { timeout: 30_000 })
  return { diagnostics, page }
}

export async function capturePageScreenshot(page: Page, screenshot: string, name: string) {
  const overlay = await hideKnownDevOverlays(page)
  await fs.mkdir(path.dirname(screenshot), { recursive: true })
  const screenshotBuffer = await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
  const visual = await analyzeScreenshot(screenshotBuffer)
  assertScreenshotVisible(visual, name)
  const evidence = await collectPageEvidence(page)
  return { evidence, overlay, screenshot, visual }
}

export async function screenshotPage(browser: Browser, url: string, screenshot: string, name: string, context: RuntimeContext) {
  const { diagnostics, page } = await prepareScreenshotPage(browser, url, context)
  try {
    const captured = await capturePageScreenshot(page, screenshot, name)
    return { diagnostics, ...captured }
  }
  finally {
    await page.close()
  }
}
