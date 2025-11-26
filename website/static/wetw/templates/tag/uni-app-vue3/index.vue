<template>
  <view
    class="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold"
    :class="toneClass"
  >
    <text>{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tone?: 'primary' | 'neutral' | 'danger'
  text?: string
}>()

const toneClass = computed(() => {
  if (props.tone === 'neutral') return 'bg-slate-100 text-slate-900'
  if (props.tone === 'danger') return 'bg-red-50 text-red-800'
  return 'bg-sky-500 text-slate-50'
})
</script>
