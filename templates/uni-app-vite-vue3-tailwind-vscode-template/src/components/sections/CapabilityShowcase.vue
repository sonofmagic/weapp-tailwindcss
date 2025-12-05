<script setup lang="ts">
const timelineShots = [
  {
    icon: 'i-mdi-speedometer',
    title: '极速原子',
    detail: 'tailwind 原子能力 1:1 传递到小程序。',
    tone: 'border-sky-200/70 bg-sky-50/80 text-sky-700',
  },
  {
    icon: 'i-mdi-earth',
    title: '多端统一',
    detail: 'wx / -wx / ifdef 自动拆分不同宿主。',
    tone: 'border-violet-200/70 bg-violet-50/80 text-violet-700',
  },
  {
    icon: 'i-mdi-toolbox-outline',
    title: '工程提效',
    detail: 'Pinia、iconify、@layer 定制组件。',
    tone: 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700',
  },
]
</script>

<template>
  <view
    class="
      rounded-[32rpx] border border-slate-100/70 bg-white/80 p-5
      shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl
    "
  >
    <view class="text-xs uppercase tracking-[6rpx] text-slate-400">
      能力速览
    </view>
    <view class="text-2xl font-semibold text-slate-800">
      一份模板，串联更多设计场景
    </view>
    <view
      class="
        mt-4 flex flex-col gap-4
        md:grid md:grid-cols-3
      "
    >
      <view
        v-for="shot in timelineShots"
        :key="shot.title"
        class="rounded-[24rpx] border px-4 py-3 text-sm leading-relaxed"
        :class="shot.tone"
      >
        <view class="flex items-center gap-2 font-semibold">
          <text class="text-[30px]" :class="[shot.icon]" />
          <view>{{ shot.title }}</view>
        </view>
        <view class="mt-2 text-[26rpx] opacity-80">
          {{ shot.detail }}
        </view>
      </view>
    </view>
  </view>
</template>
