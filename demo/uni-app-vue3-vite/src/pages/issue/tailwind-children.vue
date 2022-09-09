<template>
  <view>
    <view class="child:text-red-500">
      <view class="group-optional:bg-slate-700">I have a white ring.</view>
      <view>I have a white ring.</view>
      <text>I have a white ring.</text>
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