import type { FC } from 'react'
import type { SwitchProps } from './types'
/**
 * Switch - Taro 组件
 * 开关组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Switch: FC<SwitchProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-switch', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Switch
