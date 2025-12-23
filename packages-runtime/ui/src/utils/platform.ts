/**
 * 平台检测工具
 * 用于在运行时识别当前平台环境
 */

// 全局类型声明
declare const wx: any
declare const uni: any

export type Platform = 'native' | 'taro' | 'uni-app' | 'unknown'

/**
 * 检测当前平台类型
 * @returns 平台类型
 */
export function detectPlatform(): Platform {
  // 检测微信小程序原生环境
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    // 检测是否是 Taro 环境
    if (typeof window !== 'undefined' && (window as any).Taro) {
      return 'taro'
    }
    // 检测是否是 uni-app 环境
    if (typeof uni !== 'undefined') {
      return 'uni-app'
    }
    return 'native'
  }

  // 检测 Taro 环境（Web 端或其他端）
  if (typeof window !== 'undefined' && (window as any).Taro) {
    return 'taro'
  }

  // 检测 uni-app 环境
  if (typeof uni !== 'undefined') {
    return 'uni-app'
  }

  return 'unknown'
}

/**
 * 当前平台实例
 */
export const currentPlatform = detectPlatform()

/**
 * 检查是否为原生小程序环境
 */
export const isNative = currentPlatform === 'native'

/**
 * 检查是否为 Taro 环境
 */
export const isTaro = currentPlatform === 'taro'

/**
 * 检查是否为 uni-app 环境
 */
export const isUniApp = currentPlatform === 'uni-app'

/**
 * 根据平台执行不同的函数
 * @param handlers - 平台处理器映射
 * @returns 执行结果
 */
export function platformSwitch<T>(handlers: {
  'native'?: () => T
  'taro'?: () => T
  'uni-app'?: () => T
  'default'?: () => T
}): T | undefined {
  const handler = handlers[currentPlatform as keyof typeof handlers] || handlers.default
  return handler?.()
}
