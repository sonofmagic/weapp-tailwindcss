<template>
  <view>
    <!-- <view class="m-[12px]">
      <view>Just in Time:</view>
      <text class="text-[60rpx] text-[#111111]  h-[calc(100vh-100px)]">{{ title }} world!</text>
      <view class="text-clip bg-slate-100 text-left text-gray-900/90">weapp-tailwindcss-webpack-plugin</view>
      <view class="w-8 h-8 bg-[#ff0000] rounded-full"></view>
    </view> -->
    <view :class="[
      flag?'bg-red-900':'bg-[#fafa00]',
      classObject,
      {
        'bg-[#fafa00]':flag===true,
        'text-sm':true
      },
      flag? flag===false? 'bg-red-900': 'bg-[#000]' :'bg-[#fafa00]',
      ]"></view>
    <view :class="{
        'bg-[#fafa00]':flag===true,
        'text-sm':true
      }"></view>

    <view :class="classObject"></view>
    <Layout />
    <tui-org-tree :treeData="treeData"></tui-org-tree>
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
      title: 'Hello',
      flag: false,
      classObject: {
        'text-[20px]': true,
        'bg-[#000000]': false
      },
      treeData: [
        {
          text: 'icebreaker',
          // align: 'vertical',
          children: [
            {
              text: 'icebreaker.top',
              children: [
                {
                  text: '破冰客',
                  active: true
                }
              ]
            },
            {
              text: '程序员名片',
              children: []
            }
          ]
        }
      ]
    }
  },

  methods: {}
})
</script>

<style lang="scss">
</style>
