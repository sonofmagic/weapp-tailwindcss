import { expect, test } from '@playwright/test'

test('Has title', async ({ page }) => {
  await page.goto('https://tw.icebreaker.top/')

  await expect(page).toHaveTitle(/weapp-tailwindcss/)
})

test('HomePage Screenshot', async ({ page }) => {
  await page.goto('https://tw.icebreaker.top/')

  await expect(page).toHaveScreenshot()
})
