<template>
  <view>
    <view class="relative h-12 w-12 before:absolute before:inset-0 before:border-2 before:border-[#4bd650] rounded-[20rpx] before:rounded-[20rpx]" />
    <view class="shadow-md">shadow-md</view>
    <view class="form-box py-[62px] rotate-45 px-[95px] bg-sky-500/80 dark:bg-[#123456]">
      Taro Webpack Vue3 Tailwind CSS v3
    </view>
    <view class="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 theme-dark:bg-zinc-900 theme-dark:text-zinc-50 dark:bg-zinc-900 dark:text-zinc-50">
      Taro Webpack Vue3 Tailwind CSS v3 system dark
      <view class="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 theme-dark:bg-zinc-950 theme-dark:text-zinc-50">
        Taro Webpack Vue3 Tailwind CSS v3 manual dark
      </view>
    </view>
    <view :class="dynamicClass">dynamic class</view>
    <view class="space-y-[1.6rem] text-[16px] w-[200%]">
      <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
      <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px]</view>
      <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <view>1</view>
        <view>2</view>
        <view>3</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLoad } from '@tarojs/taro'

const dynamicClass = computed(() => 'bg-[#123456] text-[#ffffff] p-[20px]')

useLoad(() => {})
</script>

<style lang="scss">
.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}

.aspect-w-16 > * {
  color: red;
}

.a {
  color: green;
}

.b {
  color: yellow;
}
</style>
