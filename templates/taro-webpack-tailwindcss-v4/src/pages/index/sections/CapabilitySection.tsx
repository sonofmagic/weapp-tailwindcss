import { View, Text } from '@tarojs/components'
import type { Capability } from '../content'

type CapabilitySectionProps = {
  capabilities: Capability[]
}

export function CapabilitySection({ capabilities }: CapabilitySectionProps) {
  return (
    <View className='mt-[80rpx] space-y-[28rpx]'>
      {capabilities.map((capability) => (
        <View
          key={capability.title}
          className='rounded-[36rpx] border border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 p-[40rpx] shadow-[0_30rpx_70rpx_rgba(15,118,110,0.25)]'
        >
          <View className='flex flex-wrap items-center gap-[12rpx]'>
            <Text className='text-[34rpx] font-semibold text-white'>{capability.title}</Text>
            <View className='flex flex-wrap gap-[8rpx]'>
              {capability.badges.map((badge) => (
                <View
                  key={badge}
                  className='rounded-full bg-white/10 px-[16rpx] py-[8rpx] text-[22rpx] text-emerald-100 ring-1 ring-white/10'
                >
                  <Text>{badge}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='mt-[20rpx] space-y-[16rpx]'>
            {capability.points.map((point) => (
              <View
                key={point}
                className='flex items-start gap-[12rpx] rounded-[20rpx] bg-white/5 px-[16rpx] py-[12rpx] text-[28rpx] leading-relaxed text-slate-100 ring-1 ring-white/5'
              >
                <View className='mt-[10rpx] h-[12rpx] w-[12rpx] rounded-full bg-emerald-300 shadow-[0_0_0_6rpx_rgba(16,185,129,0.2)]' />
                <Text className='flex-1'>{point}</Text>
              </View>
            ))}
          </View>

          <Text className='mt-[20rpx] block text-[26rpx] text-emerald-100'>{capability.footer}</Text>
        </View>
      ))}
    </View>
  )
}
