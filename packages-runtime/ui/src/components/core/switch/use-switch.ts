import type { SwitchProps } from './types'
/**
 * useSwitch - Switch 组件的通用逻辑
 * 跨平台共享逻辑，用于 Switch 开关组件
 */
import { useCallback, useMemo } from 'react'
import { useControllableState } from '../../../hooks'
import { cn } from '../../../utils/class-names'

export interface UseSwitchOptions extends SwitchProps {}

export interface UseSwitchReturn {
  /**
   * 当前值
   */
  checked: boolean
  /**
   * 组件根元素的类名
   */
  className: string
  /**
   * 切换处理
   */
  handleToggle: (event: any) => void
  /**
   * 是否禁用
   */
  isDisabled: boolean
}

/**
 * Switch 组件通用逻辑 Hook
 */
export function useSwitch(options: UseSwitchOptions): UseSwitchReturn {
  const {
    checked: checkedProp,
    defaultChecked = false,
    size = 'md',
    tone = 'primary',
    disabled = false,
    loading = false,
    onChange,
    className,
  } = options

  // 使用受控状态 Hook
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
  })

  // 切换处理
  const handleToggle = useCallback(
    (event: any) => {
      if (disabled || loading) {
        return
      }
      const newValue = !checked
      setChecked(newValue)
      onChange?.(newValue, event)
    },
    [disabled, loading, checked, setChecked, onChange],
  )

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      'wt-switch',
      {
        'wt-switch--checked': checked,
        'wt-switch--disabled': disabled || loading,
        'wt-switch--loading': loading,
        [`
          wt-switch--${size}
        `]: size,
        [`
          wt-switch--${tone}
        `]: tone,
      },
      className,
    )
  }, [checked, disabled, loading, size, tone, className])

  return {
    checked,
    className: classNameStr,
    handleToggle,
    isDisabled: disabled || loading,
  }
}
