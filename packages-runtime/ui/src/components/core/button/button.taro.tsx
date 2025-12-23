import type { FC } from 'react'
import type { ButtonProps } from './types'
/**
 * Button - Taro 组件实现
 */
import { View } from '@tarojs/components'
import React from 'react'
import { getButtonAriaProps } from '../../../utils/accessibility'
import { cn } from '../../../utils/class-names'
import { button as buttonVariants } from '../../../variants'

const Button: FC<ButtonProps> = ({
  className,
  style,
  type: _type = 'button',
  tone = 'primary',
  appearance = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  leftIcon,
  rightIcon,
  onClick,
  onLongPress,
  children,
  ariaLabel,
  ..._props
}) => {
  const handleClick = (e: any) => {
    if (disabled || loading) {
      return
    }
    onClick?.(e)
  }

  const handleLongPress = (e: any) => {
    if (disabled || loading) {
      return
    }
    onLongPress?.(e)
  }

  const ariaProps = getButtonAriaProps({
    label: ariaLabel,
    disabled: disabled || loading,
  })

  const classes = cn(
    buttonVariants({ tone, appearance, size, disabled: disabled || loading }),
    {
      'wt-w-full': block,
    },
    className,
  )

  return (
    <View
      className={classes}
      style={style}
      onClick={handleClick}
      onLongPress={handleLongPress}
      {...ariaProps}
    >
      {loading && <View className="wt-loading-icon">⏳</View>}
      {!loading && leftIcon && <View className="wt-button__icon-left">{leftIcon}</View>}
      {children}
      {!loading && rightIcon && <View className="wt-button__icon-right">{rightIcon}</View>}
    </View>
  )
}

export default Button
