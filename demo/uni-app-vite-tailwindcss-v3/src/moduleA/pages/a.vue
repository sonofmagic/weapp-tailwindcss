
<template>
  <view class="before:content-['moduleA_独立分包']">

    <view class="{{inline.className}}">

    </view>
    <view class="{{ outside.className }}">

    </view>
  </view>
</template>

<script setup lang="ts">

</script>

<style lang="scss" src="./index.scss"></style>

<script module="inline" lang="wxs">
	var className = 'after:content-[\'我来自inline-wxs\']'
  module.exports = {
    className: className
  }
</script>

<script module="outside" lang="wxs" src="./index.wxs">

</script>