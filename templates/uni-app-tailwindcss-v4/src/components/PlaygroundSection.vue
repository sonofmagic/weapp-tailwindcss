<template>
  <view :class="containerClass">
    <view :class="emeraldBlobClass" />
    <view :class="cyanBlobClass" />
    <view class="relative space-y-[16rpx]">
      <view class="flex items-center justify-between">
        <view class="space-y-[6rpx]">
          <view class="text-[30rpx] font-semibold">即刻试写</view>
          <text class="text-[24rpx] text-white/60">实时校验 class 合并与响应式表现</text>
        </view>
        <view class="flex flex-wrap gap-[8rpx] justify-end">
          <view
            v-for="chip in chips"
            :key="chip"
            :class="chipClass"
          >
            {{ chip }}
          </view>
        </view>
      </view>

      <view :class="inputCardClass">
        <view class="text-[24rpx] text-white/70 mb-[8rpx]">输入你的口号</view>
        <IceInput v-model="model" />
        <view class="mt-[8rpx] text-[22rpx] text-emerald-200/80">保持 Tailwind 原子风味</view>
      </view>

      <view :class="previewCardClass">
        <view class="space-y-[6rpx]">
          <view class="text-[22rpx] text-slate-500">实时预览</view>
          <view class="text-[34rpx] font-bold leading-[1.2]">{{ model }}</view>
        </view>
        <view :class="statusPillClass">
          ✅ Ready
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IceInput from '@/components/IceInput.vue'

const containerClass =
  'relative overflow-hidden rounded-[28rpx] bg-slate-950 text-white p-[24rpx] border border-white/10 shadow-2xl'
const emeraldBlobClass =
  'absolute -right-[80rpx] -bottom-[120rpx] w-[260rpx] h-[260rpx] bg-emerald-500/15 blur-3xl pointer-events-none'
const cyanBlobClass =
  'absolute -left-[100rpx] top-[40rpx] w-[240rpx] h-[240rpx] bg-cyan-400/10 blur-3xl pointer-events-none'
const chipClass = 'px-[14rpx] py-[8rpx] rounded-full bg-white/10 border border-white/15 text-[22rpx] text-white/80'
const inputCardClass = 'rounded-[20rpx] bg-white/5 border border-white/10 p-[16rpx]'
const previewCardClass =
  'rounded-[20rpx] bg-white text-slate-900 p-[20rpx] flex items-center justify-between border border-slate-200'
const statusPillClass =
  'px-[16rpx] py-[12rpx] rounded-[14rpx] bg-emerald-100 text-emerald-800 text-[24rpx] font-semibold'

const props = defineProps<{
  modelValue: string
  chips: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>
