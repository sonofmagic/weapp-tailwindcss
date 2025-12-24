/**
 * render.tsx - Button 组件的跨平台渲染层
 * 为三个平台提供统一的渲染接口
 */
import type { FC } from 'react'
import type { ButtonProps } from './types'
import { View } from '@tarojs/components'
import { useButton } from './use-button'

/**
 * Taro 平台 Button 组件实现
 */
export const ButtonTaro: FC<ButtonProps> = (props) => {
  const {
    style,
    leftIcon,
    rightIcon,
    children,
    ...restProps
  } = props

  const {
    className: buttonClassName,
    ariaProps,
    handleClick,
    handleLongPress,
    isLoading,
  } = useButton(props)

  return (
    <View
      className={buttonClassName}
      style={style}
      onClick={handleClick}
      onLongPress={handleLongPress}
      {...ariaProps}
      {...restProps}
    >
      {isLoading && <View className="wt-loading-icon">⏳</View>}
      {!isLoading && leftIcon && <View className="wt-button__icon-left">{leftIcon}</View>}
      {children}
      {!isLoading && rightIcon && <View className="wt-button__icon-right">{rightIcon}</View>}
    </View>
  )
}

/**
 * Native 平台 Button 组件实现
 * （需要返回原生小程序的渲染函数）
 */
export function ButtonNative(props: ButtonProps) {
  const {
    style,
    leftIcon,
    rightIcon,
    children,
    ...restProps
  } = props

  const {
    className: buttonClassName,
    ariaProps,
    handleClick,
    handleLongPress,
    isLoading,
  } = useButton(props)

  // 原生小程序需要使用 wxml 模板
  // 这里返回配置对象，由构建系统处理
  return {
    type: 'button',
    props: {
      className: buttonClassName,
      style,
      bindtap: handleClick,
      bindlongpress: handleLongPress,
      ...ariaProps,
      ...restProps,
    },
    children: [
      isLoading ? { type: 'view', props: { className: 'wt-loading-icon' }, children: ['⏳'] } : null,
      !isLoading && leftIcon
        ? { type: 'view', props: { className: 'wt-button__icon-left' }, children: [leftIcon] }
        : null,
      children,
      !isLoading && rightIcon
        ? { type: 'view', props: { className: 'wt-button__icon-right' }, children: [rightIcon] }
        : null,
    ].filter(Boolean),
  }
}

/**
 * uni-app 平台 Button 组件实现
 * （需要返回 Vue 组件配置）
 */
export function ButtonUniApp(props: ButtonProps) {
  const {
    style,
    leftIcon,
    rightIcon,
    ...restProps
  } = props

  const {
    className: buttonClassName,
    ariaProps,
    handleClick,
    handleLongPress,
    isLoading,
  } = useButton(props)

  // uni-app 需要使用 Vue 模板
  // 这里返回配置对象，由构建系统处理
  return {
    template: `
      <view
        :class="buttonClassName"
        :style="style"
        @click="handleClick"
        @longpress="handleLongPress"
        v-bind="ariaProps"
        v-bind="restProps"
      >
        <view v-if="isLoading" class="wt-loading-icon">⏳</view>
        <view v-if="!isLoading && leftIcon" class="wt-button__icon-left">{{ leftIcon }}</view>
        <slot></slot>
        <view v-if="!isLoading && rightIcon" class="wt-button__icon-right">{{ rightIcon }}</view>
      </view>
    `,
    data() {
      return {
        buttonClassName,
        style,
        isLoading,
        leftIcon,
        rightIcon,
        handleClick,
        handleLongPress,
        ariaProps,
        restProps,
      }
    },
  }
}
