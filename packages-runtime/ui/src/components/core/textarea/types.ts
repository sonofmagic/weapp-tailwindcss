/**
 * Textarea 组件类型定义
 */
import type { ClassValue } from '../../../utils/class-names'

export interface TextareaProps {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 输入框的值(受控)
   */
  value?: string
  /**
   * 默认值(非受控)
   */
  defaultValue?: string
  /**
   * 占位符
   */
  placeholder?: string
  /**
   * 最大长度
   */
  maxLength?: number
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readOnly?: boolean
  /**
   * 是否必填
   */
  required?: boolean
  /**
   * 是否自动聚焦
   */
  autoFocus?: boolean
  /**
   * 是否自动增高
   */
  autoHeight?: boolean
  /**
   * 最小行数
   */
  minRows?: number
  /**
   * 最大行数
   */
  maxRows?: number
  /**
   * 是否显示字数统计
   */
  showCount?: boolean
  /**
   * 输入事件
   */
  onInput?: (value: string, event: any) => void
  /**
   * 变化事件
   */
  onChange?: (value: string, event: any) => void
  /**
   * 聚焦事件
   */
  onFocus?: (event: any) => void
  /**
   * 失焦事件
   */
  onBlur?: (event: any) => void
  /**
   * 确认事件
   */
  onConfirm?: (value: string, event: any) => void
  /**
   * ARIA 标签
   */
  ariaLabel?: string
  /**
   * 状态
   */
  state?: 'default' | 'success' | 'error'
}
