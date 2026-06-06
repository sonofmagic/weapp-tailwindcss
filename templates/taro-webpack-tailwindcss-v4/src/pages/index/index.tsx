import { View } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

const cards = [
  ['Tailwind CSS 4', 'v4 token、任意值和渐变写法保持可读。', 'border-sky-200/70 bg-sky-50/80 text-sky-700'],
  ['Taro Webpack', '传统 webpack 工程也能获得现代原子样式体验。', 'border-violet-200/70 bg-violet-50/80 text-violet-700'],
  ['多端输出', 'weapp/H5 等端共用一套清晰的页面结构。', 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700'],
]
const commands = ['pnpm dev:weapp', 'pnpm build:weapp', 'pnpm build:h5']

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800'>
      <View className='rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'>
        <View className='text-[24rpx] uppercase tracking-[6rpx] text-slate-400'>Taro Webpack · Tailwind CSS 4</View>
        <View className='mt-[16rpx] text-[52rpx] font-semibold leading-[1.12] text-slate-900'>
          经典工程里的现代页面骨架
        </View>
        <View className='mt-[20rpx] text-[28rpx] leading-relaxed text-slate-500'>
          用更接近参考模板的浅色卡片系统展示 Taro Webpack 能力，保留小程序端和 H5 构建的共同样式入口。
        </View>
        <View className='mt-[28rpx] flex flex-wrap gap-[12rpx]'>
          {commands.map(command => (
            <View key={command} className='rounded-full bg-slate-900/5 px-[20rpx] py-[10rpx] text-[24rpx] font-semibold text-slate-600'>
              {command}
            </View>
          ))}
        </View>
      </View>

      <View className='mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]'>
        <View className='text-[24rpx] uppercase tracking-[6rpx] text-slate-400'>能力速览</View>
        <View className='mt-[20rpx] flex flex-col gap-[16rpx]'>
          {cards.map(([title, detail, tone]) => (
            <View key={title} className={`rounded-[24rpx] border px-[24rpx] py-[20rpx] ${tone}`}>
              <View className='text-[28rpx] font-semibold'>{title}</View>
              <View className='mt-[8rpx] text-[24rpx] opacity-80'>{detail}</View>
            </View>
          ))}
        </View>
      </View>

      <View className='mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]'>
        <View className='text-[24rpx] uppercase tracking-[6rpx] text-slate-400'>Token Preview</View>
        <View className='mt-[20rpx] grid grid-cols-2 gap-[16rpx]'>
          <View className='rounded-[24rpx] bg-slate-900 px-[24rpx] py-[22rpx] text-white'>slate surface</View>
          <View className='rounded-[24rpx] bg-emerald-100 px-[24rpx] py-[22rpx] text-emerald-800'>emerald accent</View>
          <View className='rounded-[24rpx] bg-sky-100 px-[24rpx] py-[22rpx] text-sky-800'>sky feedback</View>
          <View className='rounded-[24rpx] bg-violet-100 px-[24rpx] py-[22rpx] text-violet-800'>violet state</View>
        </View>
      </View>
    </View>
  )
}
