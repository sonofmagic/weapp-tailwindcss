<template>
  <div class="before:content-['hello'] before:block">
    <view>{{ wildContent }}</view>
    <view class="block"></view>
    <view class="inline-block"></view>
    <view class="list-item"></view>
    <view class="flex"></view>
    <view :class="bbb">bbb</view>
    <view :class="classArray" class="after:content-['这是classArray,用于测试动态js绑定class']">classArray</view>
    <view :class="['text-[20px]', true ? 'text-[#898989]' : 'text-[#132323]', aaa]">:class="['text-sm', classObj]
    </view>
    <view class="text-[22px]">对酒当歌，人生几何</view>
    <view class="!h-5 w-5 shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)]"></view>
    <view class="h-5 w-5 shadow-[0px_2px_11px_0px_#00000a]"></view>
    <!-- <view class="container">container</view>
    <span class="decoration-clone bg-gradient-to-b from-yellow-400 to-red-500 text-transparent">
      Hello<br>
      World
    </span>
    <div class="box-border h-32 w-32 p-4 border-4 border-blue-400 bg-blue-200 rounded-md">
      <div class="h-full w-full bg-blue-400 bg-stripes bg-stripes-white"></div>
    </div>
    <div class="box-content h-32 w-32 p-4 border-4 border-green-400 bg-green-200 rounded-md">
      <div class="h-full w-full bg-green-400 bg-stripes bg-stripes-white"></div>
    </div> -->
    <!-- <view class=""></view>
    <view :class="['']"></view>
    <view :class="'bg-[#dddddd]'">123</view>
    <view
      class="h-[100px]"
      :class="'hello w-[100rpx]'"
    ></view>
    <view
      :class="[d]"
      class="item"
      :key="d"
      v-for="d in displayArray"
    >{{d}}</view> -->
    <!-- <view class="float-left">float-left</view>
    <view class="float-right">float-right</view>
    <view class="float-none">float-none</view> -->
    <!-- <view class="z-[55]">z-[55]</view>
    <view class="z-[-55]">z-[-55]</view>
    <view class="bottom-[100px]">bottom-[100px]</view>
    <view class="bottom-[100rpx] shadow">bottom-[100rpx]</view> -->
    <!-- .space-x-0-dot-5 > :not([hidden]) ~ :not([hidden])

    选择器提前用postcss处理
    https://www.tailwindcss.cn/docs/space -->
    <view :class="classObject">classObject</view>
    <view :class="[flag ? 'bg-red-900' : 'bg-[#fafa00]']">Toggle</view>
    <view :class="{
      'bg-[#fafa00]': flag === true
    }">Toggle</view>
    <button @click="flag = !flag">Toggle flag</button>
    <view class="p-[20px] -mt-2 mb-[-20px] h-[200%]">p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</view>
    <view class="space-y-[1.6rem]">
      <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
      <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px]
        leading-[0.9]</view>
      <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
      <view
        class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">
        Hello</view>
      <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765]
        border-solid border-opacity-[0.44]</view>
      <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </view>
      <view class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300"> Default </view>
    </view>
    <view class="test">test</view>

    <!-- <view class="shadow-2xl">shadow</view> -->
    <!-- <div class="grid grid-cols-3 divide-x divide-green-500">
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </div> -->
    <view class="ifdef-[MP-WEIXIN]:bg-blue-500">bg-blue-500</view>
    <view class="ifdef-[uniVersion_>_3.9]:bg-blue-100">bg-blue-100</view>
    <view class="ifdef-[uniVersion>3.9]:bg-blue-200">bg-blue-200</view>
    <view class="ifdef-[H5_||_MP-WEIXIN]:bg-blue-300">bg-blue-300</view>
    <view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">bg-blue-400</view>
    <view class="ifndef-[MP-WEIXIN]:bg-red-500">not bg-red-500</view>
    <view class="ifndef-[H5||MP-WEIXIN]:bg-red-400">bg-red-400</view>

    <view class="wx:bg-blue-400">wx:bg-blue-400</view>
    <view class="-wx:bg-red-400">-wx:bg-red-400</view>

    <view class="mv:bg-blue-400">mv:bg-blue-400</view>
    <view class="-mv:bg-red-400">-mv:bg-red-400</view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    // uni-app vue2 小程序端不支持 classObject 和 styleObject 语法。
    // https://uniapp.dcloud.net.cn/tutorial/vue-basics.html#%E6%95%B0%E7%BB%84%E8%AF%AD%E6%B3%95
    const classObj = {
      'text-[#fafafa]': true
    }
    const classArray = [
      'text-[30rpx]',
      "bg-[url('https://xxx.com/xx.webp')]",
      /*weapp-tw ignore*/ 'bg-[#00ff00]',

    ]
    return {
      classObj,
      classArray,
      aaa: 'bg-[#ff0000]',
      bbb: /*weapp-tw ignore*/ 'bg-[#00ff00]',
      flag: false,
      wildContent: '********',
      displayArray: [
        'block',
        'inline-block',
        'inline',
        'flex',
        'inline-flex',
        'table',
        'inline-table',
        'table-caption',
        'table-cell',
        'table-column',
        'table-column-group',
        'table-footer-group',
        'table-header-group',
        'table-row-group',
        'table-row',
        'flow-root',
        'grid',
        'inline-grid',
        'contents',
        'list-item',
        'hidden'
      ],
    }
  },
  computed: {
    classObject() {
      return 'text-[20px] bg-[#000000]'
    }
  }
})
</script>
<style lang="scss">
.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}
</style>

