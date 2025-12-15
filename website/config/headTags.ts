import type { Config } from '@docusaurus/types'
import { geoMeta, organizationJsonLd, siteLanguage, siteName, siteUrl, websiteJsonLd } from './siteMetadata'

const headTags: NonNullable<Config['headTags']> = [
  {
    tagName: 'script',
    // 为避免在本地/内网或被拦截时 window.gtag 未定义导致报错，这里注入一个兜底 stub。
    attributes: {
      type: 'text/javascript',
      id: 'gtag-stub',
    },
    innerHTML:
      'window.dataLayer = window.dataLayer || []; window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };',
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'application-name',
      content: siteName,
    },
  },
  {
    tagName: 'meta',
    attributes: {
      httpEquiv: 'Content-Language',
      content: siteLanguage,
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'referrer',
      content: 'strict-origin-when-cross-origin',
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'distribution',
      content: 'global',
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'geo.region',
      content: geoMeta.region,
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'geo.placename',
      content: geoMeta.placename,
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'geo.position',
      content: geoMeta.position,
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'ICBM',
      content: geoMeta.icbm,
    },
  },
  {
    tagName: 'link',
    attributes: {
      rel: 'preconnect',
      href: 'https://hm.baidu.com',
    },
  },
  {
    tagName: 'link',
    attributes: {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'weapp-tailwindcss 博客订阅',
      href: `${siteUrl}/blog/rss.xml`,
    },
  },
  {
    tagName: 'link',
    attributes: {
      rel: 'sitemap',
      type: 'application/xml',
      href: `${siteUrl}/sitemap.xml`,
    },
  },
  {
    tagName: 'meta',
    attributes: {
      name: 'baidu-site-verification',
      content: 'codeva-4ny6UzMmrn',
    },
  },
  {
    tagName: 'script',
    attributes: {
      type: 'application/ld+json',
    },
    innerHTML: JSON.stringify(organizationJsonLd),
  },
  {
    tagName: 'script',
    attributes: {
      type: 'application/ld+json',
      id: 'website-jsonld',
    },
    innerHTML: JSON.stringify(websiteJsonLd),
  },
]

export default headTags
