export type NavbarUiControlKey = 'atomgit' | 'github' | 'weappVite'

export interface NavbarUiSettings {
  atomgit: boolean
  github: boolean
  weappVite: boolean
}

export interface NavbarUiControlMeta {
  key: NavbarUiControlKey
  label: string
  description: string
  className: string
  htmlAttribute: string
}

export const navbarUiStorageKey = 'weapp-tailwindcss:website:ui'

export const defaultNavbarUiSettings: NavbarUiSettings = {
  atomgit: true,
  github: true,
  weappVite: true,
}

export const navbarUiControls: NavbarUiControlMeta[] = [
  {
    key: 'atomgit',
    label: 'AtomGit 图标',
    description: '控制导航栏中的 AtomGit 图标链接是否显示。',
    className: 'navbar__atomgit-link',
    htmlAttribute: 'data-ui-navbar-atomgit',
  },
  {
    key: 'github',
    label: 'GitHub 图标',
    description: '控制导航栏中的 GitHub 图标链接是否显示。',
    className: 'navbar__github-link',
    htmlAttribute: 'data-ui-navbar-github',
  },
  {
    key: 'weappVite',
    label: 'Weapp-vite 入口',
    description: '控制导航栏中的 Weapp-vite 图标入口是否显示。',
    className: 'navbar__weapp-vite-link',
    htmlAttribute: 'data-ui-navbar-weapp-vite',
  },
]

const navbarUiClassNameMap = new Map(
  navbarUiControls.map(control => [control.className, control.key]),
)
const classNameSplitRE = /\s+/

export function getNavbarUiControlKey(className?: string): NavbarUiControlKey | null {
  if (!className) {
    return null
  }

  for (const token of className.split(classNameSplitRE).filter(Boolean)) {
    const key = navbarUiClassNameMap.get(token)
    if (key) {
      return key
    }
  }

  return null
}

export function mergeNavbarUiSettings(value: unknown): NavbarUiSettings {
  if (!value || typeof value !== 'object') {
    return defaultNavbarUiSettings
  }

  const candidate = value as Partial<Record<NavbarUiControlKey, unknown>>

  return {
    atomgit: typeof candidate.atomgit === 'boolean' ? candidate.atomgit : defaultNavbarUiSettings.atomgit,
    github: typeof candidate.github === 'boolean' ? candidate.github : defaultNavbarUiSettings.github,
    weappVite: typeof candidate.weappVite === 'boolean' ? candidate.weappVite : defaultNavbarUiSettings.weappVite,
  }
}

export function isNavbarItemVisible(
  item: { className?: string },
  settings: NavbarUiSettings,
): boolean {
  const key = getNavbarUiControlKey(item.className)

  if (!key) {
    return true
  }

  return settings[key]
}

export function applyNavbarUiSettingsToDocument(settings: NavbarUiSettings) {
  if (typeof document === 'undefined') {
    return
  }

  for (const control of navbarUiControls) {
    if (settings[control.key]) {
      document.documentElement.removeAttribute(control.htmlAttribute)
    }
    else {
      document.documentElement.setAttribute(control.htmlAttribute, 'hidden')
    }
  }
}
