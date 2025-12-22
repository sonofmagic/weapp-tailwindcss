import { View, Text } from '@tarojs/components'
import type { Highlight } from '../content'

type HighlightsSectionProps = {
  highlights: Highlight[]
}

export function HighlightsSection({ highlights }: HighlightsSectionProps) {
  return (
    <View className='mt-[72rpx] grid grid-cols-1 gap-[32rpx]'>
      {highlights.map((item) => (
        <View
          key={item.title}
          className='rounded-[36rpx] border border-white/10 bg-white/5 p-[48rpx] shadow-xl shadow-black/30 backdrop-blur'
        >
          <Text className='text-[36rpx] font-semibold text-white'>{item.title}</Text>
          <Text className='mt-[16rpx] block text-[30rpx] leading-relaxed text-slate-200'>{item.description}</Text>
          <View className='mt-[20rpx] inline-flex items-center gap-[12rpx] rounded-full bg-emerald-400/10 px-[20rpx] py-[10rpx] text-[24rpx] text-emerald-100 ring-1 ring-emerald-300/40'>
            <View className='h-[12rpx] w-[12rpx] rounded-full bg-emerald-300 shadow-[0_0_0_6rpx_rgba(16,185,129,0.25)]' />
            <Text>跨端原子类一致性</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
