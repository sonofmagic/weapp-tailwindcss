import type { SiteLocale } from '../src/i18n/locale'
import { getSiteConfigCopy } from '../src/i18n/siteConfig'
import { getBuildLocale } from './buildLocale'

// eslint-disable-next-line node/prefer-global/process -- Docusaurus 会在服务端和客户端构建中注入该环境变量
const envSiteUrl = process.env.SITE_URL

export const siteUrl = envSiteUrl || 'https://tw.icebreaker.top'
export const siteName = 'weapp-tailwindcss'
export const socialImageUrl = `${siteUrl}/img/logo.png`
export const currentSiteLocale = getBuildLocale()

export function getSiteLanguage(locale: SiteLocale) {
  return getSiteConfigCopy(locale).metadata.siteLanguage
}

export function getDefaultMetaTitle(locale: SiteLocale) {
  return getSiteConfigCopy(locale).metadata.defaultMetaTitle
}

export function getDefaultMetaDescription(locale: SiteLocale) {
  return getSiteConfigCopy(locale).metadata.defaultMetaDescription
}

export function getSocialImageAlt(locale: SiteLocale) {
  return getSiteConfigCopy(locale).metadata.socialImageAlt
}

export function getGeoMeta(locale: SiteLocale) {
  return getSiteConfigCopy(locale).geo
}

export function getOrganizationJsonLd(locale: SiteLocale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': siteName,
    'url': siteUrl,
    'description': getDefaultMetaDescription(locale),
    'image': socialImageUrl,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Cross Platform',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'CNY',
    },
    'brand': {
      '@type': 'Brand',
      'name': siteName,
      'logo': socialImageUrl,
    },
    'creator': {
      '@type': 'Person',
      'name': 'sonofmagic',
      'url': 'https://github.com/sonofmagic',
    },
    'sameAs': [
      'https://github.com/sonofmagic/weapp-tailwindcss',
      'https://vite.icebreaker.top',
    ],
  } as const
}

export function getWebsiteJsonLd(locale: SiteLocale) {
  const organizationJsonLd = getOrganizationJsonLd(locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': siteName,
    'url': siteUrl,
    'description': getDefaultMetaDescription(locale),
    'inLanguage': getSiteLanguage(locale),
    'publisher': {
      '@type': 'Organization',
      'name': siteName,
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': socialImageUrl,
      },
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    'sameAs': organizationJsonLd.sameAs,
  } as const
}

export const siteLanguage = getSiteLanguage(currentSiteLocale)
export const defaultMetaTitle = getDefaultMetaTitle(currentSiteLocale)
export const defaultMetaDescription = getDefaultMetaDescription(currentSiteLocale)
export const geoMeta = getGeoMeta(currentSiteLocale)
export const organizationJsonLd = getOrganizationJsonLd(currentSiteLocale)
export const websiteJsonLd = getWebsiteJsonLd(currentSiteLocale)
