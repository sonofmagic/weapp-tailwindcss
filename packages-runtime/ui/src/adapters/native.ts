/**
 * 原生小程序平台适配器
 */
import { createPlatformAdapter } from './types'

/**
 * 原生小程序事件映射
 */
export const nativeAdapter = createPlatformAdapter('native', {
  click: 'bindtap',
  longPress: 'bindlongpress',
  input: 'bindinput',
  focus: 'bindfocus',
  blur: 'bindblur',
  change: 'bindchange',
  touchStart: 'bindtouchstart',
  touchMove: 'bindtouchmove',
  touchEnd: 'bindtouchend',
})

export default nativeAdapter
