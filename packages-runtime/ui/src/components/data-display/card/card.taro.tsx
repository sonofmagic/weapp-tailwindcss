/**
 * Card - Taro 组件
 * 卡片组件
 */
import type { FC } from 'react'

import type { CardProps } from './types'
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Card: FC<CardProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-card', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Card
