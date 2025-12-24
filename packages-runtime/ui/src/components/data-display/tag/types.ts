import type { ClassValue } from '../../../utils/class-names'

/**
 * Tag 组件类型定义
 * 标签组件
 */
export type TagTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type TagSize = 'sm' | 'md' | 'lg'
export type TagVariant = 'solid' | 'outline' | 'light' | 'soft'

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
   * 尺寸
   */
  size?: TagSize
  /**
   * 色调
   */
  tone?: TagTone
  /**
   * 变体
   */
  variant?: TagVariant
  /**
   * 是否可关闭
   */
  closable?: boolean
  /**
   * 关闭回调
   */
  onClose?: () => void
  /**
   * 标签内容
   */
  children?: any
  /**
   * 图标
   */
  icon?: any
}
