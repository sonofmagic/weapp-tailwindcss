import { URL } from 'node:url'
import { devices, expect, test } from '@playwright/test'
import routes from '../routes.json'

declare global {
  interface Window {
    __themeTransitionCalls?: number
  }
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tw.icebreaker.top/'

interface ViewportCase {
  name: string
  onlyBrowser?: 'chromium' | 'firefox' | 'webkit'
  use: Parameters<typeof test.use>[0]
}

function mobileUse(device: typeof devices['iPhone 12']): Parameters<typeof test.use>[0] {
  const {
    viewport,
    userAgent,
    deviceScaleFactor,
    isMobile,
    hasTouch,
    colorScheme,
  } = device

  return {
    viewport,
    userAgent,
    deviceScaleFactor,
    isMobile,
    hasTouch,
    colorScheme,
  }
}

const viewports: ViewportCase[] = [
  {
    name: 'desktop',
    use: {
      viewport: {
        width: 1280,
        height: 720,
      },
    },
  },
  {
    name: 'mobile',
    use: mobileUse(devices['iPhone 12']),
    onlyBrowser: 'chromium',
  },
] as const

test.describe('homepage hero layout', () => {
  test('desktop hero actions and platform icons stay visually compact', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    const hero = page.locator('.home-hero')
    const platformIcons = page.locator('.home-hero__platform-icon')
    const primaryCta = page.locator('.home-hero__actions .home-cta')
    const secondaryActions = page.locator('.home-hero__actions .ui-homepage-ai-entry a, .home-hero__actions .ui-homepage-community-entry a')
    const githubBadge = page.locator('.ui-homepage-github-badge')
    const pipeline = page.locator('.home-pipeline')

    await expect(hero).toBeVisible()
    await expect(platformIcons).toHaveCount(5)
    await expect(primaryCta).toBeVisible()
    await expect(primaryCta).toHaveText(/开始接入/)
    await expect(primaryCta).toHaveAttribute('href', '/docs/quick-start/install')
    await expect(secondaryActions).toHaveCount(2)
    await expect(githubBadge).toBeVisible()
    await expect(pipeline).toBeVisible()

    for (let index = 0; index < await platformIcons.count(); index += 1) {
      const box = await platformIcons.nth(index).boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeLessThanOrEqual(56)
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeLessThanOrEqual(56)
    }

    const srOnlyBoxes = await page.locator('.home-hero__platform-icon .sr-only').evaluateAll(elements => elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
      }
    }))
    expect(srOnlyBoxes).toHaveLength(5)
    for (const box of srOnlyBoxes) {
      expect(box.width).toBeLessThanOrEqual(1)
      expect(box.height).toBeLessThanOrEqual(1)
    }

    const primaryBox = await primaryCta.boundingBox()
    expect(primaryBox?.height).toBeGreaterThanOrEqual(44)
    expect(primaryBox?.width).toBeGreaterThan(132)
    const primaryStyle = await primaryCta.evaluate((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return {
        text: element.textContent?.trim() ?? '',
        whiteSpace: style.whiteSpace,
        width: rect.width,
      }
    })
    expect(primaryStyle.text).toContain('开始接入')
    expect(primaryStyle.whiteSpace).toBe('nowrap')
    expect(primaryStyle.width).toBeLessThan(180)

    const heroRect = await hero.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        bottom: rect.bottom,
        top: rect.top,
      }
    })
    const pipelineRect = await pipeline.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        bottom: rect.bottom,
        top: rect.top,
      }
    })
    expect(heroRect.top).toBeLessThan(140)
    expect(pipelineRect.bottom).toBeLessThanOrEqual(1000)

    const githubBadgeStyle = await githubBadge.evaluate((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      const icon = element.querySelector('.icon-\\[mdi--github\\]')
      const iconStyle = icon ? getComputedStyle(icon) : undefined
      const iconRect = icon?.getBoundingClientRect()
      return {
        alignItems: style.alignItems,
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        borderStyle: style.borderStyle,
        borderWidth: style.borderWidth,
        display: style.display,
        gap: style.gap,
        height: rect.height,
        iconHeight: iconRect?.height ?? 0,
        iconMaskImage: iconStyle?.maskImage ?? '',
        iconWidth: iconRect?.width ?? 0,
        minHeight: style.minHeight,
        paddingBlock: style.paddingBlock,
        paddingInline: style.paddingInline,
        width: rect.width,
      }
    })
    expect(githubBadgeStyle.display).toBe('flex')
    expect(githubBadgeStyle.alignItems).toBe('center')
    expect(githubBadgeStyle.height).toBeGreaterThanOrEqual(40)
    expect(githubBadgeStyle.width).toBeGreaterThan(120)
    expect(githubBadgeStyle.minHeight).toBe('40px')
    expect(githubBadgeStyle.gap).toBe('8px')
    expect(githubBadgeStyle.borderRadius).toBe('9999px')
    expect(githubBadgeStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(githubBadgeStyle.paddingInline).toBe('12px')
    expect(githubBadgeStyle.paddingBlock).toBe('8px')
    expect(githubBadgeStyle.iconWidth).toBeGreaterThan(12)
    expect(githubBadgeStyle.iconHeight).toBeGreaterThan(12)
    expect(githubBadgeStyle.iconMaskImage).toContain('data:image/svg+xml')

    const openAiIconFilter = await page
      .locator('.home-hero__actions [class~="icon-[logos--openai-icon]"]')
      .evaluate(element => getComputedStyle(element).filter)
    expect(openAiIconFilter).not.toBe('none')

    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })

  test('mobile hero actions fit without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await expect(page.locator('.home-hero__platform-strip')).toBeHidden()
    const primaryCta = page.locator('.home-hero__actions .home-cta')
    await expect(primaryCta).toBeVisible()
    await expect(primaryCta).toHaveText(/开始接入/)
    await expect(primaryCta).toHaveAttribute('href', '/docs/quick-start/install')

    const actionBoxes = await page.locator('.home-hero__actions a').evaluateAll(elements => elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        right: rect.right,
      }
    }))

    expect(actionBoxes).toHaveLength(3)
    for (const box of actionBoxes) {
      expect(box.height).toBeGreaterThanOrEqual(40)
      expect(box.left).toBeGreaterThanOrEqual(0)
      expect(box.right).toBeLessThanOrEqual(390)
    }

    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })
})

