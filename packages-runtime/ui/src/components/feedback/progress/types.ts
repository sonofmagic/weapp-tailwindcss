/**
 * Progress 组件类型定义
 * 进度条组件
 */
import type { ClassValue } from '../../../utils/class-names'

export interface ProgressProps {
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
