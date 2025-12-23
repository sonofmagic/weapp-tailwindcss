import type { ClassValue } from '../../../utils/class-names'

/**
 * Avatar 组件类型定义
 * 头像组件
 */
export interface AvatarProps {
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
