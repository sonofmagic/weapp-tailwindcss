import React from "react";
import { View } from '@tarojs/components'
if (process.env.TARO_ENV !== 'rn') {
  require('./TailwindPrefix.scss')
}

export const TailwindPrefix: React.FC = () => {
  return <View className="my-text-[#11e331]">Tailwindcss Prefix </View>
}
