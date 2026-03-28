import type { Config } from '@docusaurus/types'
import { homepageUiControls } from '../src/features/ui-management/homepage'
import { navbarUiControls, navbarUiStorageKey } from '../src/features/ui-management/navbar'
import { geoMeta, organizationJsonLd, siteLanguage, siteName, siteUrl, websiteJsonLd } from './siteMetadata'

const navbarUiBootstrapScript = `
(() => {
  try {
    const rawValue = window.localStorage.getItem(${JSON.stringify(navbarUiStorageKey)});
    if (!rawValue) {
      return;
    }
    const parsed = JSON.parse(rawValue);
    const html = document.documentElement;
    const navbar = parsed && typeof parsed === 'object' && 'navbar' in parsed ? parsed.navbar : parsed;
    const homepage = parsed && typeof parsed === 'object' && 'homepage' in parsed ? parsed.homepage : null;
    ${navbarUiControls.map((control) => {
      const key = JSON.stringify(control.key)
      const attr = JSON.stringify(control.htmlAttribute)
      return `if (navbar && navbar[${key}] === false) { html.setAttribute(${attr}, 'hidden'); } else { html.removeAttribute(${attr}); }`
    }).join('\n    ')}
    ${homepageUiControls.map((control) => {
      const key = JSON.stringify(control.key)
      const attr = JSON.stringify(control.htmlAttribute)
      return `if (homepage && homepage[${key}] === false) { html.setAttribute(${attr}, 'hidden'); } else { html.removeAttribute(${attr}); }`
    }).join('\n    ')}
  } catch {}
})();
`.trim()

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
    tagName: 'script',
    attributes: {
      type: 'text/javascript',
      id: 'ui-navbar-bootstrap',
    },
    innerHTML: navbarUiBootstrapScript,
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
