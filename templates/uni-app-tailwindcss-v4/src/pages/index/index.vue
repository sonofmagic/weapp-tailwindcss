<template>
  <view class="flex flex-col items-center justify-center space-y-4">
    <image class="w-20 h-20 mt-4" src="/static/logo.png" />
    <view class="text-area">
      <text class="text-[#00f285] text-[88rpx] font-bold underline">{{ title }}</text>
    </view>
    <view :class="className" class="text-white rounded-md">
      欢迎使用 weapp-tailwindcss uni-app 模板
    </view>
    <view>
      <IceButton custom-class="bg-amber-600">
        按钮示例
      </IceButton>
    </view>

  </view>
</template>

<script setup lang="ts">
import IceButton from '@/components/IceButton.vue'
import { ref } from 'vue'
const title = ref('Hello')
const className = ref('bg-[#00aa55] mb-[20rpx] p-[20rpx]')
</script>

<style>
.text-area{
  padding: 40rpx;
}
</style>