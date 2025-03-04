<template>
  <view class="flex">
    <image class="w-20 h-20" src="/static/logo.png" />
    <view class="text-area">
      <text class="text-[#00f285] text-[88rpx] font-bold underline">{{ title }}</text>
    </view>
    <view :class="className">
      {{ className }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello')
const className = ref('bg-[#0000ff]')
</script>


