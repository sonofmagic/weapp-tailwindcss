/**
 * 平台检测工具测试
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectPlatform, platformSwitch } from '../../src/utils/platform'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detectPlatform', () => {
  it('should return a platform type', () => {
    const platform = detectPlatform()
    expect(['native', 'taro', 'uni-app', 'unknown']).toContain(platform)
  })

  it('should detect unknown in test environment', () => {
    // 在测试环境中,没有 wx、Taro 或 uni 对象
    expect(detectPlatform()).toBe('unknown')
  })

  it('detects native mini program globals', () => {
    vi.stubGlobal('wx', { getSystemInfoSync: () => ({}) })

    expect(detectPlatform()).toBe('native')
  })

  it('detects Taro when both wx and window.Taro exist', () => {
    vi.stubGlobal('wx', { getSystemInfoSync: () => ({}) })
    vi.stubGlobal('window', { Taro: {} })

    expect(detectPlatform()).toBe('taro')
  })

  it('detects uni-app when wx and uni exist', () => {
    vi.stubGlobal('wx', { getSystemInfoSync: () => ({}) })
    vi.stubGlobal('uni', {})

    expect(detectPlatform()).toBe('uni-app')
  })

  it('detects Taro and uni-app without wx', () => {
    vi.stubGlobal('window', { Taro: {} })
    expect(detectPlatform()).toBe('taro')

    vi.unstubAllGlobals()
    vi.stubGlobal('uni', {})
    expect(detectPlatform()).toBe('uni-app')
  })
})

describe('platformSwitch', () => {
  it('should call default handler when no matching platform', () => {
    const result = platformSwitch({
      default: () => 'default value',
    })
    expect(result).toBe('default value')
  })

  it('should return undefined when no handlers match', () => {
    const result = platformSwitch({
      native: () => 'native',
      taro: () => 'taro',
    })
    expect(result).toBeUndefined()
  })
})
