import { View, Text } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.css')
}
import { Button } from '@nutui/nutui-react-taro'

export default function Index() {
  return (
    <>
      <View className='bg-[#534312] text-[#fff] text-[100rpx]'>
        <Text>Hello world!</Text>
      </View>
      <View className='bg-purple-800 text-pink-200'>
        11
      </View>
      <View className='theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50'>
        Taro Webpack React Tailwind CSS v4 system dark
        <View className='theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50'>
          Taro Webpack React Tailwind CSS v4 manual dark
        </View>
      </View>
      <View className='h-14 bg-gradient-to-r from-cyan-500 to-blue-500'></View>
      <Button>Share</Button>
    </>

  )
}
