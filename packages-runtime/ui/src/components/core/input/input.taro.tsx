import type { FC } from 'react'
import type { InputProps } from './types'
/**
 * Input - Taro 组件实现
 */
import { Input as TaroInput, View } from '@tarojs/components'
import React, { useCallback, useState } from 'react'
import { useControllableState } from '../../../hooks'
import { getInputAriaProps } from '../../../utils/accessibility'
import { cn } from '../../../utils/class-names'
import { input as inputVariants } from '../../../variants'

const Input: FC<InputProps> = ({
  className,
  style,
  value: valueProp,
  defaultValue = '',
  placeholder = '',
  type = 'text',
  maxLength = 140,
  state = 'default',
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus = false,
  clearable = false,
  leftIcon,
  rightIcon,
  onInput,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onConfirm,
  ariaLabel,
  ..._props
}) => {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
  })

  const [, setIsFocused] = useState(false)

  const handleInput = useCallback(
    (e: any) => {
      const newValue = e.detail.value
      setValue(newValue)
      onChange?.(newValue, e)
      onInput?.(newValue, e)
    },
    [setValue, onChange, onInput],
  )

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true)
      onFocus?.(e)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false)
      onBlur?.(e)
    },
    [onBlur],
  )

  const handleClear = useCallback(() => {
    setValue('')
    onClear?.()
  }, [setValue, onClear])

  const handleConfirm = useCallback(
    (e: any) => {
      onConfirm?.(value || '', e)
    },
    [value, onConfirm],
  )

  const ariaProps = getInputAriaProps({
    label: ariaLabel,
    disabled,
    readonly: readOnly,
    required,
    invalid: state === 'error',
  })

  const showClearButton = clearable && !disabled && !readOnly && value && value.length > 0

  const classes = cn(
    inputVariants({ state, disabled: disabled || readOnly }),
    'wt-flex wt-items-center',
    className,
  )

  return (
    <View className={classes} style={style}>
      {leftIcon && <View className="wt-input__icon-left wt-mr-2">{leftIcon}</View>}
      <TaroInput
        className="wt-min-w-0 wt-flex-1"
        value={value || ''}
        type={type}
        placeholder={placeholder}
        maxlength={maxLength}
        disabled={disabled || readOnly}
        focus={autoFocus}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onConfirm={handleConfirm}
        {...ariaProps}
      />
      {showClearButton && (
        <View className="wt-input__clear wt-ml-2" onClick={handleClear}>
          ✕
        </View>
      )}
      {rightIcon && <View className="wt-input__icon-right wt-ml-2">{rightIcon}</View>}
    </View>
  )
}

export default Input
