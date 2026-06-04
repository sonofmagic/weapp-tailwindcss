<template>
  <view class="min-h-screen bg-white px-4 py-6">
    <view class="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <text class="text-lg font-semibold text-slate-900">订单用户信息</text>
      <text class="mt-2 block text-sm leading-6 text-slate-500">
        分包单独引入的 Tailwind 配置可以控制扫描范围与产物大小。
      </text>
      <view class="mt-6 flex gap-3">
        <view class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <text class="text-xl font-bold">U</text>
        </view>
        <view class="flex flex-1 flex-col justify-center gap-1">
          <text class="text-base font-medium text-slate-800">Uni Tailwind</text>
          <text class="text-xs text-slate-500">ID: 20240618</text>
        </view>
      </view>
      <button
        class="mt-8 rounded-xl border border-emerald-500 py-2 text-emerald-600 active:bg-emerald-50"
        @tap="goBack"
      >
        返回上一页
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import '../../index.css';

const goBack = () => {
  uni.navigateBack();
};
</script>
