import type { ClassValue } from '../../../utils/class-names'

/**
 * Tag 组件类型定义
 * 标签组件
 */
export interface TagProps {
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
