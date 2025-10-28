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
    <view class="mt-6 rounded-xl bg-emerald-500 py-3 text-center text-white shadow-sm active:bg-emerald-600"
      @tap="goOrder">
      打开订单分包
    </view>
    <div class="flex space-x-4 border" :class="{
      'space-x-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <div class="flex flex-col space-y-4 border" :class="{
      'space-y-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <div class="flex divide-x-4 border p-2" :class="{
      'divide-x-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>

    <div class="flex flex-col divide-y-4 border p-2" :class="{
      'divide-y-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <button @click="reverseFlag = !reverseFlag">reverseFlag</button>
    

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello')
const className = ref('bg-[#0000ff] text-[45rpx] text-white')
const reverseFlag = ref(false)
const goOrder = () => {
  uni.navigateTo({
    url: '/pages-order/pages/home/home'
  })
}
</script>
