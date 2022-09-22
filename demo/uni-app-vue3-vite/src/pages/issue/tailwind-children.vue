<template>
  <view class="text-sm">
    <view class="p-4">
      <view>child selector</view>
      <view class="child:text-red-500 child:inline-block child:mr-2">
        <view class="not-child">not-child view</view>
        <view>view</view>
        <text>text</text>
        <view>view</view>
        <view>view</view>
      </view>
      <view class="child-['.child']:text-red-500 child:inline-block child:mr-2">
        <view class="not-child">not-child view</view>
        <view class="child">view</view>
        <text>text</text>
        <view>view</view>
        <view>view</view>
      </view>
    </view>
    <view class="p-4">
      <view>child-text selector</view>
      <view class="child-text:text-red-500 child-text:mr-2">
        <text>text</text>
        <text>text</text>
        <text>text</text>
      </view>
    </view>
    <view class="p-4">
      <view>heir selector</view>
      <view class="heir:text-red-500 heir-text:text-green-500 heir:mr-2">
        <view class="not-heir">not-heir view</view>
        <view>view <view>inner view <text>inner text</text><text class="not-heir-text">not-heir inner text</text></view>
        </view>
        <text>text</text>
        <view>view</view>
        <view>view</view>
      </view>
    </view>

    <view class="p-4">
      <view>Sibling variant</view>
      <view>
        <view>view</view>
        <view class="twin:text-green-500 before:content-['*']">twin:ring-white hover:twin:shadow</view>
        <view>view</view>
        <view>view</view>
      </view>
      <!-- <view>
        <view class="not-heir">not-heir view</view>
        <view class="twin:text-green-500">view <view>inner view <text>inner text</text><text
              class="not-heir-text">not-heir inner text</text></view>
        </view>
        <view>view</view>
        <text>text</text>
        <view class="twin:text-red-500">twin:text-red-500</view>
        <view>view</view>
      </view> -->
    </view>

    <view class="p-4">
      <view>Next variant</view>
      <view>
        <view>view</view>
        <view class="next:text-green-500 before:content-['*']">twin:ring-white hover:twin:shadow</view>
        <view class="next-view:text-yellow-500">view</view>
        <view class="next-text:text-red-500">view</view>
        <text>text</text>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
// .child-text-red-500>view {
//   color: red;
// }
// pc 模拟器正常，真机无效
// :where(.child-text-red-500)>view:where(:not(.not-child)),
// text:where(:not(.not-child)) {
//   --tw-text-opacity: 1;
//   color: rgb(239 68 68 / var(--tw-text-opacity))
// }

// 去除 :where
// .child-text-red-500>view:not(.not-child),
// text:not(.not-child) {
//   --tw-text-opacity: 1;
//   color: rgb(239 68 68 / var(--tw-text-opacity))
// }
</style>