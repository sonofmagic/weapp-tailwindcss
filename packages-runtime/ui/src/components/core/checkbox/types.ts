/**
 * Checkbox 组件类型定义
 * 复选框组件
 */
import type { ClassValue } from '../../../utils/class-names'

export type CheckboxTone = 'primary' | 'success' | 'warning' | 'danger'
export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps {
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
   * 是否半选状态
   */
  indeterminate?: boolean
  /**
   * 尺寸
   */
  size?: CheckboxSize
  /**
   * 色调
   */
  tone?: CheckboxTone
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 值变化回调
   */
  onChange?: (checked: boolean, event: any) => void
  /**
   * 复选框的值（用于表单）
   */
  value?: string | number
  /**
   * ARIA 标签
   */
  ariaLabel?: string
  /**
   * 标签文本
   */
  children?: any
}
