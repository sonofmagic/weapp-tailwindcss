import { Image, Text, View } from 'rsmax/one'

export default () => {
  return (
    <View className="px-6 text-center">
      <View className="flex h-screen flex-col items-center justify-center">
        <Image
          src="https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ"
          className="mx-auto size-24 animate-spin"
          mode="aspectFit"
        />
        <View className="mt-4 text-2xl font-bold text-[#e4d4e0] ">
          编辑
          {' '}
          <Text>src/pages/index/index.js</Text>
          开始
        </View>
      </View>
    </View>
  )
}

// TypeError: Cannot read property 'current' of undefined
//     at li.callLifecycle (createPageConfig.js:142)
//     at li.onLoad (createPageConfig.js:100)
//     at l.<anonymous> (VM496 WASubContext.js:1)
//     at VM496 WASubContext.js:1
//     at X (VM496 WASubContext.js:1)
//     at VM496 WASubContext.js:1
//     at Array.forEach (<anonymous>)
//     at VM496 WASubContext.js:1
//     at Array.forEach (<anonymous>)
//     at VM496 WASubContext.js:1(env: macOS,mp,1.06.2503300; lib: 3.8.7)
