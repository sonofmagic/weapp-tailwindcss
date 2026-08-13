import { URL } from 'node:url'
import { devices, expect, test } from '@playwright/test'
import routes from '../routes.json'

declare global {
  interface Window {
    __themeTransitionCalls?: number
  }
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tw.icebreaker.top/'
const localeStorageKey = 'weapp-tailwindcss:website:locale'

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

async function setStoredLocale(page: Parameters<typeof test>[0]['page'], locale: 'zh-cn' | 'en') {
  await page.addInitScript(({ key, value }) => {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, value)
    }
  }, { key: localeStorageKey, value: locale })
}

async function setNavigatorLanguages(page: Parameters<typeof test>[0]['page'], languages: string[]) {
  await page.addInitScript((values) => {
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      get: () => values[0] ?? 'zh-CN',
    })
    Object.defineProperty(window.navigator, 'languages', {
      configurable: true,
      get: () => values,
    })
  }, languages)
}

test.describe('homepage hero layout', () => {
  test('desktop hero actions and platform icons stay visually compact', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
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
    await expect(platformIcons).toHaveCount(7)
    const platformLabels = await platformIcons.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))
    expect(platformLabels).toEqual(['Web', '小程序', 'Android', 'iOS', 'HarmonyOS', 'React Native', 'Lynx'])
    const platformHrefs = await platformIcons.evaluateAll(elements => elements.map(element => element.getAttribute('href')))
    expect(platformHrefs).toEqual([
      '/docs/intro',
      '/docs/quick-start/native/install',
      '/docs/quick-start/frameworks/uni-app-x',
      '/docs/quick-start/frameworks/uni-app-x',
      '/docs/quick-start/frameworks/uni-app-x',
      '/docs/quick-start/react-native-expo',
      '/docs/quick-start/frameworks/lynx',
    ])
    await expect(platformIcons.nth(0).locator('[class~="icon-[logos--html-5]"]')).toHaveCount(1)
    await expect(platformIcons.nth(1).locator('.home-hero__platform-logo--mini-program')).toHaveCount(1)
    await expect(platformIcons.nth(2).locator('[class~="icon-[logos--android-icon]"]')).toHaveCount(1)
    await expect(platformIcons.nth(3).locator('[class~="icon-[mdi--apple]"]')).toHaveCount(1)
    await expect(platformIcons.nth(4).locator('.home-hero__platform-logo--harmony')).toHaveCount(1)
    await expect(platformIcons.nth(5).locator('[class~="icon-[logos--react]"]')).toHaveCount(1)
    await expect(platformIcons.nth(6).locator('.home-hero__platform-logo--lynx')).toHaveCount(1)
    await expect(platformIcons.locator('img')).toHaveCount(0)
    await expect(page.locator('[class~="icon-[mdi--wechat]"], [class~="icon-[mdi--android]"], [class~="icon-[mdi--cellphone-link]"]')).toHaveCount(0)
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

      const iconGeometry = await platformIcons.nth(index).locator('i, svg').evaluate((icon) => {
        const iconRect = icon.getBoundingClientRect()
        const containerRect = icon.parentElement!.getBoundingClientRect()
        return {
          centerOffset: Math.hypot(
            (iconRect.left + iconRect.width / 2) - (containerRect.left + containerRect.width / 2),
            (iconRect.top + iconRect.height / 2) - (containerRect.top + containerRect.height / 2),
          ),
          height: iconRect.height,
          width: iconRect.width,
        }
      })
      expect(iconGeometry.centerOffset).toBeLessThanOrEqual(1)
      expect(iconGeometry.height).toBeGreaterThanOrEqual(20)
      expect(iconGeometry.height).toBeLessThanOrEqual(32)
      expect(iconGeometry.width).toBeGreaterThanOrEqual(20)
      expect(iconGeometry.width).toBeLessThanOrEqual(42)
    }

    const primaryBox = await primaryCta.boundingBox()
    expect(primaryBox?.height).toBeGreaterThanOrEqual(44)
    expect(primaryBox?.width).toBeGreaterThan(132)
    const primaryStyle = await primaryCta.evaluate((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        text: element.textContent?.trim() ?? '',
        whiteSpace: style.whiteSpace,
        width: rect.width,
      }
    })
    expect(primaryStyle.text).toContain('开始接入')
    expect(primaryStyle.backgroundColor).toBe('rgb(2, 132, 199)')
    expect(primaryStyle.color).toBe('rgb(255, 255, 255)')
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

  test('English homepage keeps the semantic platform icon order', async ({ page }) => {
    await setStoredLocale(page, 'en')
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(new URL('/en/', baseURL).toString(), {
      waitUntil: 'networkidle',
    })

    const platformLabels = await page.locator('.home-hero__platform-icon')
      .evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))
    expect(platformLabels).toEqual(['Web', 'Mini app', 'Android', 'iOS', 'HarmonyOS', 'React Native', 'Lynx'])
    const platformHrefs = await page.locator('.home-hero__platform-icon')
      .evaluateAll(elements => elements.map(element => element.getAttribute('href')))
    expect(platformHrefs).toEqual([
      '/en/docs/intro',
      '/en/docs/quick-start/native/install',
      '/en/docs/quick-start/frameworks/uni-app-x',
      '/en/docs/quick-start/frameworks/uni-app-x',
      '/en/docs/quick-start/frameworks/uni-app-x',
      '/en/docs/quick-start/react-native-expo',
      '/en/docs/quick-start/frameworks/lynx',
    ])
  })

  test('React Native and Lynx platform links reach their localized documentation', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
    await page.goto(baseURL, { waitUntil: 'networkidle' })

    await page.getByRole('link', { name: 'React Native' }).click()
    await expect(page).toHaveURL(/\/docs\/quick-start\/react-native-expo\/?$/)

    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Lynx' }).click()
    await expect(page).toHaveURL(/\/docs\/quick-start\/frameworks\/lynx\/?$/)

    await setStoredLocale(page, 'en')
    await page.goto(new URL('/en/', baseURL).toString(), { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'React Native' }).click()
    await expect(page).toHaveURL(/\/en\/docs\/quick-start\/react-native-expo\/?$/)

    await page.goto(new URL('/en/', baseURL).toString(), { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Lynx' }).click()
    await expect(page).toHaveURL(/\/en\/docs\/quick-start\/frameworks\/lynx\/?$/)
  })

  test('primary CTA remains readable in light mode', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'light')
    })
    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    const primaryCta = page.locator('.home-hero__actions .home-cta')
    const colors = await primaryCta.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      }
    })

    expect(colors.backgroundColor).toBe('rgb(2, 132, 199)')
    expect(colors.color).toBe('rgb(255, 255, 255)')
  })

  test('mobile hero actions fit without horizontal overflow', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
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

test.describe('homepage locale detection', () => {
  test('redirects root visitors to /en when browser language is English', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key)
    }, localeStorageKey)
    await setNavigatorLanguages(page, ['en-US', 'en'])

    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('.home-hero__actions .home-cta')).toHaveText(/Start setup/)
    await expect(page.locator('html')).toHaveAttribute('lang', /en/i)
  })

  test('keeps Chinese when navigator languages include Chinese', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key)
    }, localeStorageKey)
    await setNavigatorLanguages(page, ['en-US', 'en', 'zh-CN'])

    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await expect(page).toHaveURL(/https?:\/\/[^/]+\/?$/)
    await expect(page.locator('.home-hero__actions .home-cta')).toHaveText(/开始接入/)
    await expect(page.locator('html')).toHaveAttribute('lang', /zh/i)
  })

  test('redirects non-Chinese browser languages to English', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key)
    }, localeStorageKey)
    await setNavigatorLanguages(page, ['fr-FR', 'fr'])

    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('.home-hero__actions .home-cta')).toHaveText(/Start setup/)
    await expect(page.locator('html')).toHaveAttribute('lang', /en/i)
  })

  test('respects stored English preference on the root page', async ({ page }) => {
    await setStoredLocale(page, 'en')

    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })

    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('.home-hero__actions .home-cta')).toHaveText(/Start setup/)
  })

  test('switches from English to Chinese and persists the selection', async ({ page }) => {
    await setStoredLocale(page, 'en')

    await page.goto(new URL('/en/', baseURL).toString(), {
      waitUntil: 'networkidle',
    })

    const localeDropdown = page.locator('.navbar__item.dropdown').filter({ hasText: 'English' })
    await expect(localeDropdown).toHaveCount(1)
    await localeDropdown.hover()

    const chineseLink = localeDropdown.locator('a[href="/"]')
    await expect(chineseLink).toHaveText('中文')
    await chineseLink.click()

    await expect(page).toHaveURL(/https?:\/\/[^/]+\/?$/)
    await expect(page.locator('.home-hero__actions .home-cta')).toHaveText(/开始接入/)
    await expect(page.locator('html')).toHaveAttribute('lang', /zh/i)

    const chineseLocaleDropdown = page.locator('.navbar__item.dropdown').filter({ hasText: '中文' })
    await expect(chineseLocaleDropdown).toHaveCount(1)
    await chineseLocaleDropdown.hover()
    await expect(chineseLocaleDropdown.locator('a[href^="/en/"]')).toHaveText('English')

    await page.goto(baseURL, {
      waitUntil: 'networkidle',
    })
    await expect(page).toHaveURL(/https?:\/\/[^/]+\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', /zh/i)
  })

  test('keeps repeated locale switches on canonical paths', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
    await page.goto(new URL('/docs/quick-start/install', baseURL).toString(), {
      waitUntil: 'networkidle',
    })

    for (let index = 0; index < 3; index += 1) {
      const englishLink = page.locator('.navbar__item.dropdown a[lang^="en"]')
      await expect(englishLink).toHaveAttribute('href', '/en/docs/quick-start/install')
      await englishLink.click()
      await expect(page).toHaveURL(/\/en\/docs\/quick-start\/install$/)
      expect(new URL(page.url()).pathname).not.toMatch(/^\/en\/en(?:\/|$)/)

      const chineseLink = page.locator('.navbar__item.dropdown a[lang^="zh"]')
      await expect(chineseLink).toHaveAttribute('href', '/docs/quick-start/install')
      await chineseLink.click()
      await expect(page).toHaveURL(/\/docs\/quick-start\/install$/)
    }
  })

  test('recovers repeated English prefixes to a canonical page', async ({ page }) => {
    await page.goto(new URL('/en/en/en', baseURL).toString(), {
      waitUntil: 'networkidle',
    })

    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', /en/i)
    await expect(page.locator('h1')).toContainText('weapp-tailwindcss')
  })

  test('keeps the desktop locale switcher icon and label on one line', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')

    for (const width of [1440, 1100]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(baseURL, {
        waitUntil: 'networkidle',
      })

      const localeLink = page.locator('.navbar__item.dropdown > .navbar__link').filter({ hasText: '中文' })
      await expect(localeLink).toHaveCount(1)
      await expect(localeLink).toHaveCSS('display', 'inline-flex')
      await expect(localeLink).toHaveCSS('white-space', 'nowrap')

      const alignment = await localeLink.evaluate((link) => {
        const dropdown = link.parentElement
        const navbarItems = link.closest('.navbar__items')
        const icon = link.querySelector('svg')
        const labelNode = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        if (!dropdown || !navbarItems || !icon || !labelNode) {
          return null
        }

        const labelRange = document.createRange()
        labelRange.selectNode(labelNode)
        const dropdownRect = dropdown.getBoundingClientRect()
        const navbarItemsRect = navbarItems.getBoundingClientRect()
        const linkRect = link.getBoundingClientRect()
        const iconRect = icon.getBoundingClientRect()
        const labelRect = labelRange.getBoundingClientRect()
        const navbarItemsCenter = navbarItemsRect.top + navbarItemsRect.height / 2
        const rightItemCenterOffsets = Array.from(navbarItems.children)
          .filter(element => getComputedStyle(element).display !== 'none')
          .map((element) => {
            const rect = element.getBoundingClientRect()
            return Math.abs((rect.top + rect.height / 2) - navbarItemsCenter)
          })

        return {
          rightItemCenterOffsets,
          dropdownCenterOffset: Math.abs(
            (dropdownRect.top + dropdownRect.height / 2)
            - navbarItemsCenter,
          ),
          linkCenterOffset: Math.abs(
            (linkRect.top + linkRect.height / 2)
            - navbarItemsCenter,
          ),
          centerOffset: Math.abs(
            (iconRect.top + iconRect.height / 2) - (labelRect.top + labelRect.height / 2),
          ),
          navbarOverflows: document.querySelector('.navbar__inner')!.scrollWidth
            > document.querySelector('.navbar__inner')!.clientWidth,
        }
      })

      expect(alignment).not.toBeNull()
      expect(Math.max(...alignment!.rightItemCenterOffsets)).toBeLessThanOrEqual(0.5)
      expect(alignment!.dropdownCenterOffset).toBeLessThanOrEqual(0.5)
      expect(alignment!.linkCenterOffset).toBeLessThanOrEqual(0.5)
      expect(alignment!.centerOffset).toBeLessThanOrEqual(2)
      expect(alignment!.navbarOverflows).toBe(false)
    }
  })

  test('serves translated docs and blog samples for English pages', async ({ page }) => {
    await page.goto(new URL('/en/docs/intro', baseURL).toString(), {
      waitUntil: 'networkidle',
    })
    await expect(page.locator('h1')).toHaveText('Introduction')
    await expect(page.locator('html')).toHaveAttribute('lang', /en/i)
    await expect(page.locator('head meta[http-equiv="Content-Language"]')).toHaveAttribute('content', /en/i)

    await page.goto(new URL('/en/blog/2025/9/v4.3-release', baseURL).toString(), {
      waitUntil: 'networkidle',
    })
    await expect(page.locator('h1')).toContainText('4.3.0')
    await expect(page.locator('html')).toHaveAttribute('lang', /en/i)
  })
})

