<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import GithubLink from '@/features/home/GithubLink.vue'
import AiFeedbackGrid from '@/features/home/AiFeedbackGrid.vue'
import OverviewGrid from '@/features/home/OverviewGrid.vue'
import StyleComparisonSection from '@/features/home/StyleComparisonSection.vue'
import ThemeSwitcher from '@/features/home/ThemeSwitcher.vue'
import VariantGrid from '@/features/home/VariantGrid.vue'
import StageDemos from '@/features/history/StageDemos.vue'
import { useThemePreset } from '@/features/home/useThemePreset'

const { theme, setTheme } = useThemePreset()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/60 text-foreground">
    <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles class="h-4 w-4 text-primary" />
        <span>原子化 CSS 专题 Demo · Vue</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="brand" tone="ghost">cva · tailwind-merge</Badge>
        <GithubLink />
        <ThemeSwitcher :model-value="theme" @update:model-value="setTheme" />
      </div>
    </div>

    <main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-14">
      <OverviewGrid />
      <StageDemos />
      <VariantGrid />
      <AiFeedbackGrid />
      <StyleComparisonSection />
    </main>
  </div>
</template>
