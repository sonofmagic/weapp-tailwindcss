import type { MetaHTMLAttributes } from 'react'
import Head from '@docusaurus/Head'
import { useLocation } from '@docusaurus/router'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { toAbsoluteLocaleUrl } from '@site/src/i18n/locale'
import SearchMetadata from '@theme/SearchMetadata'
import React from 'react'

interface SiteThemeConfig {
  image?: string
  metadata?: Array<MetaHTMLAttributes<HTMLMetaElement>>
}

function LocaleHeaders() {
  const {
    siteConfig: { url: siteUrl },
    i18n: { currentLocale, defaultLocale, localeConfigs },
  } = useDocusaurusContext()
  const { pathname } = useLocation()
  const currentHtmlLang = localeConfigs[currentLocale].htmlLang
  const toOpenGraphLocale = (value: string) => value.replace('-', '_')

  return (
    <Head>
      {Object.entries(localeConfigs).map(([locale, { htmlLang }]) => (
        <link
          key={locale}
          rel="alternate"
          href={toAbsoluteLocaleUrl(siteUrl, pathname, locale === 'en' ? 'en' : 'zh-cn')}
          hrefLang={htmlLang}
        />
      ))}
      <link
        rel="alternate"
        href={toAbsoluteLocaleUrl(siteUrl, pathname, defaultLocale === 'en' ? 'en' : 'zh-cn')}
        hrefLang="x-default"
      />
      <meta property="og:locale" content={toOpenGraphLocale(currentHtmlLang)} />
      {Object.values(localeConfigs)
        .filter(config => currentHtmlLang !== config.htmlLang)
        .map(config => (
          <meta
            key={`meta-og-${config.htmlLang}`}
            property="og:locale:alternate"
            content={toOpenGraphLocale(config.htmlLang)}
          />
        ))}
    </Head>
  )
}

function CanonicalUrlHeaders() {
  const {
    siteConfig: { url: siteUrl },
    i18n: { currentLocale },
  } = useDocusaurusContext()
  const { pathname } = useLocation()
  const canonicalUrl = toAbsoluteLocaleUrl(siteUrl, pathname, currentLocale === 'en' ? 'en' : 'zh-cn')

  return (
    <Head>
      <meta property="og:url" content={canonicalUrl} />
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  )
}

export default function SiteMetadata() {
  const {
    siteConfig,
    i18n: { currentLocale },
  } = useDocusaurusContext()
  const { metadata = [], image: defaultImage } = siteConfig.themeConfig as SiteThemeConfig
  const defaultImageUrl = defaultImage
    ? new URL(defaultImage, `${siteConfig.url}/`).toString()
    : undefined

  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        <body />
      </Head>
      {defaultImageUrl && (
        <Head>
          <meta property="og:image" content={defaultImageUrl} />
          <meta name="twitter:image" content={defaultImageUrl} />
        </Head>
      )}
      <CanonicalUrlHeaders />
      <LocaleHeaders />
      <SearchMetadata tag="default" locale={currentLocale} />
      <Head>
        {metadata.map((metadatum, index) => (
          <meta key={index} {...metadatum} />
        ))}
      </Head>
    </>
  )
}
