<script lang="ts" setup>
defineProps({
  cssVars: {
    type: [String],
  },
  mode: {
    type: [String] as PropType<'light' | 'deep' | 'dark' | 'fantasy'>,
    default: 'light',
  },
})
</script>

<template>
  <view :class="[mode]" :style="cssVars">
    <view class="min-h-screen transition-colors duration-500">
      <slot />
    </view>
  </view>
</template>
