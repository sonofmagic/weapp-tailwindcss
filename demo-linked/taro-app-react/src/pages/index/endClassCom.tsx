import { useCallback, useState } from 'react'
import { View } from '@tarojs/components'

export default ({ emptyImageClass, btnClassName }: { emptyImageClass?: string; btnClassName?: string }) => {
  return (
    <>
      <View className='bg-[#654321] w-[100px] h-[20px]'>123</View>
      <View className={emptyImageClass}>emptyImageClass</View>
      <View className={btnClassName}>btnClassName</View>
    </>
  )
}
