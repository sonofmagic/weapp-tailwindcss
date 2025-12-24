/**
 * useInputLike - 输入类组件通用逻辑 Hook
 * 适用于 Input, Textarea, Search 等输入类组件
 */
import { useCallback, useState } from 'react'
import { useControllableState } from './use-controllable-state'

export interface UseInputLikeOptions {
  /**
   * 受控值
   */
  value?: string
  /**
   * 非受控默认值
   */
  defaultValue?: string
  /**
   * 值变化回调
   */
  onChange?: (value: string, event: any) => void
  /**
   * 输入回调
   */
  onInput?: (value: string, event: any) => void
  /**
   * 焦点回调
   */
  onFocus?: (event: any) => void
  /**
   * 失焦回调
   */
  onBlur?: (event: any) => void
  /**
   * 确认回调
   */
  onConfirm?: (value: string, event: any) => void
  /**
   * 清除回调
   */
  onClear?: () => void
  /**
   * 最大长度
   */
  maxLength?: number
  /**
   * 是否可清除
   */
  clearable?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readOnly?: boolean
}

export interface UseInputLikeReturn {
  /**
   * 当前值
   */
  value: string
  /**
   * 是否聚焦
   */
  focused: boolean
  /**
   * 设置值
   */
  setValue: (value: string) => void
  /**
   * 输入处理
   */
  handleInput: (event: any) => void
  /**
   * 焦点处理
   */
  handleFocus: (event: any) => void
  /**
   * 失焦处理
   */
  handleBlur: (event: any) => void
  /**
   * 确认处理
   */
  handleConfirm: (event: any) => void
  /**
   * 清除处理
   */
  handleClear: () => void
  /**
   * 是否显示清除按钮
   */
  showClearButton: boolean
  /**
   * 当前长度
   */
  length: number
  /**
   * 是否超出最大长度
   */
  exceeded: boolean
}

/**
 * 输入类组件通用逻辑 Hook
 */
export function useInputLike(options: UseInputLikeOptions = {}): UseInputLikeReturn {
  const {
    value: valueProp,
    defaultValue = '',
    onChange,
    onInput,
    onFocus,
    onBlur,
    onConfirm,
    onClear,
    maxLength = 140,
    clearable = false,
    disabled = false,
    readOnly = false,
  } = options

  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
  })

  const [focused, setFocused] = useState(false)

  const handleInput = useCallback(
    (event: any) => {
      if (disabled || readOnly) {
        return
      }

      const newValue = event.detail?.value ?? event.target?.value ?? ''
      setValue(newValue)
      onChange?.(newValue, event)
      onInput?.(newValue, event)
    },
    [disabled, readOnly, setValue, onChange, onInput],
  )

  const handleFocus = useCallback(
    (event: any) => {
      if (disabled || readOnly) {
        return
      }

      setFocused(true)
      onFocus?.(event)
    },
    [disabled, readOnly, onFocus],
  )

  const handleBlur = useCallback(
    (event: any) => {
      if (disabled || readOnly) {
        return
      }

      setFocused(false)
      onBlur?.(event)
    },
    [disabled, readOnly, onBlur],
  )

  const handleConfirm = useCallback(
    (event: any) => {
      if (disabled || readOnly) {
        return
      }

      onConfirm?.(value, event)
    },
    [disabled, readOnly, value, onConfirm],
  )

  const handleClear = useCallback(() => {
    if (disabled || readOnly) {
      return
    }

    setValue('')
    onClear?.()
  }, [disabled, readOnly, setValue, onClear])

  const showClearButton = clearable && !disabled && !readOnly && value.length > 0
  const length = value.length
  const exceeded = maxLength > 0 && length > maxLength

  return {
    value,
    focused,
    setValue,
    handleInput,
    handleFocus,
    handleBlur,
    handleConfirm,
    handleClear,
    showClearButton,
    length,
    exceeded,
  }
}
