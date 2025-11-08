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
      'space-x-reverse': reverseFlag,
      'flex-row-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <div class="flex flex-col space-y-4 border" :class="{
      'space-y-reverse': reverseFlag,
      'flex-col-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <div class="flex divide-x-4 border p-2 divide-[#d80c0c] divide-double" :class="{
      'divide-x-reverse': reverseFlag,
      'flex-row-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>

    <div class="flex flex-col divide-y-4 border p-2 divide-[#41eb04] divide-dotted" :class="{
      'divide-y-reverse': reverseFlag,
      'flex-col-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <button @click="reverseFlag = !reverseFlag">reverseFlag</button>
    <input v-model="aaa"></input>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello')
const className = ref('bg-[#0000ff] text-[45rpx] text-white')
const reverseFlag = ref(false)
const weappTwIgnore = String.raw
const aaa = ref('111')
const world = {
  Accept: weappTwIgnore`text/event-stream`,
  CCC: `text` + `/evexstream`
}
console.log(world)
const goOrder = () => {
  uni.navigateTo({
    url: '/pages-order/pages/home/home'
  })
}
</script>
