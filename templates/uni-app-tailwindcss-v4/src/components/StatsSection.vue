<template>
  <view :class="containerClass">
    <view class="flex items-center justify-between mb-[16rpx]">
      <text class="text-[30rpx] font-semibold">关键指标</text>
      <view :class="badgeClass">
        Tailwind 驱动
      </view>
    </view>
    <view :class="gridClass">
      <view
        v-for="stat in stats"
        :key="stat.label"
        :class="cardClass"
      >
        <text class="text-[44rpx] font-bold leading-none">{{ stat.value }}</text>
        <text class="text-[24rpx] text-white/70">{{ stat.label }}</text>
        <text class="text-[22rpx] text-emerald-200/80">{{ stat.note }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type StatItem = {
  value: string
  label: string
  note: string
}

const containerClass = 'rounded-[28rpx] bg-slate-900 text-white p-[24rpx] border border-white/10 shadow-xl'
const badgeClass = 'px-[16rpx] py-[8rpx] rounded-full bg-white/10 text-[22rpx] border border-white/15'
const gridClass = 'grid grid-cols-2 gap-[12rpx]'
const cardClass = 'rounded-[20rpx] bg-white/5 border border-white/10 p-[20rpx] space-y-[8rpx]'

defineProps<{
  stats: StatItem[]
}>()
</script>
