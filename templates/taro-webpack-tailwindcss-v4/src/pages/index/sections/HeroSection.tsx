import { View, Text } from '@tarojs/components'

type HeroSectionProps = {
  quickActions: string[]
}

export function HeroSection({ quickActions }: HeroSectionProps) {
  return (
    <View className='rounded-[48rpx] border border-white/10 bg-gradient-to-b from-emerald-400/15 via-teal-400/5 to-slate-900 p-[64rpx] shadow-[0_60rpx_120rpx_rgba(20,184,166,0.25)]'>
      <View className='flex items-center gap-[16rpx]'>
        <View className='rounded-full bg-emerald-400/15 px-[24rpx] py-[12rpx] text-[26rpx] text-emerald-100 ring-1 ring-emerald-300/40'>
          <Text className='font-semibold tracking-[4rpx]'>Tailwind 4 • Multi-end</Text>
        </View>
        <View className='rounded-full bg-white/10 px-[20rpx] py-[10rpx] text-[24rpx] text-white/80'>
          <Text>Design token + CSS 变量一体化</Text>
        </View>
      </View>

      <View className='mt-[32rpx] text-[72rpx] font-semibold leading-tight text-white'>
        <Text>打造跨端体验一致的 Taro 产品主页</Text>
      </View>

      <View className='mt-[24rpx] text-[30rpx] leading-relaxed text-slate-200'>
        <Text>
          通过 tailwindcss@4 的原子化语法，即可在小程序、H5、甚至多端容器中维持一致的布局、间距与交互动效。
          下面的示例展示了几种常用信息模块，帮助你快速搭建首页与营销落地页。
        </Text>
      </View>

      <View className='mt-[36rpx] grid grid-cols-2 gap-[20rpx] rounded-[32rpx] bg-white/5 p-[24rpx] backdrop-blur-md'>
        <View className='rounded-[24rpx] bg-gradient-to-r from-white/10 to-white/5 p-[20rpx]'>
          <Text className='text-[28rpx] font-semibold text-emerald-200'>更轻的 CLI</Text>
          <Text className='mt-[8rpx] block text-[26rpx] text-slate-200'>无配置即可生成样式，JIT 秒级响应。</Text>
        </View>
        <View className='rounded-[24rpx] border border-white/10 bg-slate-950/50 p-[20rpx] shadow-inner shadow-black/30'>
          <Text className='text-[28rpx] font-semibold text-emerald-200'>统一设计 token</Text>
          <Text className='mt-[8rpx] block text-[26rpx] text-slate-200'>颜色、圆角、阴影全部抽象为 CSS 变量。</Text>
        </View>
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
  )
}
