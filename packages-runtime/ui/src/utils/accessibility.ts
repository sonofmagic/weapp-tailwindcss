/**
 * 无障碍辅助工具
 * 在小程序环境有限支持的情况下,尽可能提供无障碍支持
 */

export interface AriaAttributes {
  'role'?: string | undefined
  'aria-label'?: string | undefined
  'aria-labelledby'?: string | undefined
  'aria-describedby'?: string | undefined
  'aria-checked'?: boolean | 'mixed' | undefined
  'aria-disabled'?: boolean | undefined
  'aria-expanded'?: boolean | undefined
  'aria-hidden'?: boolean | undefined
  'aria-selected'?: boolean | undefined
  'aria-pressed'?: boolean | 'mixed' | undefined
  'aria-readonly'?: boolean | undefined
  'aria-required'?: boolean | undefined
  'aria-invalid'?: boolean | undefined
  'aria-live'?: 'off' | 'polite' | 'assertive' | undefined
  'aria-modal'?: boolean | undefined
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time' | undefined
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
  label?: string | undefined
  disabled?: boolean | undefined
  pressed?: boolean | 'mixed' | undefined
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
  label?: string | undefined
  disabled?: boolean | undefined
  readonly?: boolean | undefined
  required?: boolean | undefined
  invalid?: boolean | undefined
  describedby?: string | undefined
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
  label?: string | undefined
  checked?: boolean | undefined
  disabled?: boolean | undefined
  indeterminate?: boolean | undefined
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
  label?: string | undefined
  checked?: boolean | undefined
  disabled?: boolean | undefined
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
  selected?: boolean | undefined
  controls?: string | undefined
  disabled?: boolean | undefined
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
  labelledby?: string | undefined
  describedby?: string | undefined
}): AriaAttributes {
  return {
    'role': 'dialog',
    'aria-modal': true,
    'aria-labelledby': options.labelledby,
    'aria-describedby': options.describedby,
  }
}
