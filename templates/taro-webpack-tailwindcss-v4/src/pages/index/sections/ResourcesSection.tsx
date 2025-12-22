import { View, Text } from '@tarojs/components'
import type { Resource } from '../content'

type ResourcesSectionProps = {
  resources: Resource[]
}

export function ResourcesSection({ resources }: ResourcesSectionProps) {
  return (
    <View className='mt-[84rpx] space-y-[28rpx]'>
      {resources.map((resource) => (
        <View
          key={resource.title}
          className='rounded-[36rpx] border border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-[40rpx]'
        >
          <Text className='text-[34rpx] font-semibold text-white'>{resource.title}</Text>
          <Text className='mt-[12rpx] block text-[28rpx] leading-relaxed text-slate-200'>{resource.body}</Text>
          <View className='mt-[14rpx] inline-flex items-center gap-[10rpx] rounded-full bg-white/10 px-[18rpx] py-[10rpx] text-[24rpx] text-emerald-100 ring-1 ring-white/10'>
            <View className='h-[10rpx] w-[10rpx] rounded-full bg-emerald-300' />
            <Text>即用即走的模块化资源</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
