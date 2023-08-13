<template>
  <view>
    <view class="i-mdi-home text-3xl text-red-600"></view>
    <div :class="className">
      className
    </div>
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    className: [String]
  }
})
</script>

<style lang="scss" scoped></style>