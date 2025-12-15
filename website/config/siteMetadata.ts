export const siteUrl = 'https://tw.icebreaker.top'
export const siteName = 'weapp-tailwindcss'
export const siteLanguage = 'zh-CN'
export const defaultMetaTitle = 'weapp-tailwindcss | Tailwind CSS 小程序与多端适配方案'

export const socialImageUrl = `${siteUrl}/img/logo.png`

export const defaultMetaDescription
  = 'weapp-tailwindcss 将 tailwindcss 的体验带到小程序生态，提供 webpack、vite、gulp 等插件，兼容 uni-app、taro、rax、mpx、原生小程序等框架，助力团队高效构建高质量界面。'

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
