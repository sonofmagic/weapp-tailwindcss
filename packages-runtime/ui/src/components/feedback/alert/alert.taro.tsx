import type { FC } from 'react'
import type { AlertProps } from './types'
/**
 * Alert - Taro 组件
 * 警告提示组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Alert: FC<AlertProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-alert', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Alert
