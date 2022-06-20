<template>
  <view class="content">
    <view>当前系统主题:{{ themeRef }}</view>
    <view class="h-5 w-5 shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)] before:content-['Festivus']"></view>
    <view class="h-5 w-5 shadow-[0px_2px_11px_0px_#00000a]"></view>
    <view class="text-[22px] dark:text-yellow-400">text-[22px]</view>
    <view class="text-[#bada55]">text-[#bada55]</view>
    <view class="text-[var(--my-var)]">text-[var(--my-var)]</view>
    <div class="text-[length:var(--my-var)]">...</div>
    <div class="text-[color:var(--my-var)]">...</div>
    <button
      class="!bg-green-500 !sr-onlytext-white"
      :class="{
        'opacity-50': disabled,
      }"
      :disabled="disabled"
    >
      disable
    </button>
    <view class="test">test</view>
    <view :key="v" class="h-[20px] w-[20px]" :class="v" v-for="(v, i) in cardsColor"></view>
    <!-- <view :key="i" class="h-[20px] w-[20px]" :class="cardsColor[i - 1]" v-for="i in 5"></view> -->
    <view class="w-2 h-2 bg-[#123456]"></view>
    <view class="w-2 h-2 bg-blue-500/50"></view>
    <view class="flex items-center justify-center w-screen h-screen">
      <view class="!font-bold !text-[#990000]" :class="['text-2xl', { underline: true }]">{{ title }}</view>
    </view>
    <image class="logo" src="/static/logo.png" @click="go2SubDemo" />
    <view class="text-area">
      <text class="title h-[200%]">{{ title }}</text>
    </view>
    <view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</view>
    <view class="space-y-[1.6rem]">
      <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
      <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view>
      <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
      <view
        class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]"
        :class="['text-[#123456]', flag ? 'bg-[#666600]' : 'bg-[#410000]']"
        >Hello</view
      >
      <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view>
      <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </view>
      <view class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300"> Default </view>
    </view>
  </view>
</template>


<script setup lang="ts">
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace';
import { ref, onBeforeUnmount } from 'vue';
const title = ref('测试标题');
const flag = ref(true);

const cardsColor = ref([
  replaceJs('bg-[#4268EA] shadow-indigo-100'),
  replaceJs('bg-[#123456] shadow-blue-100'),
  'bg-green-500 shadow-green-100',
  'bg-cyan-500 shadow-cyan-100',
  'bg-amber-500 shadow-amber-100',
]);
const disabled = ref(true);

const go2SubDemo = () => {
  uni.navigateTo({
    url: '/subs/demo/pages/index',
  });
};
const themeRef = ref(uni.getSystemInfoSync().theme);

uni.onThemeChange(({ theme }: { theme: 'dark' | 'light' }) => {
  themeRef.value = theme;
});

onBeforeUnmount(() => {
  uni.offThemeChange(() => {});
});
</script>

<style lang="scss">
page {
  --primary-color-hex: #4268ea;
  --primary-color-bg: yellow;
}
page::before {
  content: '';
  @apply w-10 h-5 bg-green-500 inline-block;
}
</style>

<style lang="scss" scoped>
.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}

.content::before {
  content: '';
  @apply w-5 h-5 bg-red-500/50 inline-block;
}
</style>
