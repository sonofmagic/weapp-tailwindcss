/**
 * useButtonLike - 按钮类组件通用逻辑 Hook
 * 适用于 Button, IconButton 等按钮类组件
 */
import { useCallback } from 'react'

export interface UseButtonLikeOptions {
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 加载状态
   */
  loading?: boolean
  /**
   * 点击事件
   */
  onClick?: (event: any) => void
  /**
   * 长按事件
   */
  onLongPress?: (event: any) => void
  /**
   * 防止重复点击延迟（毫秒）
   */
  debounceDelay?: number
}

export interface UseButtonLikeReturn {
  /**
   * 是否禁用（包含加载状态）
   */
  isDisabled: boolean
  /**
   * 点击处理
   */
  handleClick: (event: any) => void
  /**
   * 长按处理
   */
  handleLongPress: (event: any) => void
}

/**
 * 按钮类组件通用逻辑 Hook
 */
export function useButtonLike(options: UseButtonLikeOptions = {}): UseButtonLikeReturn {
  const {
    disabled = false,
    loading = false,
    onClick,
    onLongPress,
    debounceDelay = 300,
  } = options

  const isDisabled = disabled || loading

  let lastClickTime = 0

  const handleClick = useCallback(
    (event: any) => {
      if (isDisabled) {
        return
      }

      // 防抖处理
      if (debounceDelay > 0) {
        const now = Date.now()
        if (now - lastClickTime < debounceDelay) {
          return
        }
        lastClickTime = now
      }

      onClick?.(event)
    },
    [isDisabled, onClick, debounceDelay],
  )

  const handleLongPress = useCallback(
    (event: any) => {
      if (isDisabled) {
        return
      }

      onLongPress?.(event)
    },
    [isDisabled, onLongPress],
  )

  return {
    isDisabled,
    handleClick,
    handleLongPress,
  }
}
