export const siteLocales = ['zh-cn', 'en'] as const

export type SiteLocale = (typeof siteLocales)[number]

export const defaultSiteLocale: SiteLocale = 'zh-cn'
export const localePreferenceStorageKey = 'weapp-tailwindcss:website:locale'

const ENGLISH_PREFIX_RE = /^en(?:[-_]|$)/i
const CHINESE_PREFIX_RE = /^zh(?:[-_]|$)/i
const EN_LOCALE_PATH_RE = /^\/en(?:\/|$)/

export function normalizeSiteLocale(value?: string | null): SiteLocale {
  if (!value) {
    return defaultSiteLocale
  }
  if (ENGLISH_PREFIX_RE.test(value)) {
    return 'en'
  }
  if (CHINESE_PREFIX_RE.test(value)) {
    return 'zh-cn'
  }
  return defaultSiteLocale
}

export function isEnglishLocale(locale: SiteLocale): boolean {
  return locale === 'en'
}

export function getLocalePrefix(locale: SiteLocale): string {
  return isEnglishLocale(locale) ? '/en' : ''
}

export function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  if (pathname === '/en') {
    return '/'
  }

  if (EN_LOCALE_PATH_RE.test(pathname)) {
    return pathname.replace('/en', '') || '/'
  }

  return pathname
}

export function toLocalePath(pathname: string, locale: SiteLocale): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  const strippedPath = stripLocalePrefix(normalizedPath)

  if (locale === 'en') {
    return strippedPath === '/' ? '/en/' : `/en${strippedPath}`
  }

  return strippedPath
}

export function getAlternateLocalePathMap(pathname: string): Record<SiteLocale, string> {
  return {
    'zh-cn': toLocalePath(pathname, 'zh-cn'),
    'en': toLocalePath(pathname, 'en'),
  }
}

export function toAbsoluteLocaleUrl(siteUrl: string, pathname: string, locale: SiteLocale): string {
  const baseUrl = siteUrl.replace(/\/$/, '')
  return `${baseUrl}${toLocalePath(pathname, locale)}`
}
