import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View>
      <Text className='text-[#123456] bg-amber-100'>Weapp-tailwindcss 模板</Text>
      <View className='index bg-[#123456]'>
        <Text className='text-[55rpx] text-[#aae90b]'>Hello world!</Text>
      </View>
      <View className='h-14 bg-linear-to-r from-cyan-500 to-blue-500'></View>
      <View className='h-14 bg-linear-to-t from-sky-500 to-indigo-500'></View>
      <View className='h-14 bg-linear-to-bl from-violet-500 to-fuchsia-500'></View>
      <View className='h-14 bg-linear-65 from-purple-500 to-pink-500'></View>
    </View>

  )
}
