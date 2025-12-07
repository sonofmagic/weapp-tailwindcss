import { onMounted, ref, watch } from 'vue'

import { THEME_STORAGE_KEY, themeOptions, type ThemeMode } from './theme'

export const useThemePreset = () => {
  const theme = ref<ThemeMode>('light')

  const applyTheme = (value: ThemeMode) => {
    const root = document.documentElement
    root.dataset.theme = value
    root.classList.toggle('dark', value === 'dark')
    window.localStorage.setItem(THEME_STORAGE_KEY, value)
  }

  onMounted(() => {
    const root = document.documentElement
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    const fallback = root.classList.contains('dark') ? 'dark' : 'light'
    const initial = (stored && themeOptions.some(option => option.value === stored) ? stored : fallback) as ThemeMode
    theme.value = initial
    applyTheme(initial)
  })

  watch(theme, value => {
    applyTheme(value)
  })

  const setTheme = (value: ThemeMode) => {
    theme.value = value
  }

  return { theme, setTheme }
}
