import { GithubLink } from "@/components/github-link"
import { Badge } from "@/components/ui/badge"
import { SparklesIcon } from "@/features/home/icons"
import { OverviewGrid } from "@/features/home/sections/OverviewGrid"
import { VariantGrid } from "@/features/home/sections/VariantGrid"
import { AiFeedbackGrid } from "@/features/home/sections/AiFeedbackGrid"
import { StyleComparisonSection } from "@/features/home/sections/StyleComparisonSection"
import { ThemeSwitcher } from "@/theme/ThemeSwitcher"
import { useThemePreset } from "@/theme/use-theme-preset"

function App() {
  const { theme, setTheme } = useThemePreset()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/60 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SparklesIcon className="size-4 text-primary" />
          <span>原子化 CSS 专题 Demo · React</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" tone="ghost">cva · tailwind-merge</Badge>
          <GithubLink />
          <ThemeSwitcher value={theme} onChange={setTheme} />
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-14">
        <OverviewGrid />
        <VariantGrid />
        <AiFeedbackGrid />
        <StyleComparisonSection />
      </main>
    </div>
  )
}

export default App
