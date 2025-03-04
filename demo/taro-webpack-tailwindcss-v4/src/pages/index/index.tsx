import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='bg-[#534312] text-[#fff] text-[100rpx]'>
      <Text>Hello world!</Text>
    </View>
  )
}
