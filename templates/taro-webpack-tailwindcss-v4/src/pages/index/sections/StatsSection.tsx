import { View, Text } from '@tarojs/components'
import type { Stat } from '../content'

type StatsSectionProps = {
  stats: Stat[]
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <View className='mt-[80rpx] grid grid-cols-2 gap-[24rpx]'>
      {stats.map((stat) => (
        <View
          key={stat.value}
          className='rounded-[32rpx] border border-white/5 bg-slate-900/60 p-[32rpx] text-center shadow-inner shadow-black/40 ring-1 ring-white/5'
        >
          <Text className='text-[44rpx] font-semibold text-emerald-200'>{stat.value}</Text>
          <Text className='mt-[8rpx] block text-[26rpx] text-slate-300'>{stat.description}</Text>
        </View>
      ))}
    </View>
  )
}
