<script setup lang="ts">
import { Palette } from 'lucide-vue-next'

import { cn } from '@/lib/utils'
import { themeOptions, type ThemeMode } from './theme'

const props = defineProps<{
  modelValue: ThemeMode
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ThemeMode): void
}>()

const handleSelect = (value: ThemeMode) => emit('update:modelValue', value)
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 rounded-full border bg-background/80 px-1 py-1 shadow-sm backdrop-blur">
    <div class="hidden items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:inline-flex">
      <Palette class="h-3 w-3" /> 主题
    </div>
    <button
      v-for="option in themeOptions"
      :key="option.value"
      type="button"
      :class="
        cn(
          'flex items-center gap-2 rounded-full px-3 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          modelValue === option.value
            ? 'bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/30'
            : 'text-muted-foreground hover:text-foreground',
        )
      "
      :aria-pressed="modelValue === option.value"
      @click="handleSelect(option.value)"
    >
      <span :class="cn('h-2.5 w-2.5 rounded-full bg-gradient-to-r', option.swatch)" />
      <component v-if="option.icon" :is="option.icon" class="h-3 w-3" />
      {{ option.label }}
    </button>
  </div>
</template>
