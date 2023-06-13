import { View } from '@tarojs/components'
// https://taro-docs.jd.com/docs/independent-subpackage
// https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html
export default () => {
  return <View className="before:content-['moduleB_独立分包']">moduleB 独立分包</View>
}
