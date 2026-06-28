import type { UniUtsPlatformInfo } from '@/utils'
import { describe, expect, it } from 'vitest'
import {
  resolveExplicitOrEnvPlatform,
  resolveNativeAppPlatform,
} from '@/runtime-branch/platform'

describe('runtime branch platform helpers', () => {
  it('resolves unknown native platform when no app flag matches', () => {
    const platform: UniUtsPlatformInfo = {
      raw: undefined,
      normalized: undefined,
      isApp: false,
      isAppAndroid: false,
      isAppHarmony: false,
      isAppIos: false,
      isMp: false,
      isWeb: false,
    }

    expect(resolveNativeAppPlatform(platform)).toBe('unknown')
  })

  it('prefers explicit context platform over environment-derived platform', () => {
    expect(resolveExplicitOrEnvPlatform(
      {
        generatorTarget: 'weapp',
        platform: 'mp-weixin',
      },
      {
        raw: 'app-android',
        normalized: 'app-android',
        isApp: true,
        isAppAndroid: true,
        isAppHarmony: false,
        isAppIos: false,
        isMp: false,
        isWeb: false,
      },
    )).toBe('mp-weixin')
  })
})
