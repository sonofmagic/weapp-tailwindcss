import type { ClassValue } from '../../../utils/class-names'

/**
 * Badge 组件类型定义
 * 徽章组件
 */
export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'
export type BadgeVariant = 'dot' | 'count' | 'text'

export interface BadgeProps {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 显示的数字或文本
   */
  count?: number | string
  /**
   * 最大显示数字（超出显示 count+）
   */
  maxCount?: number
  /**
   * 是否显示圆点
   */
  dot?: boolean
  /**
   * 尺寸
   */
  size?: BadgeSize
  /**
   * 色调
   */
  tone?: BadgeTone
  /**
   * 变体
   */
  variant?: BadgeVariant
  /**
   * 是否显示零
   */
  showZero?: boolean
  /**
   * 徽章位置偏移
   */
  offset?: [number, number]
  /**
   * 子元素（被装饰的元素）
   */
  children?: any
}
