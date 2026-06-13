import { View, Text } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.scss')
}

export default function Index() {
  return (
    <View>
      <View className='bg-[red] flex flex-col'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"]'>Hello world!</View>
        <View className="text-[#3d31a4] before:content-['222']">Hello world!</View>
      </View>
      <View className='theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 theme-dark:bg-zinc-900 theme-dark:text-zinc-50 dark:bg-zinc-900 dark:text-zinc-50'>
        Taro Vite React Tailwind CSS v3 system dark
        <View className='theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 theme-dark:bg-zinc-950 theme-dark:text-zinc-50'>
          Taro Vite React Tailwind CSS v3 manual dark
        </View>
      </View>
      <View className='bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"]'>Hello world!</View>
        <View className="text-[#3d31a4] before:content-['222']">Hello world!</View>
      </View>
    </View>
  )
}
