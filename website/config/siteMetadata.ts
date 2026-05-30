import process from 'node:process'

export const siteUrl = process.env.SITE_URL || 'https://tw.icebreaker.top'
export const siteName = 'weapp-tailwindcss'
export const siteLanguage = 'zh-CN'
export const defaultMetaTitle = 'weapp-tailwindcss | Tailwind CSS 小程序事实标准工具链'

export const socialImageUrl = `${siteUrl}/img/logo.png`

export const defaultMetaDescription
  = 'weapp-tailwindcss 为小程序生态提供 Tailwind CSS v4/v3 的精确转译、构建器集成与运行时工具，覆盖 Taro、uni-app、原生小程序、Webpack、Vite 与 Gulp 场景。'

export const geoMeta = {
  region: 'CN',
  placename: '中国',
  position: '35.86166;104.19540',
  icbm: '35.86166, 104.19540',
} as const

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': siteName,
  'url': siteUrl,
  'description': defaultMetaDescription,
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

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': siteName,
  'url': siteUrl,
  'description': defaultMetaDescription,
  'inLanguage': siteLanguage,
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
