import { View } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import {
  capabilities,
  highlights,
  quickActions,
  releaseHighlights,
  resources,
  stats,
  tokens,
  workflow,
} from './content'
import { CapabilitySection } from './sections/CapabilitySection'
import { HeroSection } from './sections/HeroSection'
import { HighlightsSection } from './sections/HighlightsSection'
import { ResourcesSection } from './sections/ResourcesSection'
import { StatsSection } from './sections/StatsSection'
import { TokensSection } from './sections/TokensSection'
import { WorkflowSection } from './sections/WorkflowSection'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='min-h-screen bg-slate-950 px-[48rpx] pb-[96rpx] pt-[64rpx] text-slate-100'>
      <HeroSection quickActions={quickActions} />
      <HighlightsSection highlights={highlights} />
      <WorkflowSection steps={workflow} />
      <StatsSection stats={stats} />
      <CapabilitySection capabilities={capabilities} />
      <TokensSection tokens={tokens} releaseHighlights={releaseHighlights} />
      <ResourcesSection resources={resources} />
    </View>
  )
}
