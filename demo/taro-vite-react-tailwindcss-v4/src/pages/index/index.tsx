import { View, Text } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.css')
}

export default function Index() {
  const complexTrace = 'at App.vue:4 index.ts:120:3'
  const complexExpression = 'size > 4 ? keep-[business] : App.vue:4'
  const bracketLikeText = 'before content ["not-generated"]'
  const urlLikeText = 'https://example.com/a[b]?q=Hello world!'

  return (
    <View className='index'>
      <div className='h-[300px] text-[#c31d6b] bg-[#123456]'>短斤少两快点撒</div>
      <Text className='text-[55rpx] text-[#fff] bg-purple-300'>Hello world!</Text>
      <View className='bg-[red]'>Hello world!</View>
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
