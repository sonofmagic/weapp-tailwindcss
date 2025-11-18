import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='min-h-screen'>
      <View className='bg-[#534312] text-[#fff] text-[100rpx] text-center rounded-t-full h-1/2'>
        <Text>Hello world!</Text>
      </View>
      <View className='text-[#16b6c4] text-[34.32rpx] text-center mt-[124.432rpx]'>欢迎使用 weapp-tailwindcss 模板</View>
    </View>

  )
}
