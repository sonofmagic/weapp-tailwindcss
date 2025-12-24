import type { TagProps } from './types'
/**
 * useTag - Tag 组件的通用逻辑
 * 跨平台共享逻辑，用于 Tag 标签组件
 */
import { useCallback, useMemo } from 'react'
import { cn } from '../../../utils/class-names'

export interface UseTagOptions extends TagProps {}

export interface UseTagReturn {
  /**
   * 组件根元素的类名
   */
  className: string
  /**
   * 关闭处理
   */
  handleClose: (event: any) => void
}

/**
 * Tag 组件通用逻辑 Hook
 */
export function useTag(options: UseTagOptions): UseTagReturn {
  const {
    size = 'md',
    tone = 'primary',
    variant = 'light',
    closable = false,
    onClose,
    className,
  } = options

  // 关闭处理
  const handleClose = useCallback(
    (event: any) => {
      event?.stopPropagation?.()
      onClose?.()
    },
    [onClose],
  )

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn(
      'wt-tag',
      {
        [`
          wt-tag--${size}
        `]: size,
        [`
          wt-tag--${tone}
        `]: tone,
        [`
          wt-tag--${variant}
        `]: variant,
        'wt-tag--closable': closable,
      },
      className,
    )
  }, [size, tone, variant, closable, className])

  return {
    className: classNameStr,
    handleClose,
  }
}
