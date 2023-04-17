import * as React from 'react'

import { View } from 'remax/one'
import './index.css'
const { useState } = React
export default () => {
  const [flag] = useState(true)
  return (
    <>
      <View className={"bg-[url('https://xxx.com/xx.webp')]"}>bgUrl</View>
      <View className="bg-[#654321] dark:bg-[#666555] h-10 w-10" data-id="bg-[#654123] dark:bg-[#abcdef]" hoverClassName="bg-red-500 dark:bg-[#487512]"></View>
      <View className={flag ? 'p-[20px] -mt-2 mb-[-20px] ' : ''}>p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</View>
      <View className="space-y-[1.6rem] h-[200%]">
        <View className="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</View>
        <View className="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</View>
        <View className="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</View>
        <View className="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</View>
        <View className="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</View>
        <View className="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
          <View>1</View>
          <View>2</View>
          <View>3</View>
        </View>
        <View className="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300">Default</View>
      </View>
      <View className="test">test</View>
    </>
  )
}
