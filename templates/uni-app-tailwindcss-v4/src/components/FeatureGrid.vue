<template>
  <view :class="gridClass">
    <view
      v-for="feature in features"
      :key="feature.title"
      :class="cardClass"
    >
      <view class="absolute inset-0 opacity-25" :class="feature.accent" />
      <view :class="cardBodyClass">
        <view class="flex items-center justify-between">
          <text class="text-[32rpx] font-semibold text-slate-900">
            {{ feature.title }}
          </text>
          <view :class="tagClass">
            {{ feature.tag }}
          </view>
        </view>
        <text class="text-[26rpx] text-slate-600 leading-[1.6]">
          {{ feature.desc }}
        </text>
        <view :class="footerClass">
          <view :class="meterClass" />
          <text>极速构建 · 零心智负担</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type FeatureCard = {
  title: string
  desc: string
  tag: string
  accent: string
}

const gridClass = 'grid grid-cols-1 gap-[16rpx]'
const cardClass =
  'relative overflow-hidden rounded-[24rpx] bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg'
const cardBodyClass = 'relative p-[24rpx] space-y-[12rpx]'
const tagClass = 'px-[16rpx] py-[8rpx] text-[22rpx] rounded-full border border-slate-200 bg-white/60 text-slate-700'
const footerClass = 'flex items-center gap-[10rpx] text-[24rpx] text-slate-800 font-medium'
const meterClass = 'h-[10rpx] w-[80rpx] rounded-full bg-gradient-to-r from-slate-900/80 to-slate-700/80'

defineProps<{
  features: FeatureCard[]
}>()
</script>