test.describe('mobile navbar sidebar', () => {
  test.use(mobileUse(devices['iPhone 12']))

  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Only run on chromium to keep the suite fast',
  )

  test('keeps the document menu visible and navigable', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
    await page.goto(new URL('/docs/intro', baseURL).toString(), {
      waitUntil: 'networkidle',
    })

    await page.locator('.navbar__toggle').tap()

    const sidebar = page.locator('.navbar-sidebar')
    const activePanel = sidebar.locator('.navbar-sidebar__item:not([inert])')
    const backButton = activePanel.getByRole('button', { name: '回到主菜单' })

    await expect(sidebar).toBeVisible()
    await expect(activePanel.getByRole('link', { name: '简介', exact: true })).toBeVisible()
    await expect(backButton).toBeVisible()

    await expect.poll(() => backButton.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return target === element || element.contains(target)
    })).toBe(true)

    await backButton.tap()
    await expect(sidebar.getByRole('link', { name: '指南', exact: true })).toBeVisible()

    await sidebar.getByRole('button', { name: '关闭导航栏' }).tap()
    await expect(sidebar).toBeHidden()
  })
})

test.describe('color mode transition strategy', () => {
  test('desktop uses a short view transition for theme changes', async ({ page }) => {
    await setStoredLocale(page, 'zh-cn')
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
    await setStoredLocale(page, 'zh-cn')
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
