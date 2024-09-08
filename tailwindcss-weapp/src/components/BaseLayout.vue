<script lang="ts" setup>
import { useSystemStore } from '@/stores'
import ConfigProvider from './ConfigProvider.vue'

const store = useSystemStore()
</script>

<template>
  <view>
    <ConfigProvider :theme="store.theme">
      <slot />
    </ConfigProvider>
  </view>
</template>
