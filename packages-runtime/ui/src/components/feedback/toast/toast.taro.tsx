import type { FC } from 'react'
import type { ToastProps } from './types'
/**
 * Toast - Taro 组件
 * 轻提示组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Toast: FC<ToastProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-toast', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Toast
