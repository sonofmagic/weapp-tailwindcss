import type { FC } from 'react'
import type { DialogProps } from './types'
/**
 * Dialog - Taro 组件
 * 对话框组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Dialog: FC<DialogProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-dialog', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Dialog
