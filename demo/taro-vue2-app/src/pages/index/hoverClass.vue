<template>
  <view>
    <view class="bg-[#ffffff] dark:bg-[#000000] h-10 w-10" :class="flag ? 'text-[50px]' : 'text-[100rpx]'" hover-class="bg-[#eeeeee] dark:bg-[#111111]"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      flag: true
    }
  }
}
</script>

<style>
</style>
