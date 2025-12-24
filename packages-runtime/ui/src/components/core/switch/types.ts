/**
 * Switch 组件类型定义
 * 开关组件
 */
import type { ClassValue } from '../../../utils/class-names'

export type SwitchTone = 'primary' | 'success' | 'warning' | 'danger'
export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 是否选中（受控）
   */
  checked?: boolean
  /**
   * 默认是否选中（非受控）
   */
  defaultChecked?: boolean
  /**
   * 尺寸
   */
  size?: SwitchSize
  /**
   * 色调
   */
  tone?: SwitchTone
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 加载状态
   */
  loading?: boolean
  /**
   * 值变化回调
   */
  onChange?: (checked: boolean, event: any) => void
  /**
   * ARIA 标签
   */
  ariaLabel?: string
  /**
   * 子内容（如开关文字）
   */
  children?: any
}
