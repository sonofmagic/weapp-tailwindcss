<template>
  <view>
    <!-- <view>Tag 模式</view>
    <rich-text class="prose prose-2xl prose-h1:text-sky-500" :nodes="nodes"></rich-text> -->
    <view>Class 模式</view>
    <rich-text class="prose prose-sm prose-headings:bg-red-100 prose-h5:text-green-400 prose-h1:text-sky-500 prose-h2:text-yellow-500" :nodes="nodes"></rich-text>
  </view>
</template>

<script lang="ts" setup>
// import { html } from './typography.js'
// import tranfrom from '@weapp-tailwindcss/typography/transform'
// const nodes = tranfrom(html) 
const nodes = []
</script>

<style lang="scss">
// @import "tailwindcss/base";
// @import "tailwindcss/components";
// @import "tailwindcss/utilities";

@config "./tailwind.typography.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>