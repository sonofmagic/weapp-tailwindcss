import type { ClassValue } from '../../../utils/class-names'

/**
 * Card 组件类型定义
 * 卡片组件
 */
export interface CardProps {
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
