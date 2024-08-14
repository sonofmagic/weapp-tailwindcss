import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='bg-[#654321]'>
      <Text className='text-[#438821]'>Hello world!</Text>
    </View>
  )
}
