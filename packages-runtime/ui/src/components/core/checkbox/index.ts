export { CheckboxTaro } from './render'
// 默认导出 Taro 版本 (开发时默认)
export { CheckboxTaro as default } from './render'
/**
 * Checkbox 组件导出
 * 跨端统一导出，根据平台自动选择对应实现
 */
export * from './types'

export * from './use-checkbox'

// 原有实现保留作为参考
// export { default as CheckboxTaro } from './checkbox.taro'
