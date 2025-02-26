import { URL } from 'node:url'
import { expect, test } from '@playwright/test'
import routes from '../routes.json'

test.use({
  viewport: {
    width: 1920, // 1280,
    height: 1080, // 720,
  },
})

for (const route of routes) {
  test(`${route} Screenshot`, async ({ page }) => {
    const url = new URL(route, 'https://tw.icebreaker.top/')
    await page.goto(url.toString())

    await expect(page).toHaveScreenshot({
      fullPage: true,
    })
  })
}
