import { View } from "@tarojs/components"

export default function Index() {
  const complexTrace = 'at App.vue:4 index.ts:120:3'
  const complexExpression = 'size > 4 ? keep-[business] : App.vue:4'
  const bracketLikeText = 'before content ["not-generated"]'
  const urlLikeText = 'https://example.com/a[b]?q=Hello world!'

  return (
    <View>
      <View className='bg-[#e24826] flex flex-col'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"] text-[66rpx]'>Tests</View>
        <View className="text-[#3d31a4] before:content-['333']">Tests</View>
      </View>
      <View className='bg-[#89ab8d] flex divide-x-8 divide-solid divide-[#60d256]'>
        <View className='text-[#438821] dark:text-[#ec4f4f] before:content-["11111"]'>Hello world!</View>
        <View className="text-[#3d31a4] before:content-['222']">Tests</View>
      </View>
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
