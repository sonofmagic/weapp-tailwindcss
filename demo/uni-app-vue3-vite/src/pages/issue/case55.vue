<template>
  <view>
    <TestCase55 className="h-[111px] w-[222px] bg-[#987654]"></TestCase55>

    <TestCase55 :className="className"></TestCase55>

    <button @click="toggleClass">toggleClass</button>
    <button @click="toggleBarVisible(true)">显示Tabbar</button>
    <button @click="toggleBarVisible(false)">隐藏Tabbar</button>
  </view>
</template>

<script setup lang="ts">
import TestCase55 from '@/components/TestCase55.vue';
import { ref } from 'vue';
const className = ref<string>('h-[88.88px] w-[33.33px] bg-[yellow]');

const toggleClass = () => {
  className.value = 'h-[128px] w-[242px] bg-[#955443]';
};
function toggleBarVisible(visible:boolean){
  const app = getApp()
  app.globalData!.tabbarVisible = visible
  console.log(app.globalData)
}
</script>

<style scoped>
</style>