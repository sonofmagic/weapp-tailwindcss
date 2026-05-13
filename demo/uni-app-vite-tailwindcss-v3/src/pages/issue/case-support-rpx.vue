<template>

  <view>
    <view class="w-[77rpx] h-[77rpx] text-[17rpx] border-[7rpx] p-[5rpx] m-[5rpx] space-y-[11rpx]">
      <view class="leading-[23rpx] rounded-[12rpx]">1</view>
      <view class="underline-offset-[3rpx]">2</view>
      <view class="indent-[11rpx] border-t-[3rpx]">3</view>
      <view class="divide-x-[3px]">4</view>
      <view class="outline-[5rpx] outline-offset-[3rpx]">5</view>
      <view class="ring-[10rpx] ring-offset-[3rpx]">6</view>
      <view class="origin-[100rpx_111rpx]">6</view>
      <view class="translate-y-[17rpx] backdrop-blur-[2rpx] blur-[2rpx]"></view>
    </view>
    <view>由此可见，只有arbitrary-values使用中产生二义性的时候复现</view>
    <view>https://github.com/sonofmagic/weapp-tailwindcss/issues/110</view>
    <view>text/border/ring/ring-offset/outline</view>
    <view>outline-offset 没有出现这种情况</view>
    <view>divide-[3rpx] 不纳入因为本身 arbitrary-values 就是表示颜色</view>
  </view>

</template>

<script setup lang="ts">

</script>

<style scoped>

</style>