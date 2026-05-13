
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
<script module="utilsA" lang="filter" src="./utils.filter.js"></script>
<script module="utilsB" lang="sjs" src="./utils.sjs"></script>
<script module="inline" lang="wxs">
	var className = 'after:content-[\'我来自inline-wxs\']'
  module.exports = {
    className: className
  }
</script>

<script module="outside" lang="wxs" src="./index.wxs">

</script>