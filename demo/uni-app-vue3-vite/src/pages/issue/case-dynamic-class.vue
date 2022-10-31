<template>
  <view>
    <view :class="[item.disabled ? replaceJs('w-[52px] h-[52px] block bg-[#123456]') : '']" :key="idx"
      v-for="(item,idx) in items">

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
const items = ref(new Array(10).fill(0).map((x, idx) => {
  return {
    disabled: idx % 2 === 0
  }
}))

</script>

<style scoped>

</style>