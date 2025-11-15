import type { Config } from '@docusaurus/types'
import { organizationJsonLd } from './siteMetadata'

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
    tagName: 'link',
    attributes: {
      rel: 'preconnect',
      href: 'https://hm.baidu.com',
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
]

export default headTags
