import { View } from "@tarojs/components"
import { useLoad } from "@tarojs/taro"

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View>
      <View className='bg-[#e24826] flex flex-col'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"] text-[66rpx]'>Tests</View>
        <View className='text-[#3d31a4] before:content-["222"]'>Tests</View>
      </View>
      <View className='bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"]'>Hello world!</View>
        <View className='text-[#3d31a4] before:content-["222"]'>Tests</View>
      </View>
    </View>
  )
}
