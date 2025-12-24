import type { TextareaProps } from './types'
/**
 * useTextarea - Textarea 组件的通用逻辑
 * 跨平台共享逻辑，用于 Textarea 组件
 */
import { useMemo } from 'react'
import { useInputLike } from '../../../hooks/use-input-like'
import { getInputAriaProps } from '../../../utils/accessibility'
import { cn } from '../../../utils/class-names'
import { input as inputVariants } from '../../../variants'

export interface UseTextareaOptions extends TextareaProps {}

export interface UseTextareaReturn {
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
   * 当前长度
   */
  currentLength: number
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
}

/**
 * Textarea 组件通用逻辑 Hook
 */
export function useTextarea(options: UseTextareaOptions): UseTextareaReturn {
  const {
    state = 'default',
    disabled = false,
    readOnly = false,
    required = false,
    maxLength = 500,
    className,
    ariaLabel,
    ...restOptions
  } = options

  // 使用输入类组件通用逻辑
  const { value, handleInput, handleFocus, handleBlur, handleConfirm }
    = useInputLike({
      ...restOptions,
      maxLength,
      clearable: false,
      disabled,
      readOnly,
    })

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      inputVariants({ state, disabled: disabled || readOnly }),
      'wt-flex wt-flex-col',
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

  const currentLength = value?.length || 0

  return {
    value,
    className: classNameStr,
    ariaProps,
    currentLength,
    handleInput,
    handleFocus,
    handleBlur,
    handleConfirm,
  }
}
