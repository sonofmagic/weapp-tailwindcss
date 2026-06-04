<template>
  <view>
    <view class="bg-[#89ab8d] flex flex-col">
      <view class="text-[#438821] dark:text-[#ec4f4f] before:content-['11111']">Hello Vue3!</view>
      <view class="text-[#3d31a4] before:content-['222']">Taro Vite Tailwind CSS v3</view>
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
