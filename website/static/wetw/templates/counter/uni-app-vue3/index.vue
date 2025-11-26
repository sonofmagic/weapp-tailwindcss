<template>
  <view class="flex items-center gap-2">
    <button class="px-3 py-2 rounded-lg bg-slate-900 text-white" @tap="dec">-</button>
    <text class="min-w-[64rpx] text-center font-semibold">{{ count }}</text>
    <button class="px-3 py-2 rounded-lg bg-slate-900 text-white" @tap="inc">+</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const inc = () => { count.value++ }
const dec = () => { count.value-- }
</script>
