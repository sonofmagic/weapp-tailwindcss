/**
 * Grid 组件类型定义
 * 网格布局组件
 */
import type { ClassValue } from '../../../utils/class-names'

export interface GridProps {
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
