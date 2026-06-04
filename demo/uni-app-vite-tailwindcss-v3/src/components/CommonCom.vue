<template>
  <text v-if="props.tag === 'text'">
    <slot></slot>
  </text>
  <view v-else-if="props.tag === 'view'">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  tag?: 'view' | 'text'
}>(), {
  tag: 'text'
}) 
</script>

<style scoped></style>