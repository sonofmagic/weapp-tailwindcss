/**
 * Badge - Taro 组件
 * 徽章组件
 */
import type { FC } from 'react'

import type { BadgeProps } from './types'
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Badge: FC<BadgeProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-badge', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Badge
