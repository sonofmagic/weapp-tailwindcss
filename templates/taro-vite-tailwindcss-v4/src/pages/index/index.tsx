import { Text, View } from '@tarojs/components'
import './index.css'

const features = [
  ['Tailwind 4 Ready', '保留 v4 渐变、任意值和 token 写法。', 'border-sky-200/70 bg-sky-50/80 text-sky-700'],
  ['Taro Vite', 'Vite 构建链路更轻，H5 与小程序统一维护。', 'border-violet-200/70 bg-violet-50/80 text-violet-700'],
  ['Weapp 输出', 'weapp-tailwindcss 接管 wxss 转换。', 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700'],
]

export default function Index() {
  return (
    <View className='min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800'>
      <View className='rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'>
        <Text className='text-[24rpx] uppercase tracking-[6rpx] text-slate-400'>Taro Vite · Tailwind CSS 4</Text>
        <Text className='mt-[16rpx] block text-[52rpx] font-semibold leading-[1.12] text-slate-900'>
          更轻的多端样式工作台
        </Text>
        <Text className='mt-[20rpx] block text-[28rpx] leading-relaxed text-slate-500'>
          使用 Taro + Vite 组织多端页面，用 Tailwind v4 原子类完成布局、渐变、状态与小程序 wxss 输出。
        </Text>
      </View>

      <View className='mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]'>
        <Text className='text-[24rpx] uppercase tracking-[6rpx] text-slate-400'>能力速览</Text>
        <View className='mt-[20rpx] flex flex-col gap-[16rpx]'>
          {features.map(([title, detail, tone]) => (
            <View key={title} className={`rounded-[24rpx] border px-[24rpx] py-[20rpx] ${tone}`}>
              <Text className='text-[28rpx] font-semibold'>{title}</Text>
              <Text className='mt-[8rpx] block text-[24rpx] opacity-80'>{detail}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]'>
        <Text className='text-[24rpx] uppercase tracking-[6rpx] text-slate-400'>Gradient Lab</Text>
        <View className='mt-[20rpx] overflow-hidden rounded-[28rpx]'>
          <View className='h-[72rpx] bg-linear-to-r from-cyan-500 to-blue-500'></View>
          <View className='h-[72rpx] bg-linear-to-r from-sky-500 to-indigo-500'></View>
          <View className='h-[72rpx] bg-linear-to-r from-violet-500 to-fuchsia-500'></View>
          <View className='h-[72rpx] bg-linear-65 from-purple-500 to-pink-500'></View>
        </View>
      </View>
    </View>
  )
}
