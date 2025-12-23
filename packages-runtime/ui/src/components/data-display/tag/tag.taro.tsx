/**
 * Tag - Taro 组件
 * 标签组件
 */
import type { FC } from 'react'

import type { TagProps } from './types'
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Tag: FC<TagProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-tag', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Tag
