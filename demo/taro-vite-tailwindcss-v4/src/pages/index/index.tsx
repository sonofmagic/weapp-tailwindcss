import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='index bg-[#123456]'>
      <div className='h-[300px] text-[#c31d6b]'>短斤少两快点撒</div>
      <Text className='text-[55rpx] text-[#fff]'>Hello world!</Text>
    </View>
  )
}
