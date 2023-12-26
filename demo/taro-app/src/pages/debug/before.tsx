import { View } from '@tarojs/components'

export default function Index() {
  return (
    <View>
      <View className='after:content-["*"] after:ml-0.5 after:text-red-500'>111</View>
      <View className='after:content-[*] after:ml-0.5 after:text-red-500'>111</View>
      <View className="after:content-['*'] after:ml-0.5 after:text-red-500 bg-[#444400]">222</View>
    </View>
  )
}
