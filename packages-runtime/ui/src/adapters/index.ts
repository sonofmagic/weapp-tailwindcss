import type { PlatformAdapter } from './types'
/**
 * 平台适配器导出
 */
import { currentPlatform } from '../utils/platform'
import nativeAdapter from './native'
import taroAdapter from './taro'
import uniAppAdapter from './uni-app'

export * from './types'
export { nativeAdapter, taroAdapter, uniAppAdapter }

/**
 * 获取当前平台的适配器
 */
export function getCurrentAdapter(): PlatformAdapter {
  switch (currentPlatform) {
    case 'native':
      return nativeAdapter
    case 'taro':
      return taroAdapter
    case 'uni-app':
      return uniAppAdapter
    default:
      // 默认使用原生适配器
      return nativeAdapter
  }
}

/**
 * 当前平台适配器实例
 */
export const adapter = getCurrentAdapter()
