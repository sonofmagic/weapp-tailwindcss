import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='index'>
      <div className='h-[300px] text-[#c31d6b] bg-[#123456]'>短斤少两快点撒</div>
      <Text className='text-[55rpx] text-[#fff] bg-purple-300'>Hello world!</Text>
      <View className='h-14 bg-gradient-to-r from-cyan-500 to-blue-500'></View>
    </View>
  )
}
