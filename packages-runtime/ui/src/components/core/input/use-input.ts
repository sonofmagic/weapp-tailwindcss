import type { InputProps } from './types'
/**
 * useInput - Input 组件的通用逻辑
 * 跨平台共享逻辑，用于 Input 组件
 */
import { useMemo } from 'react'
import { useInputLike } from '../../../hooks/use-input-like'
import { getInputAriaProps } from '../../../utils/accessibility'
import { cn } from '../../../utils/class-names'
import { input as inputVariants } from '../../../variants'

export interface UseInputOptions extends InputProps {}

export interface UseInputReturn {
  /**
   * 当前值
   */
  value: string
  /**
   * 组件根元素的类名
   */
  className: string
  /**
   * ARIA 属性
   */
  ariaProps: Record<string, any>
  /**
   * 是否显示清除按钮
   */
  showClearButton: boolean
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
}

/**
 * Input 组件通用逻辑 Hook
 */
export function useInput(options: UseInputOptions): UseInputReturn {
  const {
    state = 'default',
    disabled = false,
    readOnly = false,
    required = false,
    maxLength = 140,
    clearable = false,
    className,
    ariaLabel,
    ...restOptions
  } = options

  // 使用输入类组件通用逻辑
  const {
    value,
    handleInput,
    handleFocus,
    handleBlur,
    handleConfirm,
    handleClear,
    showClearButton,
  } = useInputLike({
    ...restOptions,
    maxLength,
    clearable,
    disabled,
    readOnly,
  })

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      inputVariants({ state, disabled: disabled || readOnly }),
      'wt-flex wt-items-center',
      className,
    )
  }, [state, disabled, readOnly, className])

  // 生成 ARIA 属性
  const ariaProps = useMemo(() => {
    return getInputAriaProps({
      label: ariaLabel,
      disabled,
      readonly: readOnly,
      required,
      invalid: state === 'error',
    })
  }, [ariaLabel, disabled, readOnly, required, state])

  return {
    value,
    className: classNameStr,
    ariaProps,
    showClearButton,
    handleInput,
    handleFocus,
    handleBlur,
    handleConfirm,
    handleClear,
  }
}
