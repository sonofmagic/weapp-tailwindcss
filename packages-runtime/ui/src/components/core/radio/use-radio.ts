import type { RadioProps } from './types'
/**
 * useRadio - Radio 组件的通用逻辑
 * 跨平台共享逻辑，用于 Radio 单选框组件
 */
import { useCallback, useMemo } from 'react'
import { useControllableState } from '../../../hooks'
import { cn } from '../../../utils/class-names'

export interface UseRadioOptions extends RadioProps {}

export interface UseRadioReturn {
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
 * Radio 组件通用逻辑 Hook
 */
export function useRadio(options: UseRadioOptions): UseRadioReturn {
  const {
    checked: checkedProp,
    defaultChecked = false,
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
      // Radio 单选：即使已经选中也会触发
      setChecked(true)
      onChange?.(true, event)
    },
    [disabled, setChecked, onChange],
  )

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      'wt-radio',
      {
        'wt-radio--checked': checked,
        'wt-radio--disabled': disabled,
        [`
          wt-radio--${size}
        `]: size,
        [`
          wt-radio--${tone}
        `]: tone,
      },
      className,
    )
  }, [checked, disabled, size, tone, className])

  // 输入元素类名
  const inputClassNameStr = useMemo(() => {
    return cn('wt-radio__input', {
      'wt-radio__input--checked': checked,
    })
  }, [checked])

  return {
    checked,
    className: classNameStr,
    inputClassName: inputClassNameStr,
    handleClick,
    isDisabled: disabled,
  }
}
