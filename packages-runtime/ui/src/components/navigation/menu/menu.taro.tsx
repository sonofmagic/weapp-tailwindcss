import type { FC } from 'react'
import type { MenuProps } from './types'
/**
 * Menu - Taro 组件
 * 菜单组件
 */
import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'

const Menu: FC<MenuProps> = ({
  className,
  style,
  children,
  ..._props
}) => {
  return (
    <View
      className={cn('wt-menu', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default Menu
