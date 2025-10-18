<template>
  <view class="content">
    <view
      class="bg-[url(https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg)] bg-[length:100%_100%] bg-no-repeat w-screen h-[41.54vw]">
    </view>

    <view class="after:content-['uni-app-vite-vue3-tailwind-hbuilderx-template'] text-sky-400"></view>

    <view class="text-slate-800">
      <view class="text-primary">⚠️注意，请关闭微信开发者工具的代码热重载功能</view>
      <view class="text-second">否则可能会出现保持之后不起作用</view>
    </view>

    <view class="text-gray-900/50 mb-2 before:content-['当前系统主题:']">
      {{ themeRef }}
    </view>
    <view class="mx-auto w-[240rpx] h-[240rpx] bg-gray-200 group flex justify-center items-center"
      hover-class="bg-gray-400 tapped">
      <view
        class="w-[120rpx] h-[120rpx] bg-red-400 group-[.tapped]:bg-blue-400 text-white flex justify-center items-center text-xs text-center">
        外部触发hover里面方块会变成蓝色</view>
    </view>
    <view class="test">apply示例</view>
    <view :key="v" class="h-[20px] w-[20px]" :class="v" v-for="(v, i) in cardsColor"></view>
    <view>
      <view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">
        样式的条件编译:微信小程序为蓝色，不是微信小程序为红色
      </view>

      <view class="wx:bg-blue-500 -wx:bg-red-500">
        <view>自定义配置的方式进行样式条件编译</view>
        <view>相关配置见根目录下的tailwind.config.js</view>
      </view>

      <view class="apply-class-0">@apply 条件编译方式0</view>
      <view class="apply-class-1">@apply 条件编译方式1</view>
    </view>
  </view>
</template>


<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
const title = ref('测试标题');
const flag = ref(true);

const cardsColor = ref([
  'bg-[#4268EA] shadow-indigo-100',
  'bg-[#123456] shadow-blue-100',
  'bg-green-500 shadow-green-100',
  'bg-cyan-500 shadow-cyan-100',
  'bg-amber-500 shadow-amber-100',
]);

const sysInfo = uni.getSystemInfoSync()
console.log(sysInfo)
const themeRef = ref(sysInfo.theme ?? 'light');
// #ifdef MP
uni.onThemeChange(({ theme }: { theme: 'dark' | 'light' }) => {
  themeRef.value = theme;
});
// #endif
onBeforeUnmount(() => {
  // #ifdef MP
  uni.offThemeChange(() => { });
  // #endif
});
</script>

<style lang="scss" scoped>
.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}

// 注意: hbuilderx 格式化，可能会强行在这里加上空格，导致编译失败
.apply-class-0 {
  @apply ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500;
}

.apply-class-1 {
  // 这个需要在 tailwind.config.js 里进行自定义配置
  @apply wx:bg-blue-500 -wx:bg-red-500;
}
</style>