/**
 * uni-app 平台适配器
 */
import type { PlatformAdapter, PlatformCapabilities } from './types'
import { createPlatformAdapter } from './types'

/**
 * uni-app 事件映射
 */
const uniAppEvents = {
  click: '@click',
  longPress: '@longpress',
  input: '@input',
  focus: '@focus',
  blur: '@blur',
  change: '@change',
  touchStart: '@touchstart',
  touchMove: '@touchmove',
  touchEnd: '@touchend',
  confirm: '@confirm',
}

/**
 * uni-app 平台能力配置
 */
const uniAppCapabilities: PlatformCapabilities = {
  cssFeatures: {
    cssVariables: true,
    flexbox: true,
    grid: true,
    animation: true,
    transition: true,
  },
  apiFeatures: {
    nativeComponents: true,
    customComponents: true,
    slots: true,
  },
}

/**
 * 创建 uni-app 适配器实例
 */
export const uniAppAdapter: PlatformAdapter = createPlatformAdapter(
  'uni-app',
  uniAppEvents,
  // 组件映射 - uni-app 使用标准组件名
  undefined,
  // 样式配置 - uni-app 默认使用 rpx
  {
    needsUnitConversion: false,
    defaultUnit: 'rpx',
    unsupportedProperties: [],
    prefixedProperties: {},
  },
  uniAppCapabilities,
)

export default uniAppAdapter
