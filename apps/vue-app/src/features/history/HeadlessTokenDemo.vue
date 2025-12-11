<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { computed, ref } from 'vue'

import { cn } from '@/lib/utils'

const tokenSets = {
  neutral: {
    surface: 'oklch(0.98 0 0)',
    foreground: 'oklch(0.22 0 0)',
    accent: '#111827',
    accentForeground: '#f8fafc',
    muted: 'oklch(0.55 0 0)',
    mutedBg: 'oklch(0.94 0 0)',
    border: 'oklch(0.88 0 0)',
    ring: 'oklch(0.72 0 0)',
    shadow: '0 16px 42px rgba(17, 24, 39, 0.14)',
  },
  aurora: {
    surface: 'oklch(0.97 0.06 160)',
    foreground: 'oklch(0.22 0.04 160)',
    accent: '#10b981',
    accentForeground: '#022c22',
    muted: 'oklch(0.46 0.02 160)',
    mutedBg: 'oklch(0.9 0.03 160)',
    border: 'oklch(0.86 0.03 160)',
    ring: 'oklch(0.7 0.09 160)',
    shadow: '0 16px 42px rgba(16, 185, 129, 0.18)',
  },
  night: {
    surface: 'oklch(0.23 0.04 260)',
    foreground: 'oklch(0.94 0.03 260)',
    accent: '#7c3aed',
    accentForeground: '#f5f3ff',
    muted: 'oklch(0.7 0.02 260)',
    mutedBg: 'oklch(0.3 0.02 260)',
    border: 'oklch(0.32 0.02 260)',
    ring: 'oklch(0.6 0.05 260)',
    shadow: '0 18px 48px rgba(124, 58, 237, 0.28)',
  },
}

const headlessItems = [
  { key: 'tabs', title: 'Radix Tabs', note: 'ARIA + keyboard', tone: 'positive' },
  { key: 'menu', title: 'Headless Menu', note: '无样式，可注入类名', tone: 'neutral' },
  { key: 'variants', title: 'cva/tv builder', note: 'slots/variants 默认值集中声明', tone: 'positive' },
  { key: 'merge', title: 'tailwind-merge', note: '兜底去重，AI 友好', tone: 'neutral' },
]

const theme = ref<keyof typeof tokenSets>('neutral')
const active = ref(headlessItems[0]!.key)

const surfaceStyle = computed(() => {
  const t = tokenSets[theme.value]
  return {
    '--hx-surface': t.surface,
    '--hx-foreground': t.foreground,
    '--hx-accent': t.accent,
    '--hx-accent-foreground': t.accentForeground,
    '--hx-muted': t.muted,
    '--hx-muted-bg': t.mutedBg,
    '--hx-border': t.border,
    '--hx-ring': t.ring,
    '--hx-shadow': t.shadow,
  }
})

const item = cva('flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition', {
  variants: { active: { true: 'translate-y-[-1px] ring-2', false: '' } },
  defaultVariants: { active: false },
})

const pill = cva('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', {
  variants: {
    tone: {
      neutral: 'bg-[var(--hx-muted-bg)] text-[var(--hx-foreground)]',
      accent: 'bg-[var(--hx-accent)] text-[var(--hx-accent-foreground)] shadow-lg',
    },
  },
  defaultVariants: { tone: 'accent' },
})

const badge = cva('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold', {
  variants: {
    tone: {
      neutral: 'bg-[var(--hx-muted-bg)] text-[var(--hx-foreground)]',
      accent: 'bg-[var(--hx-accent)]/12 text-[var(--hx-accent)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

const itemStyle = (tone: 'positive' | 'neutral', isActive: boolean) => {
  const accentBg = tone === 'positive' ? 'var(--hx-accent)' : 'var(--hx-muted-bg)'
  const accentColor = tone === 'positive' ? 'var(--hx-accent-foreground)' : 'var(--hx-foreground)'
  const border = tone === 'positive' ? 'var(--hx-accent)' : 'var(--hx-border)'
  return {
    backgroundColor: isActive ? accentBg : 'transparent',
    color: isActive ? accentColor : 'var(--hx-foreground)',
    borderColor: border,
    boxShadow: isActive ? 'var(--hx-shadow)' : 'none',
  }
}
</script>

<template>
  <div class="space-y-3" :style="surfaceStyle">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="name in Object.keys(tokenSets)"
        :key="name"
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition"
        :class="name === theme ? 'bg-[var(--hx-accent)] text-[var(--hx-accent-foreground)]' : 'bg-[var(--hx-surface)] text-[var(--hx-foreground)]'"
        @click="theme = name as keyof typeof tokenSets"
      >
        {{ name }}
      </button>
    </div>

    <div
      class="rounded-2xl border p-4"
      :style="{
        background: 'var(--hx-surface)',
        color: 'var(--hx-foreground)',
        borderColor: 'var(--hx-border)',
        boxShadow: 'var(--hx-shadow)',
      }"
    >
      <div class="flex items-center justify-between gap-2">
        <span :class="pill({ tone: 'accent' })">Headless + tokens</span>
        <span :class="badge({ tone: 'accent' })">cva slots + merge</span>
      </div>
      <p class="mt-2 text-sm text-[var(--hx-muted)]">tokens → variants → primitives → 业务组件</p>

      <div class="mt-4 grid gap-2 md:grid-cols-2">
        <button
          v-for="itemNode in headlessItems"
          :key="itemNode.key"
          type="button"
          :class="cn(item({ active: active === itemNode.key }), 'text-left')"
          :style="itemStyle(itemNode.tone as 'positive' | 'neutral', active === itemNode.key)"
          @click="active = itemNode.key"
        >
          <div>
            <p class="font-semibold leading-tight">
              {{ itemNode.title }}
              <span :class="badge({ tone: itemNode.tone === 'positive' ? 'accent' : 'neutral' })">{{ itemNode.note }}</span>
            </p>
            <p class="text-xs text-[var(--hx-muted)]">tokens 注入 + slot 样式完全由我们掌控</p>
          </div>
          <span v-if="active === itemNode.key" class="text-[11px] font-semibold uppercase tracking-[0.14em]">Active</span>
        </button>
      </div>
    </div>
  </div>
</template>
