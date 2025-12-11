<template>
  <view :class="containerClass">
    <view class="flex items-center justify-between">
      <text class="text-[30rpx] font-semibold text-slate-900">开发流程</text>
      <view :class="badgeClass">
        极速交付
      </view>
    </view>
    <view class="space-y-[22rpx]">
      <view v-for="(step, index) in steps" :key="step.title" class="flex items-start space-x-[16rpx]">
        <view class="flex flex-col items-center">
          <view :class="indexBadgeClass">
            {{ index + 1 }}
          </view>
          <view
            v-if="index !== steps.length - 1"
            :class="connectorClass"
            style="height: 80rpx"
          />
        </view>
        <view :class="cardClass">
          <text class="text-[28rpx] font-semibold text-slate-900">{{ step.title }}</text>
          <view class="mt-[8rpx] text-[24rpx] text-slate-600 leading-[1.5]">
            {{ step.desc }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type FlowStep = {
  title: string
  desc: string
}

const containerClass = 'rounded-[28rpx] bg-white border border-slate-200 shadow-lg p-[24rpx] space-y-[20rpx]'
const badgeClass = 'px-[16rpx] py-[8rpx] rounded-full bg-slate-900 text-white text-[22rpx]'
const indexBadgeClass =
  'w-[36rpx] h-[36rpx] rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-900 font-semibold flex items-center justify-center'
const connectorClass = 'flex-1 w-[6rpx] bg-gradient-to-b from-emerald-300/60 to-slate-200 rounded-full'
const cardClass = 'flex-1 bg-slate-50 border border-slate-200 rounded-[20rpx] p-[16rpx]'

defineProps<{
  steps: FlowStep[]
}>()
</script>
