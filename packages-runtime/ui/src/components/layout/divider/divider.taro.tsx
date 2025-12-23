import type { FC } from 'react'
import type { DividerProps } from './types'
/**
 * Divider - Taro 组件
 * 分割线组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Divider: FC<DividerProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-divider', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Divider
