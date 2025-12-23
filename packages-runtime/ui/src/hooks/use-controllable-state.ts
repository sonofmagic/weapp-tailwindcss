/**
 * 受控/非受控状态管理 Hook
 * 用于组件同时支持受控和非受控模式
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseControllableStateOptions<T> {
  /**
   * 受控值
   */
  value?: T
  /**
   * 默认值（非受控）
   */
  defaultValue?: T
  /**
   * 值变化回调
   */
  onChange?: (value: T) => void
}

/**
 * 受控/非受控状态管理
 * @param options - 配置选项
 * @returns [当前值, 更新函数, 是否受控]
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): [T | undefined, (value: T) => void, boolean] {
  const { value: valueProp, defaultValue, onChange } = options
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue

  const setValue = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onChange?.(nextValue)
    },
    [isControlled, onChange],
  )

  return [value, setValue, isControlled]
}

/**
 * 保存上一次的值
 * @param value - 当前值
 * @returns 上一次的值
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * 切换状态 Hook
 * @param initialValue - 初始值
 * @returns [当前值, 切换函数, 设置函数]
 */
export function useToggle(
  initialValue = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle, setValue]
}

/**
 * 显示/隐藏控制 Hook
 * 常用于模态框、抽屉等组件
 */
export interface UseDisclosureReturn {
  /**
   * 是否打开
   */
  isOpen: boolean
  /**
   * 打开
   */
  onOpen: () => void
  /**
   * 关闭
   */
  onClose: () => void
  /**
   * 切换
   */
  onToggle: () => void
  /**
   * 设置状态
   */
  setIsOpen: (value: boolean) => void
}

/**
 * 显示/隐藏控制
 * @param defaultIsOpen - 默认是否打开
 * @returns 控制对象
 */
export function useDisclosure(defaultIsOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const onToggle = useCallback(() => {
    setIsOpen(v => !v)
  }, [])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  }
}
