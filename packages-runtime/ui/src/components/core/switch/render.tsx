/**
 * render.tsx - Switch 组件的跨平台渲染层
 * 为三个平台提供统一的渲染接口
 */
import type { FC } from 'react'
import type { SwitchProps } from './types'
import { View } from '@tarojs/components'
import { useSwitch } from './use-switch'

/**
 * Taro 平台 Switch 组件实现
 */
export const SwitchTaro: FC<SwitchProps> = (props) => {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: switchClassName, handleToggle, isDisabled }
    = useSwitch(props)

  return (
    <View
      className={switchClassName}
      style={style}
      onClick={handleToggle}
      aria-label={ariaLabel}
      aria-checked={checked}
      aria-disabled={isDisabled}
      role="switch"
      {...restProps}
    >
      <View className="wt-switch__track">
        <View className="wt-switch__thumb" />
      </View>
      {children && <View className="wt-switch__label">{children}</View>}
    </View>
  )
}

/**
 * Native 平台 Switch 组件实现
 */
export function SwitchNative(props: SwitchProps) {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: switchClassName, handleToggle, isDisabled }
    = useSwitch(props)

  return {
    type: 'view',
    props: {
      'className': switchClassName,
      style,
      'bindtap': handleToggle,
      'aria-label': ariaLabel,
      'aria-checked': checked,
      'aria-disabled': isDisabled,
      'role': 'switch',
      ...restProps,
    },
    children: [
      {
        type: 'view',
        props: { className: 'wt-switch__track' },
        children: [
          {
            type: 'view',
            props: { className: 'wt-switch__thumb' },
            children: [],
          },
        ],
      },
      children
        ? {
            type: 'view',
            props: { className: 'wt-switch__label' },
            children: [children],
          }
        : null,
    ].filter(Boolean),
  }
}

/**
 * uni-app 平台 Switch 组件实现
 */
export function SwitchUniApp(props: SwitchProps) {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: switchClassName, handleToggle, isDisabled }
    = useSwitch(props)

  return {
    template: `
      <view
        :class="switchClassName"
        :style="style"
        @click="handleToggle"
        :aria-label="ariaLabel"
        :aria-checked="checked"
        :aria-disabled="isDisabled"
        role="switch"
        v-bind="restProps"
      >
        <view class="wt-switch__track">
          <view class="wt-switch__thumb"></view>
        </view>
        <view v-if="children" class="wt-switch__label">{{ children }}</view>
      </view>
    `,
    data() {
      return {
        switchClassName,
        style,
        checked,
        isDisabled,
        handleToggle,
        ariaLabel,
        children,
        restProps,
      }
    },
  }
}
