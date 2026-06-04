<template>
  <slot />
</template>

<script setup lang="ts">
import { useLaunch, useShow } from '@tarojs/taro'

useLaunch(() => {})
useShow(() => {})
</script>
