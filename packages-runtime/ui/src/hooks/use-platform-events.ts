import type { PlatformAdapter, PlatformEventMap } from '../adapters/types'
/**
 * usePlatformEvents - 平台事件处理 Hook
 * 根据当前平台适配器自动转换事件名称和事件对象
 */
import { useMemo } from 'react'

export interface UsePlatformEventsOptions<
  T extends keyof PlatformEventMap = keyof PlatformEventMap,
> {
  /**
   * 需要绑定的事件名列表
   */
  events: T[]
  /**
   * 事件处理器映射
   */
  handlers: Partial<Record<T, (event: any) => void>>
  /**
   * 平台适配器
   */
  adapter: PlatformAdapter
}

/**
 * 使用平台事件处理
 * 自动将标准化的事件名转换为平台特定的事件名
 */
export function usePlatformEvents<T extends keyof PlatformEventMap>(
  options: UsePlatformEventsOptions<T>,
) {
  const { events, handlers, adapter } = options

  return useMemo(() => {
    const eventProps: Record<string, (event: any) => void> = {}

    events.forEach((eventName) => {
      const handler = handlers[eventName]
      if (handler) {
        const platformEventName = adapter.getEventPropName(eventName)
        eventProps[platformEventName] = handler
      }
    })

    return eventProps
  }, [events, handlers, adapter])
}

/**
 * 创建平台事件处理器助手
 * 用于快速创建标准化的事件处理器
 */
export function createPlatformEventHandler<T = any>(
  adapter: PlatformAdapter,
  handler: (value: T, event: any) => void,
): (event: any) => void {
  return (event: any) => {
    const normalizedEvent = adapter.normalizeEvent<T>(event)
    handler(normalizedEvent, event)
  }
}
