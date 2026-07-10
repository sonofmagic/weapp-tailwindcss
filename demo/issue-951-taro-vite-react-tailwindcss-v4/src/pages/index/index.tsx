import { View } from '@tarojs/components'
import './index.css'

export default function Index() {
  return (
    <View className="bg-issue-951-main text-white">
      issue-951 main page
      <View t-class="bg-[#0977ee] text-[31rpx]" t-class-content="px-[29rpx]">issue 977 t-class</View>
    </View>
  )
}
