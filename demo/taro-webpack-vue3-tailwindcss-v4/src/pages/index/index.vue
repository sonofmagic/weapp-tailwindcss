<template>
  <view>
    <view class="bg-[#534312] text-[#fff] text-[100rpx]">
      <text>Hello Vue3!</text>
    </view>
    <view class="bg-purple-800 text-pink-200">Taro Webpack Vue3 Tailwind CSS v4</view>
    <view class="weapp-tw-nutui-vue-demo mt-4">
      <nut-button type="primary">NutUI Vue Button</nut-button>
    </view>
    <view class="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50">
      Taro Webpack Vue3 Tailwind CSS v4 system dark
      <view class="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
        Taro Webpack Vue3 Tailwind CSS v4 manual dark
      </view>
    </view>
    <view class="h-14 bg-gradient-to-r from-cyan-500 to-blue-500" />
    <view class="rounded-[24rpx] bg-[#123456] px-[32px] py-[18px] text-[#ffffff]">
      Share
    </view>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'
import './index.css'

useLoad(() => {})
</script>
