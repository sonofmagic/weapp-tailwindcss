/**
 * uni-app 平台适配器
 */
import { createPlatformAdapter } from './types'

/**
 * uni-app 事件映射
 */
export const uniAppAdapter = createPlatformAdapter('uni-app', {
  click: '@click',
  longPress: '@longpress',
  input: '@input',
  focus: '@focus',
  blur: '@blur',
  change: '@change',
  touchStart: '@touchstart',
  touchMove: '@touchmove',
  touchEnd: '@touchend',
})

export default uniAppAdapter
