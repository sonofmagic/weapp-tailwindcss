import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='bg-[#89ab8d] flex flex-col'>
      <Text className='text-[#438821] before:content-["11111"]'>Hello world!</Text>
      <Text className='text-[#3d31a4] before:content-["222"]'>Hello world!</Text>
    </View>
  )
}
