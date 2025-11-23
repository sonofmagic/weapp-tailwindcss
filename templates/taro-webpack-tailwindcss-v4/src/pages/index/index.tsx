import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

const highlights = [
  {
    title: 'Tailwind CSS v4 Ready',
    description:
      'tailwindcss@4 的零配置调色、全新语义 token 以及更轻量的构建流程已经全部打包在脚手架中，随时开箱即用。',
  },
  {
    title: '跨端体验一致',
    description:
      'Weapp + H5 + RN 同步使用原子类，和设计稿保持 1:1 的 spacing 与字体系统，提升交付效率。',
  },
  {
    title: '组件驱动思维',
    description:
      '配合 Taro Hooks 与抽象 UI Section，可以快速积累可复用的模板，持续演进产品体验。',
  },
]

const workflow = [
  {
    label: '初始化项目',
    detail: 'pnpm dlx @tarojs/cli init my-app',
    tip: '选择 weapp-tailwindcss 模板即可获得 v4 支持',
  },
  {
    label: '编码与调试',
    detail: 'pnpm dev:weapp | pnpm dev:h5',
    tip: 'JIT 实时刷新风格，调试体验接近 Web',
  },
  {
    label: '持续交付',
    detail: 'pnpm build && pnpm test',
    tip: '结合 CI 可自动生成按需产物与依赖上报',
  },
]

const stats = [
  { value: '240ms', description: '平均样式生成耗时' },
  { value: '120+', description: '预置语义颜色 token' },
  { value: '98%', description: '跨端视觉一致性' },
  { value: '0 config', description: 'Tailwind 默认配置项' },
]

const quickActions = ['pnpm dev', 'pnpm build', 'pnpm preview']

const resources = [
  {
    title: '入门指南',
    body: '从环境搭建、Tailwind 设计体系到部署上线，一篇文档搞定。',
  },
  {
    title: '组件示例',
    body: '常见卡片、布局、图表全部由原子类驱动，可直接复制粘贴。',
  },
]

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='min-h-screen bg-slate-950 px-[48rpx] pb-[96rpx] pt-[64rpx] text-slate-100'>
      <View className='rounded-[48rpx] border border-white/10 bg-gradient-to-b from-emerald-400/15 via-teal-400/5 to-slate-900 p-[64rpx] shadow-[0_60rpx_120rpx_rgba(20,184,166,0.25)]'>
        <Text className='text-[28rpx] tracking-[6rpx] text-emerald-200'>Tailwind CSS v4 模板</Text>
        <View className='mt-[32rpx] text-[72rpx] font-semibold leading-tight text-white'>
          <Text>打造跨端体验一致的 Taro 产品主页</Text>
        </View>
        <View className='mt-[24rpx] text-[30rpx] text-slate-200 leading-relaxed'>
          <Text>
            通过 tailwindcss@4 的原子化语法，即可在小程序、H5、甚至多端容器中维持一致的布局、间距与交互动效。
            下面的示例展示了几种常用信息模块，帮助你快速搭建首页。
          </Text>
        </View>
        <View className='mt-[48rpx] flex flex-wrap gap-[24rpx]'>
          {quickActions.map((action) => (
            <View
              key={action}
              className='rounded-full border border-emerald-300/60 bg-emerald-400/10 px-[48rpx] py-[18rpx] text-[28rpx] font-medium text-emerald-100'
            >
              <Text className='font-mono tracking-[4rpx]'>{action}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='mt-[72rpx] grid grid-cols-1 gap-[32rpx]'>
        {highlights.map((item) => (
          <View
            key={item.title}
            className='rounded-[36rpx] border border-white/10 bg-white/5 p-[48rpx] shadow-xl shadow-black/30'
          >
            <Text className='text-[36rpx] font-semibold text-white'>{item.title}</Text>
            <Text className='mt-[16rpx] block text-[30rpx] leading-relaxed text-slate-200'>{item.description}</Text>
          </View>
        ))}
      </View>

      <View className='mt-[80rpx] rounded-[40rpx] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-[48rpx]'>
        <Text className='text-[40rpx] font-semibold text-white'>产品迭代路线</Text>
        <View className='mt-[32rpx] space-y-[32rpx]'>
          {workflow.map((step) => (
            <View key={step.label} className='rounded-[28rpx] bg-white/5 p-[32rpx]'>
              <Text className='text-[32rpx] font-semibold text-emerald-200'>{step.label}</Text>
              <Text className='mt-[12rpx] block font-mono text-[28rpx] text-white'>{step.detail}</Text>
              <Text className='mt-[8rpx] block text-[26rpx] text-slate-300'>{step.tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='mt-[80rpx] grid grid-cols-2 gap-[24rpx]'>
        {stats.map((stat) => (
          <View
            key={stat.value}
            className='rounded-[32rpx] border border-white/5 bg-slate-900/60 p-[32rpx] text-center shadow-inner shadow-black/40'
          >
            <Text className='text-[44rpx] font-semibold text-emerald-200'>{stat.value}</Text>
            <Text className='mt-[8rpx] block text-[26rpx] text-slate-300'>{stat.description}</Text>
          </View>
        ))}
      </View>

      <View className='mt-[84rpx] space-y-[28rpx]'>
        {resources.map((resource) => (
          <View
            key={resource.title}
            className='rounded-[36rpx] border border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-[40rpx]'
          >
            <Text className='text-[34rpx] font-semibold text-white'>{resource.title}</Text>
            <Text className='mt-[12rpx] block text-[28rpx] leading-relaxed text-slate-200'>{resource.body}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
