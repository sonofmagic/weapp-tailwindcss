import { View, Text } from '@tarojs/components'
import type { Token, ReleaseHighlight } from '../content'

type TokensSectionProps = {
  tokens: Token[]
  releaseHighlights: ReleaseHighlight[]
}

export function TokensSection({ tokens, releaseHighlights }: TokensSectionProps) {
  return (
    <View className='mt-[84rpx] rounded-[36rpx] border border-white/10 bg-slate-900/80 p-[40rpx]'>
      <View className='flex items-center justify-between gap-[12rpx]'>
        <Text className='text-[38rpx] font-semibold text-white'>Tailwind v4 设计 Token 面板</Text>
        <View className='rounded-full bg-emerald-400/15 px-[20rpx] py-[10rpx] text-[24rpx] text-emerald-100 ring-1 ring-emerald-300/40'>
          <Text>原子类实时预览</Text>
        </View>
      </View>

      <View className='mt-[28rpx] grid grid-cols-1 gap-[20rpx]'>
        {tokens.map((token) => (
          <View
            key={token.title}
            className='rounded-[28rpx] border border-white/10 bg-white/5 p-[28rpx] shadow-inner shadow-black/30'
          >
            <Text className='text-[30rpx] font-semibold text-emerald-200'>{token.title}</Text>
            <Text className='mt-[8rpx] block text-[26rpx] text-slate-100'>{token.detail}</Text>
            <View className='mt-[12rpx] rounded-[20rpx] bg-slate-950/60 px-[20rpx] py-[14rpx] text-[24rpx] text-emerald-100 ring-1 ring-white/5'>
              <Text className='font-mono'>{token.sample}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='mt-[32rpx] rounded-[28rpx] border border-white/10 bg-gradient-to-r from-emerald-500/10 via-teal-400/10 to-cyan-500/10 p-[28rpx] shadow-[0_30rpx_80rpx_rgba(6,182,212,0.2)]'>
        <Text className='text-[32rpx] font-semibold text-white'>Release 瞬间</Text>
        <View className='mt-[16rpx] grid grid-cols-1 gap-[16rpx]'>
          {releaseHighlights.map((release) => (
            <View key={release.version} className='rounded-[20rpx] bg-white/10 p-[20rpx] ring-1 ring-white/10'>
              <Text className='text-[28rpx] font-semibold text-emerald-100'>{release.version}</Text>
              <Text className='mt-[8rpx] block text-[26rpx] text-slate-100'>{release.summary}</Text>
              <View className='mt-[12rpx] space-y-[8rpx]'>
                {release.bullets.map((item) => (
                  <View key={item} className='flex items-start gap-[10rpx] text-[24rpx] text-slate-200'>
                    <View className='mt-[10rpx] h-[8rpx] w-[8rpx] rounded-full bg-emerald-300' />
                    <Text className='flex-1 leading-relaxed'>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
