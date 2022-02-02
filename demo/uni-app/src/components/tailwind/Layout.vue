<template>
  <div>
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
    <view class=""></view>
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
    >{{d}}</view>
    <!-- <view class="float-left">float-left</view>
    <view class="float-right">float-right</view>
    <view class="float-none">float-none</view> -->
    <view class="z-[55]">z-[55]</view>
    <view class="z-[-55]">z-[-55]</view>
    <view class="bottom-[100px]">bottom-[100px]</view>
    <view class="bottom-[100rpx] shadow">bottom-[100rpx]</view>
    .space-x-0-dot-5 > :not([hidden]) ~ :not([hidden])

    选择器提前用postcss处理
    https://www.tailwindcss.cn/docs/space
    <!-- <view class="space-x-[1.2]">
      <view>space-x-[1.2]</view>
      <view>space-x-[1.2]</view>
      <view>space-x-[1.2]</view>
    </view> -->
    <div class="grid grid-cols-3 divide-x divide-green-500">
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
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
      ]
    }
  }
})
</script>

