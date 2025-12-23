/**
 * 平台适配器接口定义
 * 用于统一不同小程序平台的 API 差异
 */

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void

/**
 * 平台事件映射
 */
export interface PlatformEventMap {
  /**
   * 点击事件
   */
  click: string
  /**
   * 长按事件
   */
  longPress: string
  /**
   * 输入事件
   */
  input: string
  /**
   * 焦点事件
   */
  focus: string
  /**
   * 失焦事件
   */
  blur: string
  /**
   * 变化事件
   */
  change: string
  /**
   * 触摸开始
   */
  touchStart: string
  /**
   * 触摸移动
   */
  touchMove: string
  /**
   * 触摸结束
   */
  touchEnd: string
}

/**
 * 平台适配器接口
 */
export interface PlatformAdapter {
  /**
   * 平台名称
   */
  name: 'native' | 'taro' | 'uni-app'

  /**
   * 事件名映射
   */
  events: PlatformEventMap

  /**
   * 获取事件处理器属性名
   */
  getEventPropName: (eventName: keyof PlatformEventMap) => string

  /**
   * 标准化事件对象
   */
  normalizeEvent: <T = any>(event: any) => T

  /**
   * 获取事件详情
   */
  getEventDetail: (event: any) => any

  /**
   * 获取事件目标值
   */
  getEventValue: (event: any) => any
}

/**
 * 创建平台适配器
 */
export function createPlatformAdapter(
  name: PlatformAdapter['name'],
  events: PlatformEventMap,
): PlatformAdapter {
  return {
    name,
    events,
    getEventPropName(eventName) {
      return this.events[eventName]
    },
    normalizeEvent(event) {
      return event
    },
    getEventDetail(event) {
      return event?.detail ?? event
    },
    getEventValue(event) {
      const detail = this.getEventDetail(event)
      return detail?.value ?? detail
    },
  }
}
