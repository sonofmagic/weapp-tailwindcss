import { View } from '@tarojs/components'

const Index = () => {
  return (
    <>
      <View className='h-14 bg-gradient-to-r from-cyan-500 to-blue-500'></View>
      <View className='h-14 bg-gradient-to-r from-sky-500 to-indigo-500'></View>
      <View className='h-14 bg-gradient-to-r from-violet-500 to-fuchsia-500'></View>
      <View className='h-14 bg-gradient-to-r from-purple-500 to-pink-500'></View>
      <View className='[&_.u-count-down\_\_text]:!text-red-400'>
        <View></View>
        <View></View>
        <View></View>
        <View></View>
        <View>
          <View className='u-count-down__text'>u-count-down__text</View>
        </View>
      </View>
    </>
  )
}

export default Index
