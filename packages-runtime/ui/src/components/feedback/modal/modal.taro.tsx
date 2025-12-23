import type { FC } from 'react'
import type { ModalProps } from './types'
/**
 * Modal - Taro 组件
 * 模态框组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Modal: FC<ModalProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-modal', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Modal
