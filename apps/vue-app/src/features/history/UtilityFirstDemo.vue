<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { computed, ref } from 'vue'

import { cn } from '@/lib/utils'

const cards = [
  { title: 'JIT 摇树', desc: 'content 精准扫描 + 原子类按需生成' },
  { title: 'tokens 对齐', desc: 'class 来自同一套 spacing/radius/color' },
  { title: 'variants 工厂', desc: 'cva + tailwind-merge 归集状态/尺寸' },
]

const density = ref<'relaxed' | 'compact'>('relaxed')
const accent = ref<'brand' | 'mint'>('brand')

const panel = cva(
  'grid gap-4 rounded-2xl border bg-card/90 p-4 shadow-sm transition-all duration-200',
  {
    variants: {
      density: { relaxed: 'gap-4', compact: 'gap-2' },
      accent: { brand: 'ring-1 ring-primary/30', mint: 'ring-1 ring-emerald-400/30' },
    },
    compoundVariants: [{ density: 'compact', accent: 'mint', class: 'bg-emerald-50/70 dark:bg-emerald-900/20' }],
    defaultVariants: { density: 'relaxed', accent: 'brand' },
  }
)

const badge = cva('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', {
  variants: {
    tone: {
      brand: 'bg-primary/10 text-primary',
      mint: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100',
      ghost: 'border border-dashed border-muted-foreground/40 text-muted-foreground',
    },
  },
  defaultVariants: { tone: 'brand' },
})

const chip = cva('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]', {
  variants: {
    accent: {
      brand: 'bg-primary text-primary-foreground',
      mint: 'bg-emerald-500 text-white',
    },
  },
  defaultVariants: { accent: 'brand' },
})

const hero = computed(() =>
  cn(
    'grid gap-2 rounded-xl border bg-gradient-to-r p-4 shadow-inner',
    accent.value === 'brand'
      ? 'from-slate-900 via-slate-800 to-slate-700 text-slate-100'
      : 'from-emerald-700 via-emerald-600 to-emerald-500 text-emerald-50'
  )
)
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition"
        :class="density === 'relaxed' ? 'bg-foreground text-background' : 'bg-card text-foreground'"
        @click="density = 'relaxed'"
      >
        relaxed
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition"
        :class="density === 'compact' ? 'bg-foreground text-background' : 'bg-card text-foreground'"
        @click="density = 'compact'"
      >
        compact
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition"
        :class="accent === 'brand' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'"
        @click="accent = 'brand'"
      >
        tailwind
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition"
        :class="accent === 'mint' ? 'bg-emerald-500 text-white' : 'bg-card text-foreground'"
        @click="accent = 'mint'"
      >
        uno preset
      </button>
    </div>

    <div :class="panel({ density, accent })">
      <div class="flex items-center justify-between gap-2">
        <span :class="chip({ accent })">utility-first</span>
        <span :class="badge({ tone: 'ghost' })">content 精准</span>
      </div>

      <div :class="hero">
        <p class="text-xs uppercase tracking-[0.18em] text-white/70">class = 样式</p>
        <p class="text-lg font-semibold leading-tight">JIT + variants + tokens</p>
        <p class="text-sm text-white/80">把 spacing/radius/color 统统绑到同一套 token。</p>
      </div>

      <div class="grid gap-2 sm:grid-cols-3">
        <div v-for="card in cards" :key="card.title" class="rounded-lg border border-dashed p-3">
          <p class="flex items-center justify-between gap-2 text-sm font-semibold">
            {{ card.title }}
            <span :class="badge({ tone: accent === 'brand' ? 'brand' : 'mint' })">variant</span>
          </p>
          <p class="text-xs text-muted-foreground">{{ card.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
