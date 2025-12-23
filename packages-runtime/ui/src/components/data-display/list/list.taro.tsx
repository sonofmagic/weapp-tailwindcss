import type { FC } from 'react'
import type { ListProps } from './types'
/**
 * List - Taro 组件
 * 列表组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const List: FC<ListProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-list', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default List
