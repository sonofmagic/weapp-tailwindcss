import type { ClassValue } from '../../../utils/class-names'

/**
 * Badge 组件类型定义
 * 徽章组件
 */
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
   * 子元素
   */
  children?: any
}
