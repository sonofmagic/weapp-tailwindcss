import { URL } from 'node:url'
import { devices, expect, test } from '@playwright/test'
import routes from '../routes.json'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tw.icebreaker.top/'

interface ViewportCase {
  name: string
  onlyBrowser?: 'chromium' | 'firefox' | 'webkit'
  use: Parameters<typeof test.use>[0]
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

    await expect(hero).toBeVisible()
    await expect(platformIcons).toHaveCount(5)
    await expect(primaryCta).toBeVisible()
    await expect(secondaryActions).toHaveCount(2)

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
    expect(primaryBox?.width).toBeGreaterThan(140)

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
    await expect(page.locator('.home-hero__actions .home-cta')).toBeVisible()

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
