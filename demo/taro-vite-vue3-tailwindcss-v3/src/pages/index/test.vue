<template>
  <view>
    <view class="bg-[#e24826] flex flex-col">
      <view class="text-[#438821] dark:text-[#ec4f4f] before:content-['11111'] text-[66rpx]">Tests</view>
      <view class="text-[#3d31a4] before:content-['222']">Tests</view>
    </view>
    <view class="bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]">
      <view class="text-[#438821] dark:text-[#ec4f4f] before:content-['11111']">Hello world!</view>
      <view class="text-[#3d31a4] before:content-['222']">Tests</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useLoad } from '@tarojs/taro'

useLoad(() => {})
</script>
