<template>
  <view>
    <view class="bg-[#534312] text-[#fff] text-[100rpx]">
      <text>Hello Vue3!</text>
    </view>
    <view class="bg-purple-800 text-pink-200">Taro Webpack Vue3 Tailwind CSS v4</view>
    <view class="h-14 bg-gradient-to-r from-cyan-500 to-blue-500" />
    <view class="rounded-[24rpx] bg-[#123456] px-[32px] py-[18px] text-[#ffffff]">
      Share
    </view>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'

useLoad(() => {})
</script>
