import { View } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.css')
}

export default function SubPackagePage() {
  return <View className="bg-normal-subpackage-marker before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3']">普通分包</View>
}
