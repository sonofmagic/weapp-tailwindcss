<template>
  <view>
    <TestCase55 className="h-[111px] w-[222px] bg-[#987654]"></TestCase55>

    <TestCase55 :className="className"></TestCase55>

    <button @click="toggleClass">toggleClass</button>
  </view>
</template>

<script setup lang="ts">
import TestCase55 from '@/components/TestCase55.vue';
import { ref } from 'vue';
const className = ref<string>('h-[88.88px] w-[33.33px] bg-[yellow]');

const toggleClass = () => {
  className.value = 'h-[128px] w-[242px] bg-[#955443]';
};
</script>

<style scoped>
</style>