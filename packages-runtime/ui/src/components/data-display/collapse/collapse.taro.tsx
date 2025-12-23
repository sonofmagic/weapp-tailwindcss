import type { FC } from 'react'
import type { CollapseProps } from './types'
/**
 * Collapse - Taro 组件
 * 折叠面板组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Collapse: FC<CollapseProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-collapse', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Collapse
