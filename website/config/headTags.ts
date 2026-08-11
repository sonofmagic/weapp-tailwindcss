import type { Config } from '@docusaurus/types'
import { homepageUiControls } from '../src/features/ui-management/homepage'
import { navbarUiControls, navbarUiStorageKey } from '../src/features/ui-management/navbar'
import { defaultSiteLocale, localePreferenceStorageKey } from '../src/i18n/locale'
import { getSiteConfigCopy } from '../src/i18n/siteConfig'
import { getBuildLocale } from './buildLocale'
import { geoMeta, organizationJsonLd, siteLanguage, siteName, siteUrl, websiteJsonLd } from './siteMetadata'

const copy = getSiteConfigCopy(getBuildLocale())
const localeNavigationStorageKey = `${localePreferenceStorageKey}:navigation`

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

const localeBootstrapScript = `
(() => {
  try {
    const pathname = window.location.pathname;
    if (!(pathname === '/' || pathname === '/index.html')) {
      return;
    }
    const pendingLocale = window.sessionStorage.getItem(${JSON.stringify(localeNavigationStorageKey)});
    if (pendingLocale === 'zh-cn') {
      window.sessionStorage.removeItem(${JSON.stringify(localeNavigationStorageKey)});
      window.localStorage.setItem(${JSON.stringify(localePreferenceStorageKey)}, 'zh-cn');
      return;
    }
    const rawStoredLocale = window.localStorage.getItem(${JSON.stringify(localePreferenceStorageKey)});
    const storedLocale = rawStoredLocale === 'en' || rawStoredLocale === 'zh-cn' ? rawStoredLocale : null;
    const navigatorLocales = Array.isArray(window.navigator.languages) && window.navigator.languages.length
      ? window.navigator.languages
      : [window.navigator.language];
    const hasChineseLocale = navigatorLocales.some(candidate =>
      typeof candidate === 'string' && candidate.toLowerCase().startsWith('zh'));
    const browserLocale = hasChineseLocale
      ? ${JSON.stringify(defaultSiteLocale)}
      : 'en';
    const targetLocale = storedLocale || browserLocale;
    if (targetLocale !== 'en') {
      return;
    }
    window.location.replace('/en/' + (window.location.search || '') + (window.location.hash || ''));
  } catch {}
})();
`.trim()

const localePreferenceScript = `
(() => {
  try {
    document.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest('a[href]');
      if (!link) {
        return;
      }
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }
      const language = link.getAttribute('lang');
      if (!language) {
        return;
      }
      const locale = language.toLowerCase().startsWith('en') ? 'en' : 'zh-cn';
      window.localStorage.setItem(${JSON.stringify(localePreferenceStorageKey)}, locale);
      window.sessionStorage.setItem(${JSON.stringify(localeNavigationStorageKey)}, locale);
    }, true);
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
    tagName: 'script',
    attributes: {
      type: 'text/javascript',
      id: 'locale-bootstrap',
    },
    innerHTML: localeBootstrapScript,
  },
  {
    tagName: 'script',
    attributes: {
      type: 'text/javascript',
      id: 'locale-preference-bootstrap',
    },
    innerHTML: localePreferenceScript,
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
      title: copy.blog.feedTitle,
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
