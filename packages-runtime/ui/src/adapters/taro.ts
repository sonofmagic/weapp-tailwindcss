/**
 * Taro 平台适配器
 */
import type { PlatformAdapter, PlatformCapabilities } from './types'
import { createPlatformAdapter } from './types'

/**
 * Taro 事件映射
 */
const taroEvents = {
  click: 'onClick',
  longPress: 'onLongPress',
  input: 'onInput',
  focus: 'onFocus',
  blur: 'onBlur',
  change: 'onChange',
  touchStart: 'onTouchStart',
  touchMove: 'onTouchMove',
  touchEnd: 'onTouchEnd',
  confirm: 'onConfirm',
}

/**
 * Taro 平台能力配置
 */
const taroCapabilities: PlatformCapabilities = {
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
 * 创建 Taro 适配器实例
 */
export const taroAdapter: PlatformAdapter = createPlatformAdapter(
  'taro',
  taroEvents,
  // 组件映射 - Taro 使用 @tarojs/components
  undefined,
  // 样式配置 - Taro 默认使用 px（编译时会转换为 rpx）
  {
    needsUnitConversion: false,
    defaultUnit: 'px',
    unsupportedProperties: [],
    prefixedProperties: {},
  },
  taroCapabilities,
)

export default taroAdapter
