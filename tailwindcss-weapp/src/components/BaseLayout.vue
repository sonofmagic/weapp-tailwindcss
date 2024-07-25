<script lang="ts" setup>
import ConfigProvider from './ConfigProvider.vue'
import { useSystemStore } from '@/stores'

const store = useSystemStore()
</script>

<template>
  <view>
    <ConfigProvider :theme="store.theme">
      <slot />
    </ConfigProvider>
  </view>
</template>
