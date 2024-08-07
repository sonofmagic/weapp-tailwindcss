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
    <View className='text-[#123456]'>{text}</View>
    <TailwindPrefix></TailwindPrefix>
  </>
}

export default Index
