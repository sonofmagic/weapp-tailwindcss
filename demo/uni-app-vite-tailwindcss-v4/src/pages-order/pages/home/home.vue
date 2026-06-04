<template>
  <view class="min-h-screen bg-slate-50 px-4 py-6">
    <view class="rounded-xl bg-white p-5 shadow">
      <text class="text-lg font-semibold text-slate-900">订单分包首页</text>
      <view class="mt-4 flex flex-col gap-3">
        <text class="text-sm text-[#929292]">
          这里演示如何在分包中独立使用 Tailwind CSS。
        </text>
        <button
          class="rounded-xl bg-emerald-500 py-2 text-center text-white shadow-sm active:bg-emerald-600"
          @tap="goUser"
        >
          查看用户信息
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import '../../index.css';

const goUser = () => {
  uni.navigateTo({
    url: '/pages-order/pages/user/user',
  });
};
</script>
