import { useEffect, useState } from "react"

import { THEME_STORAGE_KEY, themeOptions, type ThemePreset } from "./options"

const getInitialTheme = (): ThemePreset => {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && themeOptions.some(option => option.value === stored)) {
      return stored as ThemePreset
    }
  }

  return typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    ? "dark"
    : "light"
}

export const useThemePreset = () => {
  const [theme, setTheme] = useState<ThemePreset>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle("dark", theme === "dark")
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  return { theme, setTheme }
}
