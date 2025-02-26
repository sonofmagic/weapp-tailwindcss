import { URL } from 'node:url'
import { expect, test } from '@playwright/test'
import routes from '../routes.json'

for (const route of routes) {
  test(`${route} Screenshot`, async ({ page }) => {
    const url = new URL(route, 'https://tw.icebreaker.top/')
    await page.goto(url.toString())

    await expect(page).toHaveScreenshot({
      fullPage: true,
    })
  })
}
