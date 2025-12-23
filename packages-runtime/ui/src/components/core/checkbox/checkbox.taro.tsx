import type { FC } from 'react'
import type { CheckboxProps } from './types'
/**
 * Checkbox - Taro 组件
 * 复选框组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Checkbox: FC<CheckboxProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-checkbox', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Checkbox
