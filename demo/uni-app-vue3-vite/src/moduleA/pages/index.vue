
<template>
  <view class="before:content-['moduleA_独立分包']">

    <view class="{{inline.className}}">

    </view>
    <view class="{{inline.className2}}">

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
  var className2 = "after:content-['我是className']"
  module.exports = {
    className: className,
    className2: className2
  }
</script>

<script module="outside" lang="wxs" src="./index.wxs">

</script>