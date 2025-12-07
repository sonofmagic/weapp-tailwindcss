import { PaletteIcon } from "@/features/home/icons"
import { cn } from "@/lib/utils"

import { themeOptions, type ThemePreset } from "./options"

type ThemeSwitcherProps = {
  value: ThemePreset
  onChange: (value: ThemePreset) => void
  className?: string
}

export function ThemeSwitcher({ value, onChange, className }: ThemeSwitcherProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-full border bg-background/80 px-1 py-1 shadow-sm backdrop-blur",
        className
      )}
    >
      <div className="hidden items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:inline-flex">
        <PaletteIcon className="size-3" /> 主题
      </div>
      {themeOptions.map(option => {
        const Icon = option.icon
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            type="button"
          >
            <span className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-r", option.swatch)} />
            <Icon className="size-3" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
