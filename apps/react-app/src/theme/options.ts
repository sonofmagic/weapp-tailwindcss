import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { MoonIcon, PaletteIcon, SunIcon } from "@/features/home/icons"

type ThemeOption = {
  value: "light" | "mint" | "sunset" | "dark"
  label: string
  swatch: string
  icon: ComponentType<LucideProps>
}

export const themeOptions = [
  { value: "light", label: "亮白", swatch: "from-slate-400 via-slate-600 to-slate-800", icon: SunIcon },
  { value: "mint", label: "薄荷", swatch: "from-emerald-400 to-teal-600", icon: PaletteIcon },
  { value: "sunset", label: "日落", swatch: "from-amber-400 to-rose-500", icon: PaletteIcon },
  { value: "dark", label: "暗夜", swatch: "from-slate-600 to-slate-900", icon: MoonIcon },
] satisfies readonly ThemeOption[]

export type ThemePreset = (typeof themeOptions)[number]["value"]

export const THEME_STORAGE_KEY = "demo-theme"
