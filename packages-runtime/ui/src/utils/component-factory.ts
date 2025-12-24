/**
 * component-factory - 跨平台组件工厂函数
 * 目标：像 shadcn/ui 一样，提供统一的组件 API，自动适配不同平台
 */

import type { PlatformAdapter, PlatformEventMap } from '../adapters/types'
import { adapter } from '../adapters'

/**
 * 平台特定的组件渲染配置
 */
export interface PlatformRenderConfig {
  /**
   * 平台名称
   */
  platform: 'native' | 'taro' | 'uni-app'
  /**
   * 渲染函数
   */
  render: (props: any) => any
}

/**
 * 组件属性配置
 */
export interface ComponentFactoryConfig<
  P extends Record<string, any> = Record<string, any>,
> {
  /**
   * 组件名称
   */
  name: string
  /**
   * 默认属性
   */
  defaultProps?: Partial<P>
  /**
   * 需要转换的事件名
   */
  eventNames?: (keyof PlatformEventMap)[]
  /**
   * 属性转换函数
   */
  transformProps?: (props: P, adapter: PlatformAdapter) => Record<string, any>
  /**
   * 类名转换函数
   */
  transformClassName?: (className: string, adapter: PlatformAdapter) => string
  /**
   * 样式转换函数
   */
  transformStyle?: (style: Record<string, any>, adapter: PlatformAdapter) => Record<string, any>
  /**
   * 平台特定的渲染配置
   */
  platformRenders?: Partial<Record<'native' | 'taro' | 'uni-app', (props: any) => any>>
}

/**
 * 组件工厂函数返回值
 */
export interface ComponentFactoryReturn<P extends Record<string, any>> {
  /**
   * 组件渲染函数
   */
  (props: P): any
  /**
   * 组件显示名称
   */
  displayName?: string
}

/**
 * 跨平台组件工厂函数
 *
 * @example
 * ```ts
 * const Button = createComponentFactory({
 *   name: 'Button',
 *   defaultProps: {
 *     tone: 'primary',
 *     size: 'md',
 *   },
 *   eventNames: ['click', 'longPress'],
 *   transformProps: (props, adapter) => {
 *     const { onClick, onLongPress, ...rest } = props
 *     return adapter.getEventProps(['click', 'longPress'], { onClick, onLongPress })
 *   },
 * })
 * ```
 */
export function createComponentFactory<P extends Record<string, any> = any>(
  config: ComponentFactoryConfig<P>,
): ComponentFactoryReturn<P> {
  const {
    name,
    defaultProps,
    transformProps,
    transformClassName,
    transformStyle,
    platformRenders,
  } = config

  const Component = (props: P) => {
    // 合并默认属性
    const mergedProps = { ...defaultProps, ...props } as P

    // 如果有平台特定的渲染函数，使用它
    const platformRender = platformRenders?.[adapter.name]
    if (platformRender) {
      return platformRender(mergedProps)
    }

    // 属性转换
    let finalProps: any = { ...mergedProps }

    // 应用自定义属性转换
    if (transformProps) {
      const transformed = transformProps(mergedProps, adapter)
      finalProps = { ...finalProps, ...transformed }
    }

    // 类名转换
    if (transformClassName && finalProps.className) {
      finalProps.className = transformClassName(
        finalProps.className as string,
        adapter,
      )
    }
    else if (adapter.adaptClassName && finalProps.className) {
      finalProps.className = adapter.adaptClassName(finalProps.className as string)
    }

    // 样式转换
    if (transformStyle && finalProps.style) {
      finalProps.style = transformStyle(finalProps.style, adapter)
    }
    else if (adapter.adaptStyle && finalProps.style) {
      finalProps.style = adapter.adaptStyle(finalProps.style)
    }

    // 使用平台特定的渲染器
    const renderer = platformRenders?.[adapter.name]
    if (renderer) {
      return renderer(finalProps)
    }

    // 默认渲染（需要子类实现）
    throw new Error(
      `Component "${name}" must either provide a platformRenders.${adapter.name} `
      + `or a default render function`,
    )
  }

  Component.displayName = name

  return Component
}

/**
 * 创建带逻辑的组件工厂
 * 将组件逻辑和渲染分离，便于复用
 */
export function createLogicalComponentFactory<
  P extends Record<string, any> = any,
  L extends Record<string, any> = any,
>(config: {
  name: string
  /**
   * 逻辑 Hook
   */
  useLogic: (props: P) => L
  /**
   * 渲染函数
   */
  render: (logic: L, props: P) => any
  /**
   * 平台特定的渲染函数
   */
  platformRenders?: Partial<Record<'native' | 'taro' | 'uni-app', (logic: L, props: P) => any>>
}) {
  const { name, useLogic, render, platformRenders } = config

  const Component = (props: P) => {
    const logic = useLogic(props)

    // 如果有平台特定的渲染函数
    const platformRender = platformRenders?.[adapter.name]
    if (platformRender) {
      return platformRender(logic, props)
    }

    return render(logic, props)
  }

  Component.displayName = name

  return Component
}

/**
 * 创建跨平台组件变体
 * 用于统一管理组件的样式变体
 */
export function createComponentVariant<T extends Record<string, any>>(config: {
  /**
   * 基础类名
   */
  baseClass: string
  /**
   * 变体映射
   */
  variants: {
    [K in keyof T]?: Record<string, string>
  }
  /**
   * 默认变体值
   */
  defaults: T
}) {
  const { baseClass, variants, defaults } = config

  return (props: Partial<T> & { className?: string }) => {
    const classes = [baseClass]

    // 应用变体
    Object.entries(variants).forEach(([key, variantMap]) => {
      const value = props[key as keyof T] ?? defaults[key as keyof T]
      const variantClass = variantMap[value as string]
      if (variantClass) {
        classes.push(variantClass)
      }
    })

    // 添加自定义类名
    if (props.className) {
      classes.push(props.className)
    }

    return classes.join(' ')
  }
}

/**
 * 创建带事件处理的组件工厂
 * 简化事件处理逻辑
 */
export function createEventAwareComponentFactory<
  P extends Record<string, any> = any,
>(config: {
  name: string
  /**
   * 事件配置
   */
  events: {
    /**
     * 事件名映射
     */
    [propName: string]: keyof PlatformEventMap
  }
  /**
   * 渲染函数
   */
  render: (props: P, eventProps: Record<string, any>) => any
}) {
  const { name, events, render } = config

  const Component = (props: P) => {
    // 转换事件属性
    const eventProps: Record<string, any> = {}

    Object.entries(events).forEach(([propName, eventName]) => {
      const handler = (props as any)[propName]
      if (handler) {
        const platformEventName = adapter.getEventPropName(eventName)
        eventProps[platformEventName] = handler
      }
    })

    return render(props, eventProps)
  }

  Component.displayName = name

  return Component
}
