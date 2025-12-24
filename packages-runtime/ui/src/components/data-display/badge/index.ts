export { BadgeTaro } from './render'
// 默认导出 Taro 版本 (开发时默认)
export { BadgeTaro as default } from './render'
/**
 * Badge 组件导出
 * 跨端统一导出，根据平台自动选择对应实现
 */
export * from './types'

export * from './use-badge'

// 原有实现保留作为参考
// export { default as BadgeTaro } from './badge.taro'
