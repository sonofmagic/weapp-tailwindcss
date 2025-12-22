import { View, Text } from '@tarojs/components'
import type { WorkflowStep } from '../content'

type WorkflowSectionProps = {
  steps: WorkflowStep[]
}

export function WorkflowSection({ steps }: WorkflowSectionProps) {
  return (
    <View className='mt-[80rpx] rounded-[40rpx] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-[48rpx] shadow-[0_50rpx_80rpx_rgba(0,0,0,0.35)]'>
      <Text className='text-[40rpx] font-semibold text-white'>产品迭代路线</Text>
      <Text className='mt-[8rpx] block text-[26rpx] text-slate-300'>
        从初始化到持续交付的完整流程，保持设计与工程协同。
      </Text>
      <View className='mt-[32rpx] space-y-[32rpx]'>
        {steps.map((step) => (
          <View key={step.label} className='rounded-[28rpx] bg-white/5 p-[32rpx] ring-1 ring-white/10'>
            <View className='flex items-center justify-between'>
              <Text className='text-[32rpx] font-semibold text-emerald-200'>{step.label}</Text>
              <View className='rounded-full bg-emerald-400/10 px-[20rpx] py-[10rpx] text-[24rpx] text-emerald-100'>
                <Text>Tailwind v4</Text>
              </View>
            </View>
            <Text className='mt-[12rpx] block font-mono text-[28rpx] text-white'>{step.detail}</Text>
            <Text className='mt-[8rpx] block text-[26rpx] text-slate-300'>{step.tip}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
