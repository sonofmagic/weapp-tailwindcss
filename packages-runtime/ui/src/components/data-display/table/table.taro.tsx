import type { FC } from 'react'
import type { TableProps } from './types'
/**
 * Table - Taro 组件
 * 表格组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Table: FC<TableProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-table', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Table
