<template>
  <view class="content">
    <view>
      <text
        class="text-[60rpx] text-[#cccccc] m-[12px] h-[calc(100vh-100px)]"
        >{{ title }}</text
      >
      <view class="text-clip bg-slate-100 text-left text-blue-200"
        >weapp-tailwindcss-webpack-plugin</view
      >
    </view>
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      title: 'Hello'
    }
  },
  onLoad() {},
  methods: {}
})
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin: 200rpx auto 50rpx auto;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
