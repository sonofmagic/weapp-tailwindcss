<template>
  <view>
    <view class="bg-[#89ab8d] flex flex-col">
      <view class="text-[#438821] dark:text-[#ec4f4f] before:content-['11111']">Hello Vue3!</view>
      <view class="text-[#3d31a4] before:content-['222']">Taro Vite Tailwind CSS v3</view>
    </view>
    <view class="weapp-tw-nutui-vue-demo mt-4">
      <nut-button type="primary">NutUI Vue Button</nut-button>
    </view>
    <view class="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 theme-dark:bg-zinc-900 theme-dark:text-zinc-50 dark:bg-zinc-900 dark:text-zinc-50">
      Taro Vite Vue3 Tailwind CSS v3 system dark
      <view class="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 theme-dark:bg-zinc-950 theme-dark:text-zinc-50">
        Taro Vite Vue3 Tailwind CSS v3 manual dark
      </view>
    </view>
    <view class="bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]">
      <view class="text-[#438821] dark:text-[#ec4f4f] before:content-['11111']">Vue3</view>
      <view class="text-[#3d31a4] before:content-['222']">Vite</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'

useLoad(() => {})
</script>
