export { ButtonTaro } from './render'
// 默认导出 Taro 版本 (开发时默认)
export { ButtonTaro as default } from './render'
/**
 * Button 组件导出
 * 跨端统一导出，根据平台自动选择对应实现
 */
export * from './types'

export * from './use-button'

// 原有实现保留作为参考
// export { default as ButtonTaro } from './button.taro'
