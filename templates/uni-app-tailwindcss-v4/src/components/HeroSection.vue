<template>
  <view :class="containerClass">
    <view :class="emeraldBlobClass" />
    <view :class="cyanBlobClass" />
    <view :class="outlineClass" />

    <view class="relative flex flex-col space-y-[24rpx]">
      <view class="flex flex-wrap items-center gap-[12rpx]">
        <view :class="primaryBadgeClass">
          Tailwind CSS 4 · Uni App
        </view>
        <view :class="secondaryBadgeClass">
          微信小程序 Demo
        </view>
      </view>

      <view class="space-y-[12rpx]">
        <text class="text-[56rpx] font-extrabold leading-[1.1] tracking-tight">
          {{ title }}
        </text>
        <text class="text-[28rpx] text-white/70 leading-[1.5]">
          {{ subtitle }}
        </text>
      </view>

      <view class="flex flex-wrap gap-[12rpx]">
        <view
          v-for="item in highlights"
          :key="item"
          :class="highlightChipClass"
        >
          {{ item }}
        </view>
      </view>

      <view class="flex flex-wrap items-center gap-[16rpx]">
        <IceButton :custom-class="ctaClass">
          即刻上手
        </IceButton>
        <button :class="ghostButtonClass">
          查看设计思路
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import IceButton from '@/components/IceButton.vue'

const containerClass =
  'relative overflow-hidden rounded-[32rpx] bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-[32rpx] shadow-2xl border border-white/10'
const emeraldBlobClass =
  'absolute -left-[120rpx] -top-[120rpx] w-[300rpx] h-[300rpx] bg-emerald-500/20 blur-3xl pointer-events-none'
const cyanBlobClass =
  'absolute right-[-60rpx] top-[-40rpx] w-[260rpx] h-[260rpx] bg-cyan-400/15 blur-3xl pointer-events-none'
const outlineClass = 'absolute inset-0 border border-white/5 rounded-[32rpx] pointer-events-none'
const primaryBadgeClass = 'px-[18rpx] py-[10rpx] rounded-full bg-white/10 border border-white/20 text-[24rpx]'
const secondaryBadgeClass =
  'px-[18rpx] py-[10rpx] rounded-full bg-emerald-400/20 text-emerald-100 text-[24rpx] border border-emerald-300/40'
const highlightChipClass =
  'px-[16rpx] py-[12rpx] rounded-[16rpx] bg-white/5 border border-white/10 text-[24rpx] text-white/80'
const ctaClass =
  'bg-emerald-400 text-slate-900 px-[28rpx] py-[16rpx] rounded-[18rpx] shadow-lg shadow-emerald-500/30 border-emerald-300 text-[28rpx]'
const ghostButtonClass =
  'px-[24rpx] py-[14rpx] rounded-[16rpx] border border-white/30 text-white/80 bg-white/10 text-[26rpx]'

defineProps<{
  title: string
  subtitle: string
  highlights: string[]
}>()
</script>
