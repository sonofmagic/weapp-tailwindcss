
import { View } from '@tarojs/components'

export default function Index() {
  return (
    <View>
      <View className='after:content-["*"] after:ml-0.5 after:text-red-500'></View>
      <View className='after:content-[*] after:ml-0.5 after:text-red-500'></View>
    </View>
  )
}
