<template>
  <view>
    <u-button text="月落"></u-button>
    <view class="after:border-none after:content-['Hello_World']">after:border-none</view>
    <view class="text-[#999999] dark:text-white" hover-class="text-[#444444]">dark mode</view>
    <view class="bg-[#123456]">bg-[#123456]</view>
    <view :class="className">className</view>
    <view class="bg-black h-10 w-10" hover-class="h-20 w-20">dark mode</view>
    <Layout />
    <van-steps :steps="steps" :active="0" />
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
import Layout from '@/components/tailwind/Layout.vue'
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
export default Vue.extend({
  components: {
    Layout
  },
  data() {
    return {
      flag: false,
      className: replaceJs('bg-[#123456]'),
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

  methods: {}
})
</script>

<style lang="scss">
</style>
