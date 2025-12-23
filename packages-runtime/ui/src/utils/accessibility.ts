/**
 * 无障碍辅助工具
 * 在小程序环境有限支持的情况下,尽可能提供无障碍支持
 */

export interface AriaAttributes {
  'role'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-checked'?: boolean | 'mixed'
  'aria-disabled'?: boolean
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-selected'?: boolean
  'aria-pressed'?: boolean | 'mixed'
  'aria-readonly'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-modal'?: boolean
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
}

/**
 * 为小程序组件生成 ARIA 属性
 * 注意：小程序对 ARIA 的支持有限,主要用于辅助开发和未来兼容
 */
export function getAriaProps(attrs: AriaAttributes): Record<string, any> {
  const props: Record<string, any> = {}

  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) {
      // 将 boolean 值转换为字符串,以适配小程序
      props[key] = typeof value === 'boolean' ? String(value) : value
    }
  }

  return props
}

/**
 * 按钮类组件的 ARIA 属性
 */
export function getButtonAriaProps(options: {
  label?: string
  disabled?: boolean
  pressed?: boolean | 'mixed'
}): AriaAttributes {
  return {
    'role': 'button',
    'aria-label': options.label,
    'aria-disabled': options.disabled,
    'aria-pressed': options.pressed,
  }
}

/**
 * 输入框类组件的 ARIA 属性
 */
export function getInputAriaProps(options: {
  label?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  invalid?: boolean
  describedby?: string
}): AriaAttributes {
  return {
    'aria-label': options.label,
    'aria-disabled': options.disabled,
    'aria-readonly': options.readonly,
    'aria-required': options.required,
    'aria-invalid': options.invalid,
    'aria-describedby': options.describedby,
  }
}

/**
 * 复选框/单选框的 ARIA 属性
 */
export function getCheckableAriaProps(options: {
  type: 'checkbox' | 'radio'
  label?: string
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
}): AriaAttributes {
  return {
    'role': options.type,
    'aria-label': options.label,
    'aria-checked': options.indeterminate ? 'mixed' : options.checked,
    'aria-disabled': options.disabled,
  }
}

/**
 * 开关组件的 ARIA 属性
 */
export function getSwitchAriaProps(options: {
  label?: string
  checked?: boolean
  disabled?: boolean
}): AriaAttributes {
  return {
    'role': 'switch',
    'aria-label': options.label,
    'aria-checked': options.checked,
    'aria-disabled': options.disabled,
  }
}

/**
 * 标签页的 ARIA 属性
 */
export function getTabAriaProps(options: {
  selected?: boolean
  controls?: string
  disabled?: boolean
}): Record<string, any> {
  return {
    'role': 'tab',
    'aria-selected': options.selected,
    'aria-controls': options.controls,
    'aria-disabled': options.disabled,
  }
}

/**
 * 模态框的 ARIA 属性
 */
export function getModalAriaProps(options: {
  labelledby?: string
  describedby?: string
}): AriaAttributes {
  return {
    'role': 'dialog',
    'aria-modal': true,
    'aria-labelledby': options.labelledby,
    'aria-describedby': options.describedby,
  }
}
