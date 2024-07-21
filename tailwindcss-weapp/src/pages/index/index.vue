<script setup lang="ts">
import BaseLayout from '@/components/BaseLayout.vue'
import FloatButton from '@/components/FloatButton.vue'
import { useSystemStore } from '@/stores'

const store = useSystemStore()

function openSearchBox() {

}

function toggleTheme() {
  if (store.theme === 'dark') {
    store.setTheme('light')
  }
  else {
    store.setTheme('dark')
  }
}

function go2ThemeDemo() {
  uni.navigateTo({
    url: '/pages/theme/index',
  })
}
</script>

<template>
  <BaseLayout>
    <FloatButton store-key="index-float-btn" :padding="[256, 32, 256, 32]">
      <view class="float-btn mb-3">
        <view class="i-mdi-flask-round-bottom-empty-outline text-sky-400 dark:text-sky-500" @click="go2ThemeDemo" />
      </view>
      <view class="float-btn mb-3" @click="toggleTheme">
        <view v-if="store.theme === 'dark'" class="i-mdi-white-balance-sunny text-sky-500" />
        <view v-else class="i-mdi-weather-night text-sky-400" />
      </view>
      <view class="float-btn" @click="openSearchBox">
        <view class="i-mdi-magnify text-sky-400 dark:text-sky-500" />
      </view>
    </FloatButton>
  </BaseLayout>
</template>
