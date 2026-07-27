import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { expect, test } from '@playwright/test'
import routes from '../routes.json'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tw.icebreaker.top/'
const HAN_CHARACTER_RE = /[\u3400-\u9FFF\uF900-\uFAFF]/
const netlifyConfig = readFileSync(path.resolve(__dirname, '../../netlify.toml'), 'utf8')

function assertContainsNoChinese(value: string, context: string) {
  expect(value, `${context} contains Chinese text`).not.toMatch(HAN_CHARACTER_RE)
}

const englishRoutes = [
  '/en/',
  ...routes.filter(route => route === '/en' || route.startsWith('/en/')),
]

test.describe('English content isolation', () => {
  test('all generated English pages contain no visible Chinese text', async ({ page }) => {
    test.setTimeout(120_000)

    for (const route of new Set(englishRoutes)) {
      const response = await page.goto(new URL(route, baseURL).toString(), {
        waitUntil: 'networkidle',
      })
      expect(response?.ok(), `${route} should return a successful response`).toBe(true)

      assertContainsNoChinese(await page.locator('body').textContent() ?? '', `${route} body`)
      assertContainsNoChinese(await page.title(), `${route} title`)
      await expect(page.locator('html')).toHaveAttribute('lang', /^en/i)
      await expect(page.locator('meta[http-equiv="Content-Language"]')).toHaveAttribute('content', /^en/i)
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')

      const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href')
      expect(canonical, `${route} canonical should target the English site`).toContain('/en')
      const englishAlternate = await page.locator('link[rel="alternate"][hreflang="en-US"]').getAttribute('href')
      expect(englishAlternate, `${route} should expose an English alternate`).toContain('/en')

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      if (description) {
        assertContainsNoChinese(description, `${route} description`)
      }

      const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
      for (const value of structuredData) {
        assertContainsNoChinese(value, `${route} structured data`)
        if (value.includes('"inLanguage"')) {
          expect(value, `${route} structured data should use English`).toContain('"inLanguage":"en-US"')
        }
      }
    }
  })

  test('locale menu and English 404 contain no Chinese text', async ({ page }) => {
    await page.goto(new URL('/en/', baseURL).toString(), {
      waitUntil: 'domcontentloaded',
    })

    const localeDropdown = page.locator('.navbar__item.dropdown').filter({ hasText: 'English' }).first()
    await localeDropdown.hover()
    assertContainsNoChinese(await page.locator('body').textContent() ?? '', 'English locale menu')

    const response = await page.goto(new URL('/en/404.html', baseURL).toString(), {
      waitUntil: 'domcontentloaded',
    })
    expect(response?.ok()).toBe(true)
    assertContainsNoChinese(await page.locator('body').textContent() ?? '', 'English 404 body')
    assertContainsNoChinese(await page.title(), 'English 404 title')

    const english404Rule = 'from = "/en/*"\nto = "/en/404.html"\nstatus = 404'
    expect(netlifyConfig).toContain(english404Rule)
    expect(netlifyConfig.indexOf(english404Rule)).toBeLessThan(netlifyConfig.indexOf('from = "/*"'))
  })

  test('English LLM assets and blog feeds contain no Chinese text', async ({ request }) => {
    const assetPaths = [
      '/en/llms-index.json',
      '/en/llms.txt',
      '/en/llms-full.txt',
      '/en/llms-quickstart.txt',
      '/en/wetw/registry.json',
      '/en/blog/rss.xml',
      '/en/blog/atom.xml',
    ]

    for (const assetPath of assetPaths) {
      const response = await request.get(new URL(assetPath, baseURL).toString())
      expect(response.ok(), `${assetPath} should return a successful response`).toBe(true)
      assertContainsNoChinese(await response.text(), assetPath)
    }
  })
})
