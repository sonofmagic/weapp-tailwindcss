<template>
  <view class="index container bg-[#ffffff]" :class="flag ? 'text-[#aaaaaa]' : 'text-[#fafafa]'">
    <First></First>
    <jsxRender></jsxRender>
    <view :class="classArray">classArray</view>
    <view class="bg-gray-100 dark:bg-zinc-800 h-10 w-10" data-id="bg-[#654123] dark:bg-[#abcdef]"
      hover-class="bg-red-500 dark:bg-[#487512]"></view>
    <!-- <template>1</template> -->
    <view :class="[flag ? 'bg-red-900' : 'bg-[#fafa00]']">bg-[#fafa00]</view>
    <view :class="{ 'bg-[#098765]': flag === true }">bg-[#098765]</view>
    <view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view>
    <view class="space-y-[1.6rem]">
      <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
      <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px]
        leading-[0.9]</view>
      <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
      <view
        class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">
        Hello</view>
      <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765]
        border-solid border-opacity-[0.44]</view>
      <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <view>1</view>
        <view>2</view>
        <view>3</view>
      </view>
      <view class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300"> Default </view>
    </view>
    <view class="test">test</view>
    <Plain></Plain>
  </view>
</template>

<script lang="ts" setup>
import Plain from '../../components/Plain.vue'
import jsxRender from './render'
import First from '../../components/ui/First'
import './index.scss'
import { ref } from 'vue'
const msg = ref('Hello world!')
const flag = ref(true)
const classArray = ['bg-[#543254]', 'h-[100px]', 'w-[300px]', "bg-[url('https://xxx.com/xx.webp')]"]
</script>
