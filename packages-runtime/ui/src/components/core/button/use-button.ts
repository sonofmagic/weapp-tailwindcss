import type { ButtonProps } from './types'
/**
 * useButton - Button 组件的通用逻辑
 * 跨平台共享逻辑，用于 Button, IconButton 等按钮类组件
 */
import { useMemo } from 'react'
import { useButtonLike } from '../../../hooks/use-button-like'
import { getButtonAriaProps } from '../../../utils/accessibility'
import { cn } from '../../../utils/class-names'
import { button as buttonVariants } from '../../../variants'

export interface UseButtonOptions extends ButtonProps {
  /**
   * 平台适配器（可选，默认使用当前平台适配器）
   */
  adapter?: any
}

export interface UseButtonReturn {
  /**
   * 组件根元素的类名
   */
  className: string
  /**
   * ARIA 属性
   */
  ariaProps: Record<string, any>
  /**
   * 点击处理
   */
  handleClick: (event: any) => void
  /**
   * 长按处理
   */
  handleLongPress: (event: any) => void
  /**
   * 是否禁用
   */
  isDisabled: boolean
  /**
   * 是否加载中
   */
  isLoading: boolean
}

/**
 * Button 组件通用逻辑 Hook
 */
export function useButton(options: UseButtonOptions): UseButtonReturn {
  const {
    tone = 'primary',
    appearance = 'solid',
    size = 'md',
    disabled = false,
    loading = false,
    block = false,
    className,
    onClick,
    onLongPress,
    ariaLabel,
    debounceDelay,
  } = options

  // 使用按钮类组件通用逻辑
  const { isDisabled, handleClick, handleLongPress } = useButtonLike({
    disabled,
    loading,
    onClick,
    onLongPress,
    debounceDelay,
  })

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      buttonVariants({ tone, appearance, size, disabled: isDisabled }),
      {
        'wt-w-full': block,
      },
      className,
    )
  }, [tone, appearance, size, isDisabled, block, className])

  // 生成 ARIA 属性
  const ariaProps = useMemo(() => {
    return getButtonAriaProps({
      label: ariaLabel,
      disabled: isDisabled,
    })
  }, [ariaLabel, isDisabled])

  return {
    className: classNameStr,
    ariaProps,
    handleClick,
    handleLongPress,
    isDisabled,
    isLoading: loading,
  }
}
