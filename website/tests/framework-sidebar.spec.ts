import { expect, test } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tw.icebreaker.top/'
const frameworkLogos = [
  'html5',
  'expo',
  'lynx',
  'uni-app',
  'vite',
  'hbuilderx',
  'webpack',
  'uni-app-x',
  'taro',
  'weapp-vite',
  'mpx',
  'nodejs',
] as const

async function expandCategory(page: Parameters<typeof test>[0]['page'], name: string) {
  const category = page.getByRole('button', { name, exact: true })
  if (await category.getAttribute('aria-expanded') === 'false') {
    await category.click()
  }
  await expect(category).toHaveAttribute('aria-expanded', 'true')
}

for (const route of ['/docs/quick-start/install', '/en/docs/quick-start/install']) {
  test(`${route} renders framework logos for every setup item`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(new URL(route, baseURL).toString(), { waitUntil: 'networkidle' })

    for (const category of ['uni-app', 'Taro', 'Weapp-vite', 'Mpx']) {
      await expandCategory(page, category)
    }

    const items = page.locator('.theme-doc-sidebar-menu .framework-sidebar-item')
    await expect(items).toHaveCount(16)

    for (const logo of frameworkLogos) {
      const logoItems = page.locator(`.framework-sidebar-item--${logo}`)
      expect(await logoItems.count()).toBeGreaterThan(0)

      const style = await logoItems.first().locator(':scope > .menu__link, :scope > .menu__list-item-collapsible > .menu__link').first().evaluate((element) => {
        const pseudo = getComputedStyle(element, '::before')
        const label = element.querySelector('span')?.getBoundingClientRect()
        const link = element.getBoundingClientRect()
        return {
          backgroundImage: pseudo.backgroundImage,
          height: pseudo.height,
          width: pseudo.width,
          labelStartsAfterIcon: label ? label.left > link.left + 20 : false,
        }
      })

      expect(style.backgroundImage).not.toBe('none')
      expect(Number.parseFloat(style.width)).toBeCloseTo(24.8, 1)
      expect(Number.parseFloat(style.height)).toBeCloseTo(24.8, 1)
      expect(style.labelStartsAfterIcon).toBe(true)
    }
  })
}
