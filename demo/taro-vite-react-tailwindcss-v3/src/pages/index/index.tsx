import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Index() {
  return (
    <View>
      <View className='bg-[red] flex flex-col'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"]'>Hello world!</View>
        <View className="text-[#3d31a4] before:content-['222']">Hello world!</View>
      </View>
      <View className='bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"]'>Hello world!</View>
        <View className="text-[#3d31a4] before:content-['222']">Hello world!</View>
      </View>
    </View>
  )
}
