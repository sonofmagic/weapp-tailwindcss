<script setup lang="ts">
const showAccent = ref(true)
const accentClass = computed(() => (showAccent.value
  ? [
      'bg-[#aa00aa]',
      'text-[#ffffffee]',
      'border-transparent',
      'shadow-[0_32px_60px_rgba(170,0,170,0.45)]',
    ]
  : []))
const iconList = [
  'i-svg-spinners-12-dots-scale-rotate',
  'i-svg-spinners-180-ring',
  'i-svg-spinners-3-dots-bounce',
  'i-svg-spinners-6-dots-rotate',
  'i-svg-spinners-90-ring',
  'i-svg-spinners-bars-fade',
  'i-svg-spinners-blocks-scale',
  'i-svg-spinners-clock',
  'i-svg-spinners-tadpole',
]
</script>

<template>
  <view
    class="
      rounded-[32rpx] border border-slate-100/70 bg-white/90 p-5
      shadow-[0_20px_45px_rgba(15,23,42,0.08)]
    "
  >
    <view class="text-xs uppercase tracking-[6rpx] text-slate-400">
      Icon + 动画
    </view>
    <view class="text-2xl font-semibold text-slate-900">
      iconify 集合与 Grid 自由组合
    </view>
    <view
      class="
        mt-4 grid grid-cols-3 gap-3 rounded-[28rpx] border border-slate-100
        bg-slate-50/80 p-3 text-center
        sm:grid-cols-4
        md:grid-cols-6
      "
    >
      <view
        v-for="(icon, index) in iconList"
        :key="icon"
        class="
          w-full rounded-2xl border border-white/80 bg-white py-3 text-slate-700
          shadow-[0_20px_40px_rgba(15,23,42,0.1)]
        "
        :class="index % 2 === 0 ? accentClass : undefined"
      >
        <text class="text-[32px]" :class="icon" />
      </view>
    </view>
  </view>
</template>
