import type { FC } from 'react'
import type { TabsProps } from './types'
/**
 * Tabs - Taro 组件
 * 标签页组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Tabs: FC<TabsProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-tabs', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Tabs
