/**
 * 原生小程序平台适配器
 */
import type { PlatformAdapter, PlatformCapabilities } from './types'
import { createPlatformAdapter } from './types'

/**
 * 原生小程序事件映射
 */
const nativeEvents = {
  click: 'bindtap',
  longPress: 'bindlongpress',
  input: 'bindinput',
  focus: 'bindfocus',
  blur: 'bindblur',
  change: 'bindchange',
  touchStart: 'bindtouchstart',
  touchMove: 'bindtouchmove',
  touchEnd: 'bindtouchend',
  confirm: 'bindconfirm',
}

/**
 * 原生小程序平台能力配置
 */
const nativeCapabilities: PlatformCapabilities = {
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
 * 创建原生小程序适配器实例
 */
export const nativeAdapter: PlatformAdapter = createPlatformAdapter(
  'native',
  nativeEvents,
  // 组件映射 - 原生小程序使用标准组件名
  undefined,
  // 样式配置 - 原生小程序默认使用 rpx
  {
    needsUnitConversion: false,
    defaultUnit: 'rpx',
    unsupportedProperties: [],
    prefixedProperties: {},
  },
  nativeCapabilities,
)

export default nativeAdapter
