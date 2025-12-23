import type { FC } from 'react'
import type { LoadingProps } from './types'
/**
 * Loading - Taro 组件
 * 加载组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Loading: FC<LoadingProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-loading', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Loading
