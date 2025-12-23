import type { FC } from 'react'
import type { GridProps } from './types'
/**
 * Grid - Taro 组件
 * 网格布局组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Grid: FC<GridProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-grid', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Grid
