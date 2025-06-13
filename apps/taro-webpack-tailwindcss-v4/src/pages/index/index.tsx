import { Text, View } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.css'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <>
      <View className="bg-[#2e2bcc] text-[100rpx] text-white">
        <Text>Hello world!</Text>
      </View>
      <View className="bg-purple-800 text-pink-200">
        11
      </View>
      <View className="h-14 bg-gradient-to-r from-cyan-500 to-blue-500"></View>
      <View className="bg-purple-800 text-pink-200 invert">
        invert
      </View>
      <View className="bg-purple-800 text-pink-200 backdrop-blur-2xl">
        backdrop-blur-2xl
      </View>
      <View className="skew-x-0 bg-purple-800 text-pink-200">
        skew-x-0
      </View>
    </>

  )
}
