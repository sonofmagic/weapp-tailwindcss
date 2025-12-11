<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { injectCss } from '@/lib/cssInJsRuntime'

const themes = {
  ocean: {
    bg: 'linear-gradient(135deg, #0f172a, #0ea5e9)',
    text: '#e2e8f0',
    border: 'rgba(14,165,233,0.35)',
    shadow: 'rgba(14,165,233,0.35)',
    primary: '#38bdf8',
    onPrimary: '#0b1220',
    ghost: 'rgba(255,255,255,0.08)',
    pill: '#e0f2fe',
    pillText: '#0ea5e9',
  },
  amber: {
    bg: 'linear-gradient(135deg, #1f2937, #f59e0b)',
    text: '#fff7ed',
    border: 'rgba(245,158,11,0.4)',
    shadow: 'rgba(245,158,11,0.35)',
    primary: '#fbbf24',
    onPrimary: '#0f172a',
    ghost: 'rgba(255,255,255,0.06)',
    pill: '#fffbeb',
    pillText: '#92400e',
  },
  aurora: {
    bg: 'linear-gradient(135deg, #111827, #6ee7b7)',
    text: '#ecfeff',
    border: 'rgba(110,231,183,0.4)',
    shadow: 'rgba(110,231,183,0.28)',
    primary: '#34d399',
    onPrimary: '#0b1020',
    ghost: 'rgba(52,211,153,0.12)',
    pill: '#ecfeff',
    pillText: '#0d9488',
  },
}

const theme = ref<keyof typeof themes>('ocean')

const runtimeCss = computed(() => {
  const palette = themes[theme.value]
  return `
.cj-card {
  background: ${palette.bg};
  color: ${palette.text};
  border: 1px solid ${palette.border};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 16px 44px ${palette.shadow};
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.cj-card:hover { transform: translateY(-2px); box-shadow: 0 20px 56px ${palette.shadow}; }
.cj-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${palette.pill};
  color: ${palette.pillText};
  text-transform: uppercase;
}
.cj-title { margin: 10px 0 4px; font-size: 18px; }
.cj-desc { margin: 0 0 10px; color: ${palette.text}cc; }
.cj-actions { display: flex; gap: 10px; }
.cj-button {
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${palette.primary};
  background: ${palette.primary};
  color: ${palette.onPrimary};
  box-shadow: 0 12px 30px ${palette.shadow};
  transition: transform 120ms ease, filter 120ms ease;
}
.cj-button:hover { transform: translateY(-1px); filter: brightness(1.02); }
.cj-button--ghost {
  background: ${palette.ghost};
  color: ${palette.text};
  border-color: ${palette.border};
  box-shadow: none;
}
`
})

watchEffect(() => {
  injectCss('css-in-js-history', runtimeCss.value)
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="rounded-full border border-dashed px-3 py-1 text-muted-foreground">runtime 注入 style</span>
      <span class="rounded-full border border-dashed px-3 py-1 text-muted-foreground">ThemeProvider 切换</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="name in Object.keys(themes)"
        :key="name"
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition hover:bg-muted"
        :class="name === theme ? 'bg-foreground text-background' : 'bg-card/80 text-foreground/80'"
        @click="theme = name as keyof typeof themes"
      >
        {{ name }}
      </button>
    </div>
    <div class="cj-card">
      <div class="flex items-center justify-between gap-2">
        <span class="cj-pill">CSS-in-JS</span>
        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">Runtime</span>
      </div>
      <h3 class="cj-title">动态主题 + 组件边界</h3>
      <p class="cj-desc">props 驱动样式，ThemeProvider 改色不改代码；切换时直接覆写 style。</p>
      <div class="cj-actions">
        <button class="cj-button">注水优化</button>
        <button class="cj-button cj-button--ghost">编译模式</button>
      </div>
    </div>
  </div>
</template>
