/**
 * Avatar - Taro 组件
 * 头像组件
 */
import type { FC } from 'react'

import type { AvatarProps } from './types'
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Avatar: FC<AvatarProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-avatar', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Avatar
