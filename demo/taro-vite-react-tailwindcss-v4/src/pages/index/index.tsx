import { View, Text } from '@tarojs/components'
import './index.css'
import { Button as NutButton } from '@nutui/nutui-react-taro'

export default function Index() {
  const complexTrace = 'at App.vue:4 index.ts:120:3'
  const complexExpression = 'size > 4 ? keep-[business] : App.vue:4'
  const bracketLikeText = 'before content ["not-generated"]'
  const urlLikeText = 'https://example.com/a[b]?q=Hello world!'
  const templateCorpusDynamicClass = 'template-corpus-dynamic bg-[#68c828] text-[100rpx] w-[323px] h-[45px]'

  return (
    <View className='index'>
      <View className='template-corpus-card flex flex-col gap-3 rounded-[28rpx] border border-slate-200/80 bg-gradient-to-br from-slate-900/95 to-slate-700/95 p-4 text-white shadow-xl wx:bg-blue-500 not-wx:bg-red-500 any-hover:bg-slate-800'>
        <View className='template-corpus-radial bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[48px] py-[24rpx] text-[#123456]'>
          template corpus radial
        </View>
        <View className='template-corpus-space space-y-2'>
          <View className='rounded-[20rpx] bg-white/70 px-3 py-1 text-[26rpx] text-slate-700'>space item 1</View>
          <View className={templateCorpusDynamicClass}>space item 2</View>
        </View>
        <View className='template-corpus-apply'>apply corpus</View>
        <View className='template-corpus-hover h-16 w-32 rounded-[20rpx] bg-green-200/70' hoverClass="!bg-[gray] after:!content-['good_work!']">
          hover corpus
        </View>
        <View t-class='bg-[#0977ee] text-[31rpx]' t-class-content='px-[29rpx]'>issue 977 t-class</View>
      </View>
      <div className='h-[300px] text-[#c31d6b] bg-[#123456]'>短斤少两快点撒</div>
      <Text className='text-[55rpx] text-[#fff] bg-purple-300'>Hello world!</Text>
      <View className='bg-[red]'>Hello world!</View>
      <View className='weapp-tw-nutui-react-demo mt-4' data-issue-850-import-order='tailwind-first'>
        <View data-issue-850-cascade='normal'>
          <NutButton className='rounded-full' type='primary'>NutUI wins by source order (Tailwind first)</NutButton>
        </View>
        <View data-issue-850-cascade='important' className='mt-2'>
          <NutButton className='rounded-full!' type='primary'>Tailwind wins with important</NutButton>
        </View>
      </View>
      <View className='theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50'>
        Taro Vite React Tailwind CSS v4 system dark
        <View className='theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50'>
          Taro Vite React Tailwind CSS v4 manual dark
        </View>
      </View>
      <View className='h-14 bg-gradient-to-r from-cyan-500 to-blue-500'></View>
      <View className='h-14 bg-linear-to-r from-cyan-500 to-blue-500'></View>
      <View
        data-trace={complexTrace}
        data-expression={complexExpression}
        data-missing={bracketLikeText}
        data-url={urlLikeText}
      >
        {complexTrace}
      </View>
      <View>{complexExpression}</View>
      <View>{bracketLikeText}</View>
      <View>{urlLikeText}</View>
    </View>
  )
}