test.describe('color mode transition strategy', () => {
  test('desktop uses a short view transition for theme changes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark')
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value(callback: () => void | Promise<void>) {
          window.__themeTransitionCalls = (window.__themeTransitionCalls ?? 0) + 1
          const done = Promise.resolve(callback())
          return {
            ready: Promise.resolve(),
            finished: done,
            updateCallbackDone: done,
          }
        },
      })
    })
    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await page.locator('button[aria-label*="浅色/暗黑模式"]:visible').click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    const calls = await page.evaluate(() => window.__themeTransitionCalls ?? 0)
    expect(calls).toBe(1)
  })

  test('non fine-pointer environments skip view transitions for theme changes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark')
      const nativeMatchMedia = window.matchMedia.bind(window)
      window.matchMedia = (query: string) => {
        if (query.includes('hover: hover') || query.includes('pointer: fine')) {
          return {
            addEventListener: () => {},
            addListener: () => {},
            dispatchEvent: () => false,
            matches: false,
            media: query,
            onchange: null,
            removeEventListener: () => {},
            removeListener: () => {},
          }
        }
        return nativeMatchMedia(query)
      }
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value(callback: () => void | Promise<void>) {
          window.__themeTransitionCalls = (window.__themeTransitionCalls ?? 0) + 1
          const done = Promise.resolve(callback())
          return {
            ready: Promise.resolve(),
            finished: done,
            updateCallbackDone: done,
          }
        },
      })
    })
    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await page.locator('button[aria-label*="浅色/暗黑模式"]:visible').click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    const calls = await page.evaluate(() => window.__themeTransitionCalls ?? 0)
    expect(calls).toBe(0)
  })
})

for (const viewport of viewports) {
  test.describe(`${viewport.name} viewport`, () => {
    test.use(viewport.use)

    if (viewport.onlyBrowser) {
      test.skip(
        ({ browserName }) => browserName !== viewport.onlyBrowser,
        `Only run on ${viewport.onlyBrowser} to keep the suite fast`,
      )
    }

    for (const route of routes) {
      test(`${viewport.name} ${route} screenshot`, async ({ page }) => {
        const url = new URL(route, baseURL)
        await page.goto(url.toString(), {
          waitUntil: 'networkidle',
        })

        await expect(page).toHaveScreenshot({
          fullPage: true,
        })
      })
    }
  })
}
