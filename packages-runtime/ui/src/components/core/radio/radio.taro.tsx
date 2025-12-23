import type { FC } from 'react'
import type { RadioProps } from './types'
/**
 * Radio - Taro 组件
 * 单选框组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Radio: FC<RadioProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-radio', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Radio
