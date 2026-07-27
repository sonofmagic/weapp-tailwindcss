import type { SiteLocale } from './locale'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { normalizeSiteLocale } from './locale'

export function useCurrentSiteLocale(): SiteLocale {
  const { i18n } = useDocusaurusContext()
  return normalizeSiteLocale(i18n.currentLocale)
}
