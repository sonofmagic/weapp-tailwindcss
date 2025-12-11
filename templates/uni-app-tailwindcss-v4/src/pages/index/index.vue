<template>
  <view class="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#0f172a] to-[#0b1220] text-slate-100 pb-[40rpx]">
    <view class="px-[28rpx] py-[24rpx] space-y-[24rpx]">
      <view class="flex items-center space-x-[12rpx]">
        <image class="w-[96rpx] h-[96rpx] opacity-80" src="/static/logo.png" />
        <view class="text-[26rpx] text-white/70">Tailwind CSS 4 · 微信小程序</view>
      </view>

      <view>
        <HeroSection :title="title" :subtitle="subtitle" :highlights="highlights" />
      </view>

      <view>
        <StatsSection :stats="stats" />
      </view>

      <view>
        <FeatureGrid :features="features" />
      </view>

      <view>
        <WorkflowSection :steps="flowSteps" />
      </view>

      <view>
        <PlaygroundSection v-model="motto" :chips="playgroundChips" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import HeroSection from '@/components/HeroSection.vue'
import PlaygroundSection from '@/components/PlaygroundSection.vue'
import StatsSection from '@/components/StatsSection.vue'
import WorkflowSection from '@/components/WorkflowSection.vue'

const motto = ref('写好原子类，其他交给构建')

const title = '小程序里的原子设计基座'
const subtitle = '使用 Tailwind CSS 4 + weapp-tailwindcss + Uni App，享受极速 HMR、class 合并与小程序兼容的全栈开发体验。'

const highlights = [
  'class-merge 智能去重',
  '一键生成微信小程序',
  '安全区 / 暗色渐变预设',
  '更轻量的原子体系',
]

const stats = [
  { value: '<1s', label: 'HMR 热更新', note: '保持研发节奏的流畅' },
  { value: '100%', label: 'Tailwind 语法', note: '原子化 / 语义化并存' },
  { value: '0 配置', label: '默认好用', note: '开箱即用构建链路' },
  { value: 'mini', label: 'Bundle 体积', note: '按需产出更小包体' },
]

const features = [
  {
    title: '零心智负担',
    desc: '预置 Tailwind v4 pipeline、weapp-tailwindcss merge，直连设计到代码。',
    tag: '极速',
    accent: 'bg-gradient-to-br from-emerald-200 to-cyan-200',
  },
  {
    title: '组件化示例',
    desc: 'Hero / Stats / Timeline / Playground 多块拆分，方便直接复制到业务。',
    tag: '复用',
    accent: 'bg-gradient-to-br from-indigo-200 to-purple-200',
  },
  {
    title: '小程序友好',
    desc: '遵循微信小程序的节点与样式限制，同时保留玻璃态、渐变等视觉亮点。',
    tag: '兼容',
    accent: 'bg-gradient-to-br from-amber-200 to-orange-200',
  },
]

const flowSteps = [
  { title: '设定设计语言', desc: 'Tailwind 原子类定义品牌色、光影与圆角，统一视觉语言。' },
  { title: '拆组件', desc: '将页面拆成 Hero、指标、功能卡片、流程和 Playground，方便复用。' },
  { title: '小程序验证', desc: '预览微信小程序，检查原子类与 WeappTailwindCSS 的兼容性。' },
]

const playgroundChips = ['Class Merge', '原子化预设', 'Weapp TailwindCSS']
</script>
