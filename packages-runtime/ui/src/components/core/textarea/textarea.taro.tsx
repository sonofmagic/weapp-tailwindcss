import type { FC } from 'react'
import type { TextareaProps } from './types'
/**
 * Textarea - Taro 组件实现
 */
import { Textarea as TaroTextarea, View } from '@tarojs/components'
import React, { useCallback } from 'react'
import { useControllableState } from '../../../hooks'
import { getInputAriaProps } from '../../../utils/accessibility'
import { cn } from '../../../utils/class-names'
import { input as inputVariants } from '../../../variants'

const Textarea: FC<TextareaProps> = ({
  className,
  style,
  value: valueProp,
  defaultValue = '',
  placeholder = '',
  maxLength = 500,
  state = 'default',
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus = false,
  autoHeight = false,
  showCount = false,
  onInput,
  onChange,
  onFocus,
  onBlur,
  onConfirm,
  ariaLabel,
  ..._props
}) => {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
  })

  const handleInput = useCallback(
    (e: any) => {
      const newValue = e.detail.value
      setValue(newValue)
      onChange?.(newValue, e)
      onInput?.(newValue, e)
    },
    [setValue, onChange, onInput],
  )

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

  const classes = cn(
    inputVariants({ state, disabled: disabled || readOnly }),
    'wt-flex wt-flex-col',
    className,
  )

  const currentLength = value?.length || 0

  return (
    <View className={classes} style={style}>
      <TaroTextarea
        className="wt-w-full"
        value={value || ''}
        placeholder={placeholder}
        maxlength={maxLength}
        disabled={disabled || readOnly}
        focus={autoFocus}
        autoHeight={autoHeight}
        onInput={handleInput}
        onFocus={onFocus}
        onBlur={onBlur}
        onConfirm={handleConfirm}
        {...ariaProps}
      />
      {showCount && (
        <View className="wt-text-right wt-mt-2 wt-text-sm wt-text-muted">
          {currentLength}
          /
          {maxLength}
        </View>
      )}
    </View>
  )
}

export default Textarea
