import type { BadgeProps } from './types'
/**
 * useBadge - Badge 组件的通用逻辑
 * 跨平台共享逻辑，用于 Badge 徽章组件
 */
import { useMemo } from 'react'
import { cn } from '../../../utils/class-names'

export interface UseBadgeOptions extends BadgeProps {}

export interface UseBadgeReturn {
  /**
   * 组件根元素的类名
   */
  className: string
  /**
   * 徽章元素类名
   */
  badgeClassName: string
  /**
   * 显示的文本内容
   */
  displayText: string
  /**
   * 是否显示徽章
   */
  showBadge: boolean
}

/**
 * Badge 组件通用逻辑 Hook
 */
export function useBadge(options: UseBadgeOptions): UseBadgeReturn {
  const {
    count,
    maxCount = 99,
    dot = false,
    size = 'sm',
    tone = 'danger',
    showZero = false,
    className,
  } = options

  // 计算显示的文本
  const displayText = useMemo(() => {
    if (dot) {
      return ''
    }

    if (count === undefined || count === null) {
      return ''
    }

    const numCount = typeof count === 'number' ? count : Number.parseInt(String(count), 10)

    if (numCount === 0 && !showZero) {
      return ''
    }

    if (maxCount && numCount > maxCount) {
      return `${maxCount}+`
    }

    return String(count)
  }, [count, maxCount, dot, showZero])

  // 是否显示徽章
  const showBadge = useMemo(() => {
    if (dot) {
      return true
    }
    return displayText !== ''
  }, [dot, displayText])

  // 生成类名
  const classNameStr = useMemo(() => {
    return cn('wt-badge', className)
  }, [className])

  // 徽章类名
  const badgeClassNameStr = useMemo(() => {
    return cn(
      'wt-badge__content',
      {
        'wt-badge--dot': dot,
        'wt-badge--has-count': !dot && displayText,
        [`
          wt-badge--${size}
        `]: size,
        [`
          wt-badge--${tone}
        `]: tone,
      },
    )
  }, [dot, displayText, size, tone])

  return {
    className: classNameStr,
    badgeClassName: badgeClassNameStr,
    displayText,
    showBadge,
  }
}
