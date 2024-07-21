<script setup lang="ts">
import { devDependencies } from '../../../package.json'
import BaseLayout from '@/components/BaseLayout.vue'
import FloatButton from '@/components/FloatButton.vue'
import { useSystemStore } from '@/stores'

const version = devDependencies.tailwindcss.slice(1)

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
    <up-navbar fixed bgColor="inherit" safeAreaInsetTop>
      <template #left>
        <view class="relative flex items-center">
          <view class="i-logos-tailwindcss-icon mr-2 h-[20.57px] w-[34px] shrink-0" />
          <view class="text-lg font-semibold">
            Tailwind CSS
          </view>
          <view
            class="relative bottom-0.5 ml-1 self-end rounded-full bg-sky-400/10 px-2 py-0.5 text-xs font-medium text-sky-600"
          >
            {{ version }}
          </view>
        </view>
      </template>
    </up-navbar>
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
