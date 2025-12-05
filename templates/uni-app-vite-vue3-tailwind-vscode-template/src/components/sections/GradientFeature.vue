<script setup lang="ts">
const gradientShowcase = [
  {
    name: '极光之窗',
    desc: 'bg-[radial-gradient(circle_at_top,#22d3ee,#0f172a)]',
    classes: 'bg-[radial-gradient(circle_at_top,#22d3ee,#0f172a)] text-white',
  },
  {
    name: '玻璃注脚',
    desc: 'bg-white/70 backdrop-blur-xl border border-white/40',
    classes: 'bg-white/70 border border-white/40 text-slate-700 backdrop-blur-xl',
  },
  {
    name: '霓虹波纹',
    desc: 'bg-[conic-gradient(at_top,#0ea5e9,#6366f1,#a855f7)]',
    classes: 'bg-[conic-gradient(at_top,#0ea5e9,#6366f1,#a855f7)] text-white',
  },
]

const featureCards = [
  {
    icon: 'i-mdi-view-grid-outline',
    title: '栅格 + 弹性',
    desc: 'flex、grid、aspect-ratio 等原子类直接可用，快速搭组件。',
    chip: 'Layout',
    accent: 'text-sky-500',
    backdrop: 'from-sky-500/15 to-cyan-500/15',
  },
  {
    icon: 'i-mdi-brightness-auto',
    title: '主题同步',
    desc: 'uni.onThemeChange + tailwind，深浅模式自动切换。',
    chip: 'Theme',
    accent: 'text-indigo-500',
    backdrop: 'from-indigo-500/15 to-purple-500/15',
  },
  {
    icon: 'i-mdi-all-inclusive',
    title: '任意值语法',
    desc: 'bg-[url(...)], rounded-[20rpx], after:content-[] 统统搞定。',
    chip: '[]',
    accent: 'text-rose-500',
    backdrop: 'from-rose-500/15 to-orange-500/15',
  },
  {
    icon: 'i-mdi-rocket-launch-outline',
    title: 'Icon + Animate',
    desc: 'iconify + animate + ring，覆盖状态、加载、空态。',
    chip: 'Icon',
    accent: 'text-emerald-500',
    backdrop: 'from-emerald-500/15 to-teal-500/15',
  },
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
      渐变 & 玻璃
    </view>
    <view class="text-2xl font-semibold text-slate-900">
      自由的视觉语言
    </view>
    <view
      class="
        mt-4 flex flex-col gap-4
        md:grid md:grid-cols-3
      "
    >
      <view
        v-for="item in gradientShowcase"
        :key="item.name"
        class="rounded-[28rpx] p-4 shadow-lg"
        :class="item.classes"
      >
        <view class="text-xl font-semibold">
          {{ item.name }}
        </view>
        <view class="text-xs opacity-80">
          {{ item.desc }}
        </view>
      </view>
    </view>

    <view class="mt-5 text-sm text-slate-500">
      feature cards
    </view>
    <view
      class="
        mt-3 flex flex-col gap-4
        md:grid md:grid-cols-2
      "
    >
      <view
        v-for="feature in featureCards"
        :key="feature.title"
        class="
          rounded-[28rpx] border border-slate-100/80 bg-gradient-to-br p-4
          shadow-lg
        "
        :class="feature.backdrop"
      >
        <view class="flex items-center gap-3">
          <text class="text-[36px]" :class="[feature.icon, feature.accent]" />
          <view class="text-lg font-semibold text-slate-800">
            {{ feature.title }}
          </view>
        </view>
        <view class="mt-1 text-xs text-slate-500">
          {{ feature.desc }}
        </view>
        <view
          class="
            mt-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs
            font-semibold text-slate-600
          "
        >
          {{ feature.chip }}
        </view>
      </view>
    </view>
  </view>
</template>
