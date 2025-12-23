/**
 * Taro 平台适配器
 */
import { createPlatformAdapter } from './types'

/**
 * Taro 事件映射
 */
export const taroAdapter = createPlatformAdapter('taro', {
  click: 'onClick',
  longPress: 'onLongPress',
  input: 'onInput',
  focus: 'onFocus',
  blur: 'onBlur',
  change: 'onChange',
  touchStart: 'onTouchStart',
  touchMove: 'onTouchMove',
  touchEnd: 'onTouchEnd',
})

export default taroAdapter
