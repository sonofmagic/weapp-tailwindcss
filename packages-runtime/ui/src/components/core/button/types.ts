import type { ClassValue } from '../../../utils/class-names'
/**
 * Button 组件类型定义
 */
import type { ButtonVariants } from '../../../variants'

export interface ButtonProps extends Partial<ButtonVariants> {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 按钮类型
   */
  type?: 'button' | 'submit' | 'reset'
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 加载状态
   */
  loading?: boolean
  /**
   * 块级按钮(宽度100%)
   */
  block?: boolean
  /**
   * 左侧图标
   */
  leftIcon?: any
  /**
   * 右侧图标
   */
  rightIcon?: any
  /**
   * 点击事件
   */
  onClick?: (event: any) => void
  /**
   * 长按事件
   */
  onLongPress?: (event: any) => void
  /**
   * 子内容
   */
  children?: any
  /**
   * ARIA 标签
   */
  ariaLabel?: string
  /**
   * 原生小程序 open-type
   */
  openType?: 'contact' | 'share' | 'getPhoneNumber' | 'getUserInfo' | 'launchApp' | 'openSetting' | 'feedback'
  /**
   * 原生小程序回调
   */
  onGetUserInfo?: (event: any) => void
  onGetPhoneNumber?: (event: any) => void
  onOpenSetting?: (event: any) => void
  onError?: (event: any) => void
  onLaunchApp?: (event: any) => void
  onContact?: (event: any) => void
}

export type { ButtonVariants }
