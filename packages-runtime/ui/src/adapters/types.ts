/**
 * 平台适配器接口定义
 * 用于统一不同小程序平台的 API 差异
 * 目标：打造跨端 shadcn/ui 的统一适配层
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
  /**
   * 确认事件
   */
  confirm: string
  /**
   * 过滤事件
   */
  filter?: string
}

/**
 * 平台组件映射
 * 定义不同平台的基础组件名称
 */
export interface PlatformComponentMap {
  /**
   * 视图容器
   */
  View: string
  /**
   * 文本
   */
  Text: string
  /**
   * 按钮
   */
  Button: string
  /**
   * 输入框
   */
  Input: string
  /**
   * 多行输入
   */
  Textarea: string
  /**
   * 滚动视图
   */
  ScrollView: string
  /**
   * 可滚动视图区域
   */
  Swiper: string
  /**
   * 图片
   */
  Image: string
  /**
   * 图标
   */
  Icon: string
  /**
   * 复选框
   */
  Checkbox: string
  /**
   * 复选框组
   */
  CheckboxGroup: string
  /**
   * 单选框
   */
  Radio: string
  /**
   * 单选框组
   */
  RadioGroup: string
  /**
   * 开关
   */
  Switch: string
  /**
   * 滑块
   */
  Slider: string
  /**
   * 选择器
   */
  Picker: string
  /**
   * 进度条
   */
  Progress: string
}

/**
 * 平台样式适配配置
 */
export interface PlatformStyleConfig {
  /**
   * 是否需要单位转换
   */
  needsUnitConversion?: boolean
  /**
   * 默认单位
   */
  defaultUnit?: 'rpx' | 'px' | 'rem'
  /**
   * 不支持的 CSS 属性
   */
  unsupportedProperties?: string[]
  /**
   * 需要前缀的 CSS 属性
   */
  prefixedProperties?: Record<string, string>
}

/**
 * 平台适配能力配置
 */
export interface PlatformCapabilities {
  /**
   * 支持的 CSS 特性
   */
  cssFeatures?: {
    /**
     * CSS 变量
     */
    cssVariables?: boolean
    /**
     * Flexbox
     */
    flexbox?: boolean
    /**
     * Grid
     */
    grid?: boolean
    /**
     * 动画
     */
    animation?: boolean
    /**
     * 过渡
     */
    transition?: boolean
  }
  /**
   * 支持的 API 特性
   */
  apiFeatures?: {
    /**
     * 原生组件
     */
    nativeComponents?: boolean
    /**
     * 自定义组件
     */
    customComponents?: boolean
    /**
     * 插槽
     */
    slots?: boolean
  }
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
   * 组件名映射
   */
  components: PlatformComponentMap

  /**
   * 样式适配配置
   */
  styleConfig: PlatformStyleConfig

  /**
   * 平台能力
   */
  capabilities: PlatformCapabilities

  /**
   * 获取事件处理器属性名
   */
  getEventPropName: (eventName: keyof PlatformEventMap) => string

  /**
   * 批量获取事件属性
   */
  getEventProps: (eventNames: (keyof PlatformEventMap)[], handlers: Record<string, EventHandler>) => Record<string, EventHandler>

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

  /**
   * 适配样式对象
   */
  adaptStyle?: (style: Record<string, any>) => Record<string, any>

  /**
   * 适配类名
   */
  adaptClassName?: (className: string) => string

  /**
   * 检查是否支持某个 CSS 特性
   */
  supportsCssFeature: (feature: keyof PlatformCapabilities['cssFeatures']) => boolean

  /**
   * 检查是否支持某个 API 特性
   */
  supportsApiFeature: (feature: keyof PlatformCapabilities['apiFeatures']) => boolean
}

/**
 * 创建平台适配器
 */
export function createPlatformAdapter(
  name: PlatformAdapter['name'],
  events: PlatformEventMap,
  components?: Partial<PlatformComponentMap>,
  styleConfig?: PlatformStyleConfig,
  capabilities?: PlatformCapabilities,
): PlatformAdapter {
  // 默认组件映射
  const defaultComponents: PlatformComponentMap = {
    View: 'View',
    Text: 'Text',
    Button: 'Button',
    Input: 'Input',
    Textarea: 'Textarea',
    ScrollView: 'ScrollView',
    Swiper: 'Swiper',
    Image: 'Image',
    Icon: 'Icon',
    Checkbox: 'Checkbox',
    CheckboxGroup: 'CheckboxGroup',
    Radio: 'Radio',
    RadioGroup: 'RadioGroup',
    Switch: 'Switch',
    Slider: 'Slider',
    Picker: 'Picker',
    Progress: 'Progress',
  }

  // 默认样式配置
  const defaultStyleConfig: PlatformStyleConfig = {
    needsUnitConversion: false,
    defaultUnit: 'rpx',
    unsupportedProperties: [],
    prefixedProperties: {},
  }

  // 默认能力配置
  const defaultCapabilities: PlatformCapabilities = {
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

  const mergedComponents = { ...defaultComponents, ...components }
  const mergedStyleConfig = { ...defaultStyleConfig, ...styleConfig }
  const mergedCapabilities = { ...defaultCapabilities, ...capabilities }

  return {
    name,
    events,
    components: mergedComponents,
    styleConfig: mergedStyleConfig,
    capabilities: mergedCapabilities,
    getEventPropName(eventName) {
      return this.events[eventName]
    },
    getEventProps(eventNames, handlers) {
      const props: Record<string, EventHandler> = {}
      eventNames.forEach((eventName) => {
        const handler = handlers[eventName]
        if (handler) {
          props[this.getEventPropName(eventName)] = handler
        }
      })
      return props
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
    adaptStyle(style) {
      const adapted = { ...style }
      if (mergedStyleConfig.prefixedProperties) {
        Object.entries(mergedStyleConfig.prefixedProperties).forEach(([prop, prefix]) => {
          if (prop in adapted) {
            adapted[prefix + prop] = adapted[prop]
            delete adapted[prop]
          }
        })
      }
      return adapted
    },
    adaptClassName(className) {
      return className
    },
    supportsCssFeature(feature) {
      return this.capabilities.cssFeatures?.[feature] ?? false
    },
    supportsApiFeature(feature) {
      return this.capabilities.apiFeatures?.[feature] ?? false
    },
  }
}

/**
 * 创建事件处理助手
 * 用于简化组件中的事件处理逻辑
 */
export function createEventHandlers(
  adapter: PlatformAdapter,
  eventNames: (keyof PlatformEventMap)[],
  handlers: Record<string, EventHandler | undefined>,
): Record<string, EventHandler> {
  return adapter.getEventProps(
    eventNames,
    Object.fromEntries(
      Object.entries(handlers).filter(([_, handler]) => handler !== undefined),
    ) as Record<string, EventHandler>,
  )
}
