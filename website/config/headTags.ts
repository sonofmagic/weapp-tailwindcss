import type { Config } from '@docusaurus/types'
import { organizationJsonLd } from './siteMetadata'

const headTags: NonNullable<Config['headTags']> = [
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
