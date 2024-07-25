<script lang="ts" setup>
const props = defineProps({
  vars: {
    type: [Object],
  },
  theme: {
    type: [String] as PropType<'light' | 'dark'>,
    default: 'dark',
  },
})

const styleObj = computed(() => {
  return Object.assign({}, {}, props.vars)
})
</script>

<template>
  <view :class="[theme]" :style="styleObj">
    <view class="min-h-screen bg-white transition-colors duration-500 dark:bg-slate-900 dark:text-white">
      <slot />
    </view>
  </view>
</template>
