import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'
import { Button } from '@nutui/nutui-react-taro'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <>
      <View className='bg-[#534312] text-[#fff] text-[100rpx]'>
        <Text>Hello world!</Text>
      </View>
      <View className='bg-purple-800 text-pink-200'>
        11
      </View>
      <View className='h-14 bg-gradient-to-r from-cyan-500 to-blue-500'></View>
      <Button>Share</Button>
    </>

  )
}
