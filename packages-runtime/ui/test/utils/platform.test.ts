/**
 * 平台检测工具测试
 */
import { describe, expect, it } from 'vitest'
import { detectPlatform, platformSwitch } from '../../src/utils/platform'

describe('detectPlatform', () => {
  it('should return a platform type', () => {
    const platform = detectPlatform()
    expect(['native', 'taro', 'uni-app', 'unknown']).toContain(platform)
  })

  it('should detect unknown in test environment', () => {
    // 在测试环境中,没有 wx、Taro 或 uni 对象
    expect(detectPlatform()).toBe('unknown')
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
