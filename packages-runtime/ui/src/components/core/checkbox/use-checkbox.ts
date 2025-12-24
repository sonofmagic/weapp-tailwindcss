import type { CheckboxProps } from './types'
/**
 * useCheckbox - Checkbox 组件的通用逻辑
 * 跨平台共享逻辑，用于 Checkbox 复选框组件
 */
import { useCallback, useMemo } from 'react'
import { useControllableState } from '../../../hooks'
import { cn } from '../../../utils/class-names'

export interface UseCheckboxOptions extends CheckboxProps {}

export interface UseCheckboxReturn {
  /**
   * 当前是否选中
   */
  checked: boolean
  /**
   * 组件根元素的类名
   */
  className: string
  /**
   * 输入元素的类名
   */
  inputClassName: string
  /**
   * 点击处理
   */
  handleClick: (event: any) => void
  /**
   * 是否禁用
   */
  isDisabled: boolean
}

/**
 * Checkbox 组件通用逻辑 Hook
 */
export function useCheckbox(options: UseCheckboxOptions): UseCheckboxReturn {
  const {
    checked: checkedProp,
    defaultChecked = false,
    indeterminate = false,
    size = 'md',
    tone = 'primary',
    disabled = false,
    onChange,
    className,
  } = options

  // 使用受控状态 Hook
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
  })

  // 点击处理
  const handleClick = useCallback(
    (event: any) => {
      if (disabled) {
        return
      }
      const newValue = !checked
      setChecked(newValue)
      onChange?.(newValue, event)
    },
    [disabled, checked, setChecked, onChange],
  )

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      'wt-checkbox',
      {
        'wt-checkbox--checked': checked,
        'wt-checkbox--indeterminate': indeterminate,
        'wt-checkbox--disabled': disabled,
        [`
          wt-checkbox--${size}
        `]: size,
        [`
          wt-checkbox--${tone}
        `]: tone,
      },
      className,
    )
  }, [checked, indeterminate, disabled, size, tone, className])

  // 输入元素类名
  const inputClassNameStr = useMemo(() => {
    return cn('wt-checkbox__input', {
      'wt-checkbox__input--checked': checked,
      'wt-checkbox__input--indeterminate': indeterminate,
    })
  }, [checked, indeterminate])

  return {
    checked,
    className: classNameStr,
    inputClassName: inputClassNameStr,
    handleClick,
    isDisabled: disabled,
  }
}
