import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { twJoin, twMerge } from '@weapp-tailwindcss/merge'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  const stateClass = twMerge('bg-[#123456] text-[#c31d6b]', 'text-white rounded-xl p-4')
  const actionClass = twJoin('border-[10rpx] !border-brand', 'active:bg-emerald-600')

  return (
    <View className='index space-y-4 p-[32rpx]'>
      <View className={`h-[300px] rotate-[10deg] ${stateClass}`}>动态模板字符串 + twMerge</View>
      <Text className='text-[55rpx] text-[#fff] bg-brand'>@theme token</Text>
      <View className='h-14 bg-gradient-to-r from-cyan-500 to-blue-500'></View>
      <View className='h-14 bg-linear-to-r from-cyan-500 to-blue-500'></View>
      <View
        className={`dark:bg-zinc-800 bg-gray-100 text-[32rpx] ${actionClass}`}
        hoverClass='bg-red-500 dark:bg-green-500'
      >
        hoverClass + dark + important + arbitrary value
      </View>
    </View>
  )
}
