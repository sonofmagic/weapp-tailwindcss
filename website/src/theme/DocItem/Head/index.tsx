import type { PartialGeoMeta } from '@site/src/utils/geo'

import Head from '@docusaurus/Head'
import { useDoc } from '@docusaurus/plugin-content-docs/client'
import { getGeoMeta, getSiteLanguage, siteName, siteUrl, socialImageUrl } from '@site/config/siteMetadata'
import { toAbsoluteLocaleUrl } from '@site/src/i18n/locale'
import { useCurrentSiteLocale } from '@site/src/i18n/runtime'
import { getSiteConfigCopy } from '@site/src/i18n/siteConfig'
import { extractGeoCoordinates, resolveGeoMeta, toAbsoluteUrl } from '@site/src/utils/geo'
import { buildBreadcrumbJsonLd, resolveSeoDescription, resolveSeoKeywords } from '@site/src/utils/seo'
import OriginalHead from '@theme-original/DocItem/Head'
import React from 'react'

interface FrontMatterWithGeo {
  geo?: PartialGeoMeta
  image?: string
  date?: string | number
  last_updated_at?: string | number
}

function toIsoString(value?: number | string | null) {
  if (!value) {
    return undefined
  }
  if (typeof value === 'number') {
    return new Date(value * 1000).toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

type DocItemHeadProps = React.ComponentProps<typeof OriginalHead>

export default function DocItemHead(props: DocItemHeadProps) {
  const locale = useCurrentSiteLocale()
  const { metadata } = useDoc()
  const geo = resolveGeoMeta((metadata.frontMatter as FrontMatterWithGeo | undefined)?.geo ?? getGeoMeta(locale))
  const coordinates = extractGeoCoordinates(geo)
  const copy = getSiteConfigCopy(locale)
  const siteLanguage = getSiteLanguage(locale)
  const alternateZhUrl = toAbsoluteLocaleUrl(siteUrl, metadata.permalink, 'zh-cn')
  const alternateEnUrl = toAbsoluteLocaleUrl(siteUrl, metadata.permalink, 'en')

  const canonicalUrl = toAbsoluteUrl(siteUrl, metadata.permalink) || `${siteUrl}${metadata.permalink}`
  const imageUrl = toAbsoluteUrl(siteUrl, metadata.frontMatter?.image) || socialImageUrl
  const publishedTime = toIsoString(metadata.frontMatter?.date)
  const modifiedTime = toIsoString(metadata.lastUpdatedAt ?? metadata.frontMatter?.last_updated_at)
  const description = resolveSeoDescription({
    description: metadata.description ?? metadata.frontMatter?.description,
    title: metadata.title,
    locale,
  })
  const keywords = resolveSeoKeywords({
    title: metadata.title,
    permalink: metadata.permalink,
    metadataKeywords: metadata.keywords,
    frontMatterKeywords: metadata.frontMatter?.keywords,
    locale,
  })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    siteUrl,
    permalink: metadata.permalink,
    title: metadata.title,
    locale,
  })

  const docJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': metadata.title,
    'description': description,
    'image': imageUrl ? [imageUrl] : undefined,
    'datePublished': publishedTime,
    'dateModified': modifiedTime,
    'inLanguage': siteLanguage,
    'mainEntityOfPage': canonicalUrl,
    'url': canonicalUrl,
    'keywords': keywords,
    'publisher': {
      '@type': 'Organization',
      'name': siteName,
      'logo': {
        '@type': 'ImageObject',
        'url': socialImageUrl,
      },
    },
    'contentLocation': coordinates
      ? {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': geo.region,
            'addressLocality': geo.placename,
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': coordinates.latitude,
            'longitude': coordinates.longitude,
          },
        }
      : undefined,
  }

  return (
    <>
      <OriginalHead {...props} />
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <meta name="geo.region" content={geo.region} />
        <meta name="geo.placename" content={geo.placename} />
        <meta name="geo.position" content={geo.position} />
        <meta name="ICBM" content={geo.icbm} />
        <meta name="keywords" content={keywords.join(', ')} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:locale" content={copy.metadata.ogLocale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <link rel="alternate" hrefLang="zh-CN" href={alternateZhUrl} />
        <link rel="alternate" hrefLang="en-US" href={alternateEnUrl} />
        <link rel="alternate" hrefLang="x-default" href={alternateZhUrl} />
        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        <meta httpEquiv="Content-Language" content={siteLanguage} />
        <script type="application/ld+json">
          {JSON.stringify(docJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Head>
    </>
  )
}
