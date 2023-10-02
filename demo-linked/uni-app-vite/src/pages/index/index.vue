<template>
  <view>
    <view class="text-[40rpx] text-[#543214] mb-[123px] pt-[100px] min-h-[89.76vh] inset-[43.43px]" :class="bg">hello
      world
      <div>Current Count: {{ counter.count }}</div>
      <button @click="counter.increment()">12345</button>
      <view class="text-[64rpx]/[46rpx]">text-[64rpx]/[46rpx]</view>
      <view class="text-[104rpx]/[146rpx]">text-[64rpx]/[46rpx]</view>
    </view>
    <ApplyButton></ApplyButton>
    <PrefixButton></PrefixButton>
    <ScopedButton></ScopedButton>
  </view>
</template>

<script setup lang="ts">
import 'how-to-build-components-by-tailwindcss-vue/dist/style.css'
import { ApplyButton, PrefixButton, ScopedButton } from 'how-to-build-components-by-tailwindcss-vue'
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

<style scoped></style>