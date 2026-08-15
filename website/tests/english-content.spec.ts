import process from 'node:process'
import { expect, test } from '@playwright/test'
import routes from '../routes.json'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tw.icebreaker.top/'
const HAN_CHARACTER_RE = /[\u3400-\u9FFF\uF900-\uFAFF]/

function assertContainsNoChinese(value: string, context: string) {
  expect(value, `${context} contains Chinese text`).not.toMatch(HAN_CHARACTER_RE)
}

async function getNaturalLanguageText(page: import('@playwright/test').Page) {
  return page.locator('body').evaluate((body) => {
    const copy = body.cloneNode(true) as HTMLElement
    copy.querySelectorAll('nav, footer, pre, code, svg, script, style, .theme-doc-toc-desktop, .theme-doc-pagination, .pagination-nav, .mermaid, .mermaid-container').forEach(node => node.remove())
    return copy.textContent ?? ''
  })
}

const englishRoutes = [
  '/',
  ...routes.filter(route => route !== '/zh-cn' && !route.startsWith('/zh-cn/')),
]

test.describe('English content isolation', () => {
  for (const route of new Set(englishRoutes)) {
    test(`English route ${route}`, async ({ page }) => {
      const response = await page.goto(new URL(route, baseURL).toString(), {
        waitUntil: 'domcontentloaded',
      })
      expect(response?.ok(), `${route} should return a successful response`).toBe(true)

      assertContainsNoChinese(await getNaturalLanguageText(page), `${route} main content`)
      assertContainsNoChinese(await page.title(), `${route} title`)
      await expect(page.locator('html')).toHaveAttribute('lang', /^en/i)
      await expect(page.locator('meta[http-equiv="Content-Language"]')).toHaveAttribute('content', /^en/i)
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')

      const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href')
      expect(canonical, `${route} canonical should target the English site`).not.toContain('/zh-cn')
      const englishAlternate = await page.locator('link[rel="alternate"][hreflang="en-US"]').getAttribute('href')
      expect(englishAlternate, `${route} should expose an English alternate`).not.toContain('/zh-cn')
      const chineseAlternate = await page.locator('link[rel="alternate"][hreflang="zh-CN"]').getAttribute('href')
      expect(chineseAlternate, `${route} should expose a Chinese alternate`).toContain('/zh-cn')

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
    })
  }

  test('English navbar exposes showcase and options', async ({ page }) => {
    await page.goto(baseURL, {
      waitUntil: 'domcontentloaded',
    })

    const navbar = page.locator('nav')
    await expect(navbar.getByRole('link', { name: 'Showcase', exact: true })).toHaveAttribute('href', '/docs/showcase')
    await expect(navbar.getByRole('link', { name: 'Options', exact: true })).toHaveAttribute('href', '/docs/api/interfaces/UserDefinedOptions')
  })

  test('locale menu names both languages and English 404 contains no Chinese text', async ({ page }) => {
    await page.goto(baseURL, {
      waitUntil: 'domcontentloaded',
    })

    const localeDropdown = page.locator('.navbar__item.dropdown').filter({ hasText: 'English' }).first()
    await localeDropdown.hover()
    await expect(localeDropdown.locator('a[lang^="zh"]')).toHaveText('中文')
    await expect(localeDropdown.locator('a[lang^="zh"]')).toHaveAttribute('href', '/zh-cn/')

    const response = await page.goto(new URL('/404.html', baseURL).toString(), {
      waitUntil: 'domcontentloaded',
    })
    expect(response?.ok()).toBe(true)
    assertContainsNoChinese(await getNaturalLanguageText(page), 'English 404 body')
    assertContainsNoChinese(await page.title(), 'English 404 title')
  })

  test('English LLM assets and blog feeds contain no Chinese text', async ({ request }) => {
    const assetPaths = [
      '/llms-index.json',
      '/llms-index-full.json',
      '/llms.txt',
      '/llms-full.txt',
      '/llms-quickstart.txt',
      '/llms-api.txt',
      '/wetw/registry.json',
      '/blog/rss.xml',
      '/blog/atom.xml',
    ]

    for (const assetPath of assetPaths) {
      const response = await request.get(new URL(assetPath, baseURL).toString())
      expect(response.ok(), `${assetPath} should return a successful response`).toBe(true)
      assertContainsNoChinese(await response.text(), assetPath)
    }
  })
})
