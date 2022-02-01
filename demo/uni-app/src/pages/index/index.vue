<template>
  <view>
    <!-- <view class="m-[12px]">
      <view>Just in Time:</view>
      <text class="text-[60rpx] text-[#111111]  h-[calc(100vh-100px)]">{{ title }} world!</text>
      <view class="text-clip bg-slate-100 text-left text-gray-900/90">weapp-tailwindcss-webpack-plugin</view>
      <view class="w-8 h-8 bg-[#ff0000] rounded-full"></view>
    </view> -->
    <view class="flex flex-col items-center">
      <Layout/>
    </view>
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
import Layout from '@/components/tailwind/Layout.vue'
export default Vue.extend({
  components: {
    Layout
  },
  data() {
    return {
      title: 'Hello'
    }
  },
  onLoad() {},
  methods: {}
})
</script>

<style lang="scss">
</style>
