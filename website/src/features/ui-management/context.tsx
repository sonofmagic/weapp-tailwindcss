import type { PropsWithChildren } from 'react'
import type { NavbarUiControlKey, NavbarUiSettings } from './navbar'
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  applyNavbarUiSettingsToDocument,
  defaultNavbarUiSettings,
  mergeNavbarUiSettings,

  navbarUiStorageKey,
} from './navbar'

interface UiManagementContextValue {
  hasHydrated: boolean
  navbar: NavbarUiSettings
  resetNavbarSettings: () => void
  setNavbarVisibility: (key: NavbarUiControlKey, visible: boolean) => void
}

const UiManagementContext = createContext<UiManagementContextValue | null>(null)

function readNavbarSettings(): NavbarUiSettings {
  if (typeof window === 'undefined') {
    return defaultNavbarUiSettings
  }

  try {
    const rawValue = window.localStorage.getItem(navbarUiStorageKey)
    if (!rawValue) {
      return defaultNavbarUiSettings
    }

    return mergeNavbarUiSettings(JSON.parse(rawValue))
  }
  catch {
    return defaultNavbarUiSettings
  }
}

export function UiManagementProvider({ children }: PropsWithChildren) {
  const [navbar, setNavbar] = useState<NavbarUiSettings>(defaultNavbarUiSettings)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setNavbar(readNavbarSettings())
    setHasHydrated(true)

    function handleStorage(event: StorageEvent) {
      if (event.key === navbarUiStorageKey) {
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

    applyNavbarUiSettingsToDocument(navbar)

    if (!hasHydrated) {
      return
    }

    window.localStorage.setItem(navbarUiStorageKey, JSON.stringify(navbar))
  }, [hasHydrated, navbar])

  return (
    <UiManagementContext.Provider
      value={{
        hasHydrated,
        navbar,
        resetNavbarSettings() {
          setNavbar(defaultNavbarUiSettings)
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
