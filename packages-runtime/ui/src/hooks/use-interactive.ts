/**
 * useInteractive - 交互状态管理 Hook
 * 管理组件的 hover, active, focus 等交互状态
 */
import { useCallback, useState } from 'react'

export interface UseInteractiveOptions {
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 初始是否激活
   */
  defaultActive?: boolean
  /**
   * 初始是否聚焦
   */
  defaultFocused?: boolean
}

export interface UseInteractiveReturn {
  /**
   * 是否激活（按下状态）
   */
  active: boolean
  /**
   * 是否聚焦
   */
  focused: boolean
  /**
   * 是否悬停（仅部分平台支持）
   */
  hovered: boolean
  /**
   * 设置激活状态
   */
  setActive: (active: boolean) => void
  /**
   * 设置聚焦状态
   */
  setFocused: (focused: boolean) => void
  /**
   * 设置悬停状态
   */
  setHovered: (hovered: boolean) => void
  /**
   * 激活处理
   */
  handleActiveStart: () => void
  /**
   * 激活结束处理
   */
  handleActiveEnd: () => void
  /**
   * 聚焦处理
   */
  handleFocusIn: () => void
  /**
   * 失焦处理
   */
  handleFocusOut: () => void
}

/**
 * 交互状态管理 Hook
 */
export function useInteractive(options: UseInteractiveOptions = {}): UseInteractiveReturn {
  const { disabled = false, defaultActive = false, defaultFocused = false } = options

  const [active, setActive] = useState(defaultActive)
  const [focused, setFocused] = useState(defaultFocused)
  const [hovered, setHovered] = useState(false)

  const handleActiveStart = useCallback(() => {
    if (disabled) {
      return
    }
    setActive(true)
  }, [disabled])

  const handleActiveEnd = useCallback(() => {
    if (disabled) {
      return
    }
    setActive(false)
  }, [disabled])

  const handleFocusIn = useCallback(() => {
    if (disabled) {
      return
    }
    setFocused(true)
  }, [disabled])

  const handleFocusOut = useCallback(() => {
    if (disabled) {
      return
    }
    setFocused(false)
  }, [disabled])

  return {
    active,
    focused,
    hovered,
    setActive,
    setFocused,
    setHovered,
    handleActiveStart,
    handleActiveEnd,
    handleFocusIn,
    handleFocusOut,
  }
}
