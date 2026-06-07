import type { Browser, Page } from 'playwright'
import type { RuntimeContext } from './types.ts'
import path from 'pathe'

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

export async function screenshotPage(browser: Browser, url: string, name: string, context: RuntimeContext) {
  const page = await browser.newPage({ viewport: context.viewport })
  const screenshot = path.join(context.artifactRoot, 'screenshots', `${name}.png`)
  const diagnostics = {
    console: [] as string[],
    requests: [] as string[],
  }
  page.on('console', message => diagnostics.console.push(`${message.type()}: ${message.text()}`))
  page.on('requestfailed', request => diagnostics.requests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`.trim()))
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Math.min(context.timeoutMs, 60_000) })
  await page.waitForFunction(() => document.readyState !== 'loading', undefined, { timeout: 30_000 })
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
  const evidence = await collectPageEvidence(page)
  await page.close()
  return { diagnostics, evidence, screenshot }
}
