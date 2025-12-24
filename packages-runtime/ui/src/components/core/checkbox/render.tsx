/**
 * render.tsx - Checkbox 组件的跨平台渲染层
 * 为三个平台提供统一的渲染接口
 */
import type { FC } from 'react'
import type { CheckboxProps } from './types'
import { View } from '@tarojs/components'
import { useCheckbox } from './use-checkbox'

/**
 * Taro 平台 Checkbox 组件实现
 */
export const CheckboxTaro: FC<CheckboxProps> = (props) => {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: checkboxClassName, inputClassName, handleClick, isDisabled }
    = useCheckbox(props)

  return (
    <View
      className={checkboxClassName}
      style={style}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-checked={checked}
      aria-disabled={isDisabled}
      role="checkbox"
      {...restProps}
    >
      <View className={inputClassName}>
        {checked && (
          <View className="wt-checkbox__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </View>
        )}
        {!checked && props.indeterminate && (
          <View className="wt-checkbox__icon wt-checkbox__icon--indeterminate">
            <View className="wt-checkbox__indeterminate-line" />
          </View>
        )}
      </View>
      {children && <View className="wt-checkbox__label">{children}</View>}
    </View>
  )
}

/**
 * Native 平台 Checkbox 组件实现
 */
export function CheckboxNative(props: CheckboxProps) {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: checkboxClassName, inputClassName, handleClick, isDisabled }
    = useCheckbox(props)

  return {
    type: 'view',
    props: {
      'className': checkboxClassName,
      style,
      'bindtap': handleClick,
      'aria-label': ariaLabel,
      'aria-checked': checked,
      'aria-disabled': isDisabled,
      'role': 'checkbox',
      ...restProps,
    },
    children: [
      {
        type: 'view',
        props: { className: inputClassName },
        children: checked
          ? [
              {
                type: 'view',
                props: { className: 'wt-checkbox__icon' },
                children: [
                  {
                    type: 'icon',
                    props: { type: 'success', size: '14' },
                    children: [],
                  },
                ],
              },
            ]
          : props.indeterminate
            ? [
                {
                  type: 'view',
                  props: { className: 'wt-checkbox__icon wt-checkbox__icon--indeterminate' },
                  children: [
                    {
                      type: 'view',
                      props: { className: 'wt-checkbox__indeterminate-line' },
                      children: [],
                    },
                  ],
                },
              ]
            : [],
      },
      children
        ? {
            type: 'view',
            props: { className: 'wt-checkbox__label' },
            children: [children],
          }
        : null,
    ].filter(Boolean),
  }
}

/**
 * uni-app 平台 Checkbox 组件实现
 */
export function CheckboxUniApp(props: CheckboxProps) {
  const { children, ariaLabel, ...restProps } = props

  const { checked, className: checkboxClassName, inputClassName, handleClick, isDisabled }
    = useCheckbox(props)

  return {
    template: `
      <view
        :class="checkboxClassName"
        :style="style"
        @click="handleClick"
        :aria-label="ariaLabel"
        :aria-checked="checked"
        :aria-disabled="isDisabled"
        role="checkbox"
        v-bind="restProps"
      >
        <view :class="inputClassName">
          <view v-if="checked" class="wt-checkbox__icon">
            <text class="wt-icon">✓</text>
          </view>
          <view v-if="!checked && indeterminate" class="wt-checkbox__icon wt-checkbox__icon--indeterminate">
            <view class="wt-checkbox__indeterminate-line"></view>
          </view>
        </view>
        <view v-if="children" class="wt-checkbox__label">{{ children }}</view>
      </view>
    `,
    data() {
      return {
        checkboxClassName,
        inputClassName,
        checked,
        indeterminate: props.indeterminate,
        isDisabled,
        handleClick,
        ariaLabel,
        children,
        restProps,
      }
    },
  }
}
