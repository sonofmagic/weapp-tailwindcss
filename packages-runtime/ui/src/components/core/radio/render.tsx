/**
 * render.tsx - Radio 组件的跨平台渲染层
 * 为三个平台提供统一的渲染接口
 */
import type { FC } from 'react'
import type { RadioProps } from './types'
import { View } from '@tarojs/components'
import { useRadio } from './use-radio'

/**
 * Taro 平台 Radio 组件实现
 */
export const RadioTaro: FC<RadioProps> = (props) => {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: radioClassName, inputClassName, handleClick, isDisabled }
    = useRadio(props)

  return (
    <View
      className={radioClassName}
      style={style}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-checked={checked}
      aria-disabled={isDisabled}
      role="radio"
      {...restProps}
    >
      <View className={inputClassName}>
        <View className="wt-radio__circle" />
        {checked && <View className="wt-radio__dot" />}
      </View>
      {children && <View className="wt-radio__label">{children}</View>}
    </View>
  )
}

/**
 * Native 平台 Radio 组件实现
 */
export function RadioNative(props: RadioProps) {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: radioClassName, inputClassName, handleClick, isDisabled }
    = useRadio(props)

  return {
    type: 'view',
    props: {
      'className': radioClassName,
      style,
      'bindtap': handleClick,
      'aria-label': ariaLabel,
      'aria-checked': checked,
      'aria-disabled': isDisabled,
      'role': 'radio',
      ...restProps,
    },
    children: [
      {
        type: 'view',
        props: { className: inputClassName },
        children: [
          {
            type: 'view',
            props: { className: 'wt-radio__circle' },
            children: checked
              ? [
                  {
                    type: 'view',
                    props: { className: 'wt-radio__dot' },
                    children: [],
                  },
                ]
              : [],
          },
        ],
      },
      children
        ? {
            type: 'view',
            props: { className: 'wt-radio__label' },
            children: [children],
          }
        : null,
    ].filter(Boolean),
  }
}

/**
 * uni-app 平台 Radio 组件实现
 */
export function RadioUniApp(props: RadioProps) {
  const { children, ariaLabel, ...restProps } = props

  const { checked, className: radioClassName, inputClassName, handleClick, isDisabled }
    = useRadio(props)

  return {
    template: `
      <view
        :class="radioClassName"
        :style="style"
        @click="handleClick"
        :aria-label="ariaLabel"
        :aria-checked="checked"
        :aria-disabled="isDisabled"
        role="radio"
        v-bind="restProps"
      >
        <view :class="inputClassName">
          <view class="wt-radio__circle">
            <view v-if="checked" class="wt-radio__dot"></view>
          </view>
        </view>
        <view v-if="children" class="wt-radio__label">{{ children }}</view>
      </view>
    `,
    data() {
      return {
        radioClassName,
        inputClassName,
        checked,
        isDisabled,
        handleClick,
        ariaLabel,
        children,
        restProps,
      }
    },
  }
}
