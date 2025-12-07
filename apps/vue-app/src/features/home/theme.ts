import { Moon, Palette, Sun } from 'lucide-vue-next'

export const themeOptions = [
  { value: 'light', label: '亮白', swatch: 'from-slate-400 via-slate-600 to-slate-800', icon: Sun },
  { value: 'mint', label: '薄荷', swatch: 'from-emerald-400 to-teal-600', icon: Palette },
  { value: 'sunset', label: '日落', swatch: 'from-amber-400 to-rose-500', icon: Palette },
  { value: 'dark', label: '暗夜', swatch: 'from-slate-600 to-slate-900', icon: Moon },
] as const

export type ThemeMode = (typeof themeOptions)[number]['value']

export const THEME_STORAGE_KEY = 'demo-theme'
