<template>
  <view>
    <view :key="idx" v-for="(item,idx) in items">
      <view :class="[item.disabled ? 'w-[52px] h-[52px] block bg-[#123456]' : '']"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const items = ref(new Array(10).fill(0).map((x, idx) => {
  return {
    disabled: idx % 2 === 0
  }
}))

</script>

<style scoped>

</style>