import { View } from '@tarojs/components'
import './index.scss'
// https://taro-docs.jd.com/docs/independent-subpackage
// https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html
export default () => {
  return <View className="before:content-['moduleC_独立分包']">moduleC_独立分包</View>
}
