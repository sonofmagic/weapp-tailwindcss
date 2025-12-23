import type { FC } from 'react'
import type { ProgressProps } from './types'
/**
 * Progress - Taro 组件
 * 进度条组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Progress: FC<ProgressProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-progress', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Progress
