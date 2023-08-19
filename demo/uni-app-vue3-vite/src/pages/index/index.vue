<template>
  <view class="content">
    <Issue228 class="mt-[96.3px] w-[61.1px] h-[50.99px]"
      src="https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg"></Issue228>
    <view>{{ wildContent }}</view>
    <n-image class="mt-[26.2px] w-[43.1px] h-[42.99px]"></n-image>
    <NHostImage class="mt-[96.3px] w-[61.1px] h-[50.99px]"></NHostImage>
    <view class="2xl:text-base">2xl:text-base</view>
    <view :class="numClassObj">2xl:text-[red]</view>
    <view class="space-y-4 flex flex-col bg-red-400">
      <view class="bg-sky-500">view space-y-4</view>
      <view class="bg-sky-500">view space-y-4</view>
      <input class="bg-sky-500" value="input space-y-4" />
      <text class="bg-sky-500">text space-y-4</text>
      <button class="bg-sky-500">button space-y-4</button>
      <CommonCom class="bg-sky-500">CommonCom space-y-4</CommonCom>
      <view class="bg-sky-500">view space-y-4</view>
      <text class="bg-sky-500">text space-y-4</text>
      <VirtualHostCom class="bg-sky-500">VirtualHostCom space-y-4</VirtualHostCom>
      <view class="bg-sky-500">view space-y-4</view>
      <text class="bg-sky-500">text space-y-4</text>
    </view>
    <view v-if="flag" :class="[flag ? 'bg-[#3482f2]' : 'bg-[#e6e6e6]']">bgbgbgbg</view>
    <view v-else :class="[flag ? 'bg-[#434354]' : 'bg-[#e6e6e6]']">bgbgbgbg</view>
    <view :class="classArray">classArray</view>
    <view :class="['text-sm', classObj]">:class="['text-sm', classObj]</view>
    <view class="rotate-[10deg]">rotate1111111</view>
    <view :key="g.type" :class="['td', { 'highlight': g.type === '你好' }]" v-for="g in goods">{{ g.type }}</view>
    <view class="text-[32rpx] border-[10rpx]">rpx</view>
    <view class="text-[32px] border-[10px]">px</view>
    <button @click="toggleBarVisible(true)">显示Tabbar</button>
    <button @click="toggleBarVisible(false)">隐藏Tabbar</button>
    <view class="!text-primary !border-primary text-[32px]">1111</view>
    <view class="border-b-[4rpx] border-t-[4px] border w-screen h-3 border-[red]"></view>
    <view class="[&_.u-count-down\_\_text]:!text-red-400">
      <view></view>
      <view></view>
      <view></view>
      <view></view>
      <view>
        <view class="u-count-down__text">u-count-down__text</view>
      </view>
    </view>
    <u-button type="primary">主要按钮</u-button>
    <!-- <u-input /> -->
    <view class="after:border-none">当前系统主题:{{ themeRef }}</view>
    <view class="bg-gray-100 dark:bg-zinc-800 h-10 w-10" hover-class="bg-red-500 dark:bg-green-500"></view>
    <view class="h-5 w-5 shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)] before:content-['Festivus']"></view>
    <view class="h-5 w-5 shadow-[0px_2px_11px_0px_#00000a]"></view>
    <view class="text-[22px] dark:text-yellow-400">text-[22px]</view>
    <view class="text-[#bada55]">text-[#bada55]</view>
    <!-- <view class="text-[var(--my-var)]">text-[var(--my-var)]</view> -->
    <div class="text-[length:var(--my-var-length)]">text-[length:var(--my-var-length)]</div>
    <div class="text-[color:var(--my-var)]">text-[color:var(--my-var)]</div>
    <button class="!bg-green-500 !sr-onlytext-white" :class="{
      'opacity-50': disabled,
    }" :disabled="disabled">
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
    <image class="logo h-10 w-10" src="/static/logo.png" @click="go2SubDemo" />
    <view class="text-area">
      <text class="title h-[200%]">{{ title }}</text>
    </view>
    <view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</view>
    <view class="space-y-[1.6rem]">
      <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
      <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px]
        leading-[0.9]</view>
      <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
      <view
        class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]"
        :class="['text-[#123456]', flag ? 'bg-[#666600]' : 'bg-[#410000]']">Hello</view>
      <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765]
        border-solid border-opacity-[0.44]</view>
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
import Issue228 from '@/components/Issue228.vue';
import CommonCom from '@/components/CommonCom.vue'
import VirtualHostCom from '@/components/VirtualHostCom.vue'
import NImage from '@/components/NImage.vue';
import NHostImage from '@/components/NHostImage.vue';
import { ref, onBeforeUnmount } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
const title = ref('测试标题');
const flag = ref(true);
const goods = ref([
  {
    type: '你好'
  },
  {
    type: '1'
  },
  {
    type: '2'
  },

])

const cardsColor = ref([
  'bg-[#4268EA] shadow-indigo-100',
  'bg-[#123456] shadow-blue-100',
  'bg-green-500 shadow-green-100',
  'bg-cyan-500 shadow-cyan-100',
  'bg-amber-500 shadow-amber-100',
]);

const numClassObj = ref({
  '2xl:text-[red]': true
})
const disabled = ref(true);

const go2SubDemo = () => {
  uni.navigateTo({
    url: '/subs/demo/pages/index',
  });
};
const themeRef = ref(uni.getSystemInfoSync().theme);
// #ifdef MP
uni.onThemeChange(({ theme }: { theme: 'dark' | 'light' }) => {
  themeRef.value = theme;
});
// #endif
onBeforeUnmount(() => {
  uni.offThemeChange(() => { });
});
onLoad(() => {
  console.log('on page loaded!')
})

function toggleBarVisible(visible: boolean) {
  const app = getApp()
  app.globalData!.tabbarVisible = visible
  console.log(app.globalData)
}
const classObj = {
  'text-[#fafafa]': true
}
const classArray = [
  'text-[30rpx]',
  classObj,
  true ? 'font-bold' : '',
  "bg-[url('https://xxx.com/xx.webp')]"
]

const wildContent = ref('*******')
</script>

<style lang="scss">
// css不合法
// .22222 {
//   color: blue;
// }

// .\32 {
//   color: blue;
// }

page {
  --primary-color-hex: #4268ea;
  --primary-color-bg: yellow;
  --my-var: green;
  --my-var-length: 24px;
}

page::before {
  content: '';
  @apply w-10 h-5 bg-green-500 inline-block;
}
</style>

<style lang="scss">
.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}

.content::before {
  content: '';
  @apply w-5 h-5 bg-red-500/50 inline-block;
}
</style>
