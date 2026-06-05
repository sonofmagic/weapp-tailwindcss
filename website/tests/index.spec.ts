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
