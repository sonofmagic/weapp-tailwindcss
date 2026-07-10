<template>
  <view class="index">
    <view class="h-[300px] text-[#c31d6b] bg-[#123456]">Taro Vite Vue3 Tailwind CSS v4</view>
    <text class="text-[55rpx] text-[#fff] bg-purple-300">Hello Vue3!</text>
    <view class="weapp-tw-nutui-vue-demo mt-4">
      <nut-button type="primary">NutUI Vue Button</nut-button>
    </view>
    <view class="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50">
      Taro Vite Vue3 Tailwind CSS v4 system dark
      <view class="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
        Taro Vite Vue3 Tailwind CSS v4 manual dark
      </view>
    </view>
    <t-button t-class="bg-[#0977ee] text-[31rpx]" t-class-content="px-[29rpx]">issue 977 t-class</t-button>
    <view class="h-14 bg-gradient-to-r from-cyan-500 to-blue-500" />
    <view class="h-14 bg-linear-to-r from-cyan-500 to-blue-500" />
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'

useLoad(() => {})
</script>
