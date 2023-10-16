<template>
  <view>
    <view class="ifdef-[MP-WEIXIN]:bg-blue-500">bg-blue-500</view>
    <view class="ifdef-[H5_||_MP-WEIXIN]:bg-blue-300">bg-blue-300</view>
    <view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">bg-blue-400</view>
    <view class="ifndef-[MP-WEIXIN]:bg-red-500">not bg-red-500</view>
    <view class="ifndef-[H5||MP-WEIXIN]:bg-red-400">bg-red-400</view>
    <view class="wx:bg-blue-400">wx:bg-blue-400</view>
    <view class="-wx:bg-red-400">-wx:bg-red-400</view>
    <view class="mv:bg-blue-400">mv:bg-blue-400</view>
    <view class="-mv:bg-red-400">-mv:bg-red-400</view>
    
    <view>{{ content }}</view>
    <view>****</view>
    <div class="ab text-left">111</div>
    <span class="pp text-xs" :class="flag ? 'text-right' : 'text-left'">222</span>
    <u-button text="月落"></u-button>
    <view class="bg-inherit after:border-none after:content-['Hello_World']">after:border-none</view>
    <view class="text-[#999999] dark:text-white" hover-class="text-[#444444]">dark mode</view>
    <view class="bg-[#123456] text-[#fff123]">bg-[#123456]</view>
    <view :class="className" class="text-[#654321]">className</view>
    <view class="bg-black h-10 w-10" hover-class="h-20 w-20">dark mode</view>
    <Layout />
    <van-steps :steps="steps" :active="0" />
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
      flag: false,
      className: 'bg-[#123456]',
      content: '* 1 * 2 * 3 ****',
      steps: [
        {
          text: '步骤一',
          desc: '描述信息'
        },
        {
          text: '步骤二',
          desc: '描述信息'
        },
        {
          text: '步骤三',
          desc: '描述信息'
        },
        {
          text: '步骤四',
          desc: '描述信息'
        }
      ]
    }
  },

  methods: {},
  onLoad() {
    console.log('Page loaded!')
  }
})
</script>

<style lang="scss">
div,
span {
  color: #999;
}
</style>
