<template>
  <view class="min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800">
    <view class="rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">
        Uni App Vue3 · HBuilderX
      </view>
      <view class="mt-[16rpx] text-[52rpx] font-semibold leading-[1.12] text-slate-900">
        HBuilderX 里的多端原子样式实验室
      </view>
      <view class="mt-[20rpx] text-[28rpx] leading-relaxed text-slate-500">
        保留主题监听、hover-class、group 状态、@apply 和条件编译，页面风格对齐 Vite Vue3 模板。
      </view>
    </view>

    <view class="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">运行时状态</view>
      <view class="mt-[20rpx] rounded-[24rpx] border border-dashed border-slate-200 bg-slate-50/80 px-[24rpx] py-[20rpx] text-[28rpx] text-slate-600">
        当前系统主题：{{ themeRef }}
      </view>
      <view class="mx-auto mt-[24rpx] flex h-[240rpx] w-[240rpx] items-center justify-center rounded-[28rpx] bg-slate-100 group"
        hover-class="bg-gray-400 tapped">
        <view
          class="flex h-[120rpx] w-[120rpx] items-center justify-center rounded-[20rpx] bg-red-400 text-center text-xs text-white group-[.tapped]:bg-blue-400">
          hover 后变蓝
        </view>
      </view>
    </view>

    <view class="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">宏与条件编译</view>
      <view class="mt-[20rpx] flex flex-wrap gap-[12rpx]">
        <view :key="v" class="h-[40rpx] w-[40rpx] rounded-full shadow-lg" :class="v" v-for="v in cardsColor"></view>
      </view>
      <view class="test mt-[20rpx]">apply 示例</view>
      <view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500 mt-[20rpx] rounded-[18rpx] px-[20rpx] py-[14rpx] text-white">
        样式条件编译
      </view>
      <view class="wx:bg-blue-500 -wx:bg-red-500 mt-[16rpx] rounded-[18rpx] px-[20rpx] py-[14rpx] text-white">
        自定义 wx 前缀条件编译
      </view>
      <view class="apply-class-0 mt-[16rpx]">@apply 条件编译方式 0</view>
      <view class="apply-class-1 mt-[16rpx]">@apply 条件编译方式 1</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

const cardsColor = ref([
  'bg-[#fafa00] shadow-indigo-100',
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
