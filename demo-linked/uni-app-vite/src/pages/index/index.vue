<template>
  <view>
    <view class="apply-test">1234567890</view>
    <view class="apply-test-2">1234567890</view>
    <view class="text-[40rpx] text-[#543214] mb-[123px] pt-[100px] min-h-[89.76vh] inset-[43.43px]" :class="bg">hello
      world
      <div>Current Count: {{ counter.count }}</div>
      <button @click="counter.increment()">12345</button>
      <view class="text-[64rpx]/[46rpx]">text-[64rpx]/[46rpx]</view>
      <view class="text-[104rpx]/[146rpx]">text-[64rpx]/[46rpx]</view>
    </view>

    <view class="ifdef-[uniVersion_>_3.9]:bg-blue-100">bg-blue-100</view>
    <view class="ifdef-[uniVersion>3.9]:bg-blue-200">bg-blue-200</view>

    <view class="ifdef-[MP-WEIXIN]:bg-blue-500">bg-blue-500</view>
    <view class="ifdef-[H5_||_MP-WEIXIN]:bg-blue-300">bg-blue-300</view>
    <view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">bg-blue-400</view>
    <view class="ifndef-[MP-WEIXIN]:bg-red-500">not bg-red-500</view>
    <view class="ifndef-[H5||MP-WEIXIN]:bg-red-400">bg-red-400</view>

    <view class="wx:bg-blue-400">wx:bg-blue-400</view>
    <view class="-wx:bg-red-400">-wx:bg-red-400</view>

    <view class="mv:bg-blue-400">mv:bg-blue-400</view>
    <view class="-mv:bg-red-400">-mv:bg-red-400</view>


  </view>
</template>

<script setup lang="ts">
// https://tailwindcss.com/docs/font-size#setting-the-line-height
const bg = '!bg-[#ff00ff] !text-[#00fffa] '
import { useCounterStore } from '@/stores/counter'
const counter = useCounterStore()
// counter.count++
// // 自动补全！ ✨
// counter.$patch({ count: counter.count + 1 })
// // 或使用 action 代替
// counter.increment()
</script>

<style lang="scss" >
.apply-test {
  @apply mv:bg-blue-400 -mv:bg-red-400 wx:text-blue-400 -wx:text-red-400;
}

.apply-test-2 {
  @apply ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-red-400;
}
</style>