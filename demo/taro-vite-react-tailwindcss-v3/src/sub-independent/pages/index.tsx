import { View } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.scss')
}

export default function SubPackagePage() {
  return <View className="bg-independent-subpackage-marker before:content-['independent_subpackage_taro-vite-react-tailwindcss-v3']">独立分包</View>
}
