<template>
  <text v-if="tag === 'text'">
    <slot></slot>
  </text>
  <view v-else-if="tag === 'view'">
    <slot></slot>
  </view>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
export default defineComponent({
  options: { virtualHost: true },
  props: {
    tag: {
      type: [String] as PropType<'view' | 'text'>,
      default: 'text'
    }
  }
})
</script>

<style scoped></style>