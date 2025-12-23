import type { ClassValue } from '../../../utils/class-names'
/**
 * Input 组件类型定义
 */
import type { InputVariants } from '../../../variants'

export interface InputProps extends Partial<InputVariants> {
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
   * 输入框类型
   */
  type?: 'text' | 'number' | 'idcard' | 'digit' | 'tel' | 'safe-password' | 'nickname'
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
   * 是否显示清除按钮
   */
  clearable?: boolean
  /**
   * 左侧图标
   */
  leftIcon?: any
  /**
   * 右侧图标
   */
  rightIcon?: any
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
   * 清除事件
   */
  onClear?: () => void
  /**
   * 确认事件(回车)
   */
  onConfirm?: (value: string, event: any) => void
  /**
   * ARIA 标签
   */
  ariaLabel?: string
}

export type { InputVariants }
