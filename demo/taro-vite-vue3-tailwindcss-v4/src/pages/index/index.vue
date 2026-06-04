<template>
  <view class="index">
    <view class="h-[300px] text-[#c31d6b] bg-[#123456]">Taro Vite Vue3 Tailwind CSS v4</view>
    <text class="text-[55rpx] text-[#fff] bg-purple-300">Hello Vue3!</text>
    <view class="h-14 bg-gradient-to-r from-cyan-500 to-blue-500" />
    <view class="h-14 bg-linear-to-r from-cyan-500 to-blue-500" />
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'

useLoad(() => {})
</script>
