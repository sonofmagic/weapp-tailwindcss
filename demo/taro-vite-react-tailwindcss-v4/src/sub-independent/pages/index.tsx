import { View } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./index.css')
}

export default function SubPackagePage() {
  return <View className="bg-independent-subpackage-marker before:content-['independent_subpackage_taro-vite-react-tailwindcss-v4']">独立分包</View>
}
