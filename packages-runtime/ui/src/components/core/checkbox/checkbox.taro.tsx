import type { FC } from 'react'
import type { CheckboxProps } from './types'
/**
 * Checkbox - Taro 组件实现 (使用新的统一架构)
 * 复选框组件 - 跨端统一实现
 */
import { View } from '@tarojs/components'
import { useCheckbox } from './use-checkbox'

const Checkbox: FC<CheckboxProps> = (props) => {
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

export default Checkbox
