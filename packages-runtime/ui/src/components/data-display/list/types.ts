/**
 * List 组件类型定义
 * 列表组件
 */
import type { ClassValue } from '../../../utils/class-names'

export interface ListProps {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 子内容
   */
  children?: any
}
