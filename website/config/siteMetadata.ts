export const siteUrl = 'https://tw.icebreaker.top'

export const socialImageUrl = `${siteUrl}/img/logo.png`

export const defaultMetaDescription
  = 'weapp-tailwindcss 将 tailwindcss 的体验带到小程序生态，提供 webpack、vite、gulp 等插件，兼容 uni-app、taro、rax、mpx、原生小程序等框架，助力团队高效构建高质量界面。'

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'weapp-tailwindcss',
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
    'name': 'weapp-tailwindcss',
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
