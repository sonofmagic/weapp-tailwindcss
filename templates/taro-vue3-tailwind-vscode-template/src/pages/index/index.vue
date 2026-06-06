<template>
  <view class="min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800">
    <view class="rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">
        Taro Vue3 · NutUI
      </view>
      <view class="mt-[16rpx] text-[52rpx] font-semibold leading-[1.12] text-slate-900">
        组件库也能保持原子风格
      </view>
      <view class="mt-[20rpx] text-[28rpx] leading-relaxed text-slate-500">
        NutUI 组件负责交互基础，Tailwind 原子类负责页面节奏、色彩层次和小程序端样式输出。
      </view>
    </view>

    <view class="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <view class="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">
        能力速览
      </view>
      <view class="mt-[20rpx] flex flex-col gap-[16rpx]">
        <view class="rounded-[24rpx] border border-sky-200/70 bg-sky-50/80 px-[24rpx] py-[20rpx] text-sky-700">
          <view class="text-[28rpx] font-semibold">自动导入组件</view>
          <view class="mt-[8rpx] text-[24rpx] opacity-80">NutUI resolver 与 Taro 构建链路保持一致。</view>
        </view>
        <view class="rounded-[24rpx] border border-violet-200/70 bg-violet-50/80 px-[24rpx] py-[20rpx] text-violet-700">
          <view class="text-[28rpx] font-semibold">Tailwind 页面骨架</view>
          <view class="mt-[8rpx] text-[24rpx] opacity-80">卡片、间距、阴影和文字层级统一维护。</view>
        </view>
        <view class="rounded-[24rpx] border border-emerald-200/70 bg-emerald-50/80 px-[24rpx] py-[20rpx] text-emerald-700">
          <view class="text-[28rpx] font-semibold">端侧反馈</view>
          <view class="mt-[8rpx] text-[24rpx] opacity-80">点击按钮弹出 toast，验证组件运行正常。</view>
        </view>
      </view>
      <view class="mt-[24rpx]">
        <nut-button type="primary" @click="onClick">打开反馈</nut-button>
      </view>
      <nut-toast v-model:visible="show" msg="Tailwind + NutUI 运行正常" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const onClick = () => {
  show.value = true
}
</script>
