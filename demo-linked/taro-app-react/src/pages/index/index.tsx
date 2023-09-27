/* eslint-disable react/jsx-curly-brace-presence */
import { useState } from 'react'
import { View, Navigator, Button } from '@tarojs/components'
import classNames from 'classnames'
// import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
// import { Button } from 'antd-mobile'
import './index.scss'
import EndClassCom from './endClassCom'

const Index = () => {
  const [flag] = useState(true)
  const className = 'bg-[#123456]'
  const aaa = classNames(
    {
      'text-[50px]': true
    },
    'bg-[#3232ff]',
    ['h-[10px]', 'w-[20px]'],
    'text-[#fa00aa]',
    'text-[#fa0000]',
    "bg-[url('https://xxx.com/xx.webp')]",
    "bg-[url('https://yyy.com/xx.webp')]"
  )
  const wildContent = '****'
  return (
    <>
      {/* <Button className='btn btn-primary'>Button</Button> */}
      <Navigator url='/moduleA/pages/index'>普通分包</Navigator>
      <Navigator url='/moduleB/pages/index'>独立分包</Navigator>
      <View className='p-10 mr-8'>{wildContent}</View>
      {/* <Button>Button</Button> */}
      <View className={`w-full bg-indigo-400 bg-[url('https://xxx.com/xx.webp')] bg-bottom bg-contain bg-no-repeat`}>{'bg-[url]'}</View>
      <View className={aaa}>11</View>
      <View className='shadow-md p-2'>shadow-md</View>
      <View className='form-box py-[62px] rotate-45 px-[95px] bg-sky-500/80 dark:bg-[#123456]'>py-[62px] px-[95px]</View>
      {/* @ts-ignore */}
      <View emptyImageClass='w-[404px] h-[337px] bg-[#fff]' btnClassName='text-[#66ffff]'></View>
      <EndClassCom emptyImageClass='text-[#564564]' btnClassName='text-[#66ffff]'></EndClassCom>
      <View className="after:border-none after:content-['Hello_World'] a">after:border-none</View>
      <View className='after:content-["*"] after:ml-0.5 after:text-red-500 b'>yellow</View>
      <View className='after:content-["的撒的撒"] after:ml-0.5 after:text-red-500'>事实上</View>
      <View className="after:content-['的撒的撒'] after:ml-0.5 after:text-red-500">事实上</View>
      <View className='after:content-[*] after:ml-0.5 after:text-red-500 aspect-w-16'>
        <View className='!text-[#555]'>aspect</View>
        <View className='bg-[#faf]'>w</View>
        <View className='bg-[#123]'>16</View>
      </View>
      <View className='bg-gray-100 dark:bg-zinc-800 h-10 w-10' hoverClass='bg-red-500 dark:bg-green-500'></View>
      <View className={className}>className</View>
      <View className={flag ? 'p-[20px] -mt-2 mb-[-20px] ' : ''}>p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</View>
      <View className='space-y-[1.6rem] text-[16px] w-[200%]'>
        <View className='w-[300rpx] text-black text-opacity-[0.19]'>w-[300rpx] text-black text-opacity-[0.19]</View>
        <View className='min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]'>min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</View>
        <View className='max-w-[300rpx] min-h-[100px] text-[#dddddd]'>max-w-[300rpx] min-h-[100px] text-[#dddddd]</View>
        <View className='flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]'>Hello</View>
        <View className='border-[10px] border-[#098765] border-solid border-opacity-[0.44]'>border-[10px] border-[#098765] border-solid border-opacity-[0.44]</View>
        <View className='grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid'>
          <View>1</View>
          <View>2</View>
          <View>3</View>
        </View>
        <View className='w-32 py-[123rpx] rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300'>Default</View>
      </View>
      <View className='test'>test</View>
    </>
  )
}

export default Index
