import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

import { getBuildLocale } from './config/buildLocale'
import englishSidebarTranslations from './i18n/en/docusaurus-plugin-content-docs/current.json'
import aiSidebar from './sidebars/ai'
import API from './sidebars/api'
import communitySidebar from './sidebars/community'
import issuesSidebar from './sidebars/issues'
import migrationsSidebar from './sidebars/migrations'
import optionsSidebar from './sidebars/options'
import tailwindcssSidebar from './sidebars/tailwindcss'
import tutorialSidebar from './sidebars/tutorial'

const sidebars: SidebarsConfig = {
  tutorialSidebar,
  optionsSidebar,
  issuesSidebar,
  API,
  aiSidebar,
  communitySidebar,
  migrationsSidebar,
  tailwindcssSidebar,
}

const englishLabelBySource = new Map(
  Object.entries(englishSidebarTranslations).flatMap(([key, translation]) => {
    const match = key.match(/^sidebar\.[^.]+\.(?:category|doc|link)\.(.+)$/)
    return match ? [[match[1], translation.message] as const] : []
  }),
)

function localizeSidebarValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(localizeSidebarValue)
  }
  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (key === 'label' && typeof entry === 'string') {
        return [key, englishLabelBySource.get(entry) ?? entry]
      }
      return [key, localizeSidebarValue(entry)]
    }),
  )
}

module.exports = getBuildLocale() === 'en'
  ? localizeSidebarValue(sidebars) as SidebarsConfig
  : sidebars
