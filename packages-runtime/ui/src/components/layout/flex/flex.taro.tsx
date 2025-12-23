import type { FC } from 'react'
import type { FlexProps } from './types'
/**
 * Flex - Taro 组件
 * 弹性布局组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Flex: FC<FlexProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-flex', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Flex
