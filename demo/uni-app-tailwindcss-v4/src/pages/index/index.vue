<template>
  <view class="flex flex-col">
    <image class="w-20 h-20" src="/static/logo.png" />
    <view class="text-area aspect-(--my-aspect-ratio)">
      <text class="text-[#00f285] text-[88rpx] font-bold underline">{{ title }}</text>
    </view>
    <view :class="className" class="aspect-[calc(4*3+1)/3]">
      {{ className }}
    </view>
    <view class="i-mdi-home"></view>
    <view class="bg-midnight text-tahiti fill-bermuda">
      bg-midnight text-tahiti fill-bermuda
    </view>
    <view class="bg-neutral-1B">
      12345
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello')
const className = ref('bg-[#0000ff] text-[45rpx] text-white')
</script>


