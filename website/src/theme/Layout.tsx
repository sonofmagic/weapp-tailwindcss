import type { ComponentProps } from 'react'
import Head from '@docusaurus/Head'
import { useLocation } from '@docusaurus/router'
import { getSiteLanguage, siteUrl } from '@site/config/siteMetadata'
import { UiManagementProvider } from '@site/src/features/ui-management/context'
import { localePreferenceStorageKey, stripLocalePrefix, toAbsoluteLocaleUrl } from '@site/src/i18n/locale'
import { useCurrentSiteLocale } from '@site/src/i18n/runtime'
import Layout from '@theme-original/Layout'
import React, { useEffect } from 'react'

type LayoutWrapperProps = ComponentProps<typeof Layout>

export default function LayoutWrapper(props: LayoutWrapperProps) {
  const location = useLocation()
  const locale = useCurrentSiteLocale()
  const isHomepage = location.pathname === '/'
  const relativePath = stripLocalePrefix(location.pathname)
  const isContentPage = relativePath === '/docs'
    || relativePath.startsWith('/docs/')
    || relativePath === '/blog'
    || relativePath.startsWith('/blog/')
  const canonicalUrl = toAbsoluteLocaleUrl(siteUrl, location.pathname, locale)
  const alternateZhUrl = toAbsoluteLocaleUrl(siteUrl, location.pathname, 'zh-cn')
  const alternateEnUrl = toAbsoluteLocaleUrl(siteUrl, location.pathname, 'en')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(localePreferenceStorageKey, locale)
    }
    catch {
      // ignore persistence failures
    }
  }, [locale])

  return (
    <UiManagementProvider>
      <div className="relative">
        <Head>
          {!isContentPage && <link rel="canonical" href={canonicalUrl} />}
          <link rel="alternate" hrefLang="zh-CN" href={alternateZhUrl} />
          <link rel="alternate" hrefLang="en-US" href={alternateEnUrl} />
          <link rel="alternate" hrefLang="x-default" href={alternateZhUrl} />
          <meta httpEquiv="Content-Language" content={getSiteLanguage(locale)} />
        </Head>
        {/* {location.pathname !== '/' && (
          <div className="pointer-events-none absolute inset-0 z-[201]">
            <div className="light-effect pointer-events-none absolute right-[13.14%]"></div>
          </div>
        )} */}
        <Layout {...props} />
        {isHomepage && (
          <div className="
            pointer-events-none absolute inset-0 z-[202] flex-none
          "
          >
            <div className={`
              size-full rounded-none bg-[url(/img/framer.png)] bg-[length:128px]
              bg-repeat opacity-5
            `}
            >
            </div>
          </div>
        )}
      </div>
    </UiManagementProvider>
  )
}
