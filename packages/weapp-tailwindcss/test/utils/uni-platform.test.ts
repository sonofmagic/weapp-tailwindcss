import { afterEach, describe, expect, it } from 'vitest'

import { resolveUniUtsPlatform } from '@/utils'

const originalUtsPlatform = process.env.UNI_UTS_PLATFORM

afterEach(() => {
  if (originalUtsPlatform === undefined) {
    delete process.env.UNI_UTS_PLATFORM
  }
  else {
    process.env.UNI_UTS_PLATFORM = originalUtsPlatform
  }
})

describe('resolveUniUtsPlatform', () => {
  it('marks app variants', () => {
    const ios = resolveUniUtsPlatform('app-ios')
    expect(ios.isApp).toBe(true)
    expect(ios.isAppIos).toBe(true)
    expect(ios.isAppAndroid).toBe(false)
    expect(ios.isAppHarmony).toBe(false)
    expect(ios.isMp).toBe(false)
    expect(ios.isWeb).toBe(false)

    const android = resolveUniUtsPlatform('app-android')
    expect(android.isApp).toBe(true)
    expect(android.isAppAndroid).toBe(true)

    const harmony = resolveUniUtsPlatform('app-harmony')
    expect(harmony.isApp).toBe(true)
    expect(harmony.isAppHarmony).toBe(true)
  })

  it('detects mp and web prefixes', () => {
    const mp = resolveUniUtsPlatform('mp-weixin')
    expect(mp.isMp).toBe(true)
    expect(mp.isApp).toBe(false)
    expect(mp.isWeb).toBe(false)

    const web = resolveUniUtsPlatform('web-desktop')
    expect(web.isMp).toBe(false)
    expect(web.isApp).toBe(false)
    expect(web.isWeb).toBe(true)
  })

  it('reads from env by default', () => {
    process.env.UNI_UTS_PLATFORM = 'app-android'
    const envResult = resolveUniUtsPlatform()

    expect(envResult.raw).toBe('app-android')
    expect(envResult.isAppAndroid).toBe(true)
    expect(envResult.normalized).toBe('app-android')
  })
})
