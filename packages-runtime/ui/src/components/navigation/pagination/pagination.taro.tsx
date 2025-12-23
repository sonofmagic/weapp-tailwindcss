import type { FC } from 'react'
import type { PaginationProps } from './types'
/**
 * Pagination - Taro 组件
 * 分页组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Pagination: FC<PaginationProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-pagination', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Pagination
