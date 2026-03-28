import type { PropsWithChildren } from 'react'
import type { HomepageUiControlKey, HomepageUiSettings } from './homepage'
import type { NavbarUiControlKey, NavbarUiSettings } from './navbar'
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  applyHomepageUiSettingsToDocument,
  defaultHomepageUiSettings,
  mergeHomepageUiSettings,
} from './homepage'
import {
  applyNavbarUiSettingsToDocument,
  defaultNavbarUiSettings,
  mergeNavbarUiSettings,
  navbarUiStorageKey,
} from './navbar'

interface UiManagementStorage {
  homepage?: Partial<Record<HomepageUiControlKey, unknown>>
  navbar?: Partial<Record<NavbarUiControlKey, unknown>>
}

interface UiManagementContextValue {
  hasHydrated: boolean
  homepage: HomepageUiSettings
  navbar: NavbarUiSettings
  resetHomepageSettings: () => void
  resetNavbarSettings: () => void
  setHomepageVisibility: (key: HomepageUiControlKey, visible: boolean) => void
  setNavbarVisibility: (key: NavbarUiControlKey, visible: boolean) => void
}

const UiManagementContext = createContext<UiManagementContextValue | null>(null)

function readUiStorage(): UiManagementStorage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(navbarUiStorageKey)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as UiManagementStorage | Partial<Record<NavbarUiControlKey, unknown>>
    if (parsed && typeof parsed === 'object' && ('navbar' in parsed || 'homepage' in parsed)) {
      return parsed as UiManagementStorage
    }

    return {
      navbar: parsed as Partial<Record<NavbarUiControlKey, unknown>>,
    }
  }
  catch {
    return null
  }
}

function readNavbarSettings(): NavbarUiSettings {
  const storage = readUiStorage()
  return mergeNavbarUiSettings(storage?.navbar)
}

function readHomepageSettings(): HomepageUiSettings {
  const storage = readUiStorage()
  return mergeHomepageUiSettings(storage?.homepage)
}

export function UiManagementProvider({ children }: PropsWithChildren) {
  const [homepage, setHomepage] = useState<HomepageUiSettings>(defaultHomepageUiSettings)
  const [navbar, setNavbar] = useState<NavbarUiSettings>(defaultNavbarUiSettings)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHomepage(readHomepageSettings())
    setNavbar(readNavbarSettings())
    setHasHydrated(true)

    function handleStorage(event: StorageEvent) {
      if (event.key === navbarUiStorageKey) {
        setHomepage(readHomepageSettings())
        setNavbar(readNavbarSettings())
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    applyHomepageUiSettingsToDocument(homepage)
    applyNavbarUiSettingsToDocument(navbar)

    if (!hasHydrated) {
      return
    }

    window.localStorage.setItem(navbarUiStorageKey, JSON.stringify({
      homepage,
      navbar,
    }))
  }, [hasHydrated, homepage, navbar])

  return (
    <UiManagementContext.Provider
      value={{
        hasHydrated,
        homepage,
        navbar,
        resetHomepageSettings() {
          setHomepage(defaultHomepageUiSettings)
        },
        resetNavbarSettings() {
          setNavbar(defaultNavbarUiSettings)
        },
        setHomepageVisibility(key, visible) {
          setHomepage(previous => ({
            ...previous,
            [key]: visible,
          }))
        },
        setNavbarVisibility(key, visible) {
          setNavbar(previous => ({
            ...previous,
            [key]: visible,
          }))
        },
      }}
    >
      {children}
    </UiManagementContext.Provider>
  )
}

export function useUiManagement(): UiManagementContextValue {
  const context = useContext(UiManagementContext)

  if (!context) {
    throw new Error('useUiManagement 必须在 UiManagementProvider 内使用')
  }

  return context
}
