<template>
  <view>
    <view class="text-[40rpx] text-[#543214] mb-[123px] pt-[100px] min-h-[89.76vh] inset-[43.43px]" :class="bg">hello
      world
      <div>Current Count: {{ counter.count }}</div>
      <button @click="counter.increment()">12345</button>
    </view>

  </view>
</template>

<script setup lang="ts">
const bg = '!bg-[#aaaaab] !text-[#fafafa]'
import { useCounterStore } from '@/stores/counter'
const counter = useCounterStore()
// counter.count++
// // 自动补全！ ✨
// counter.$patch({ count: counter.count + 1 })
// // 或使用 action 代替
// counter.increment()
</script>

<style scoped></style>