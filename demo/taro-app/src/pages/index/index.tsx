import { useState } from 'react'
import { View } from '@tarojs/components'
// import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
import './index.scss'
import EndClassCom from './endClassCom'
const Index = () => {
  const [flag] = useState(true)
  const className = replaceJs('bg-[#123456]')
  return (
    <>
      <View className='after:content-["*"] after:ml-0.5 after:text-red-500'></View>
      <View className='after:content-[*] after:ml-0.5 after:text-red-500 aspect-w-16'>
        <View>aspect</View>
        <View>w</View>
        <View>16</View>
      </View>
      <View className="bg-gray-100 dark:bg-zinc-800 h-10 w-10" hoverClass="bg-red-500 dark:bg-green-500"></View>
      <EndClassCom></EndClassCom>
      <View className={className}>className</View>
      <View className={flag ? 'p-[20px] -mt-2 mb-[-20px] ' : ''}>p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</View>
      <View className="space-y-[1.6rem] text-[16px] w-[200%]">
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

export default Index
