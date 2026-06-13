import { View } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.scss')
}

export default function SubPackagePage() {
  return <View className="bg-normal-subpackage-marker before:content-['normal_subpackage_taro-vite-react-tailwindcss-v3']">普通分包</View>
}
