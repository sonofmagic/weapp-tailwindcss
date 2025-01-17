import { useEffect } from 'react'
import { View } from '@tarojs/components'
import { TailwindPrefix } from '../../components/TailwindPrefix'
const Index = () => {
  const text = 'debugger'

  useEffect(() => {
    console.log('text has change or init')
    debugger
  }, [text])
  // 此处写可以准确触发
  // debugger
  return <>
    <View className='text-[#123456] px-[33.89080980rpx] py-[32.8989989rpx] bg-[#91ba306d]'>{text}</View>
    <TailwindPrefix></TailwindPrefix>
  </>
}

export default Index
