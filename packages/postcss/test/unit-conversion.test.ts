import { afterEach, describe, expect, it } from 'vitest'
import { createStyleHandler } from '@/handler'
import {
  resolveUnitConversionConfig,
  resolveUnitConversionPlatform,
} from '@/plugins/getUnitConversionPlugin'

const PLATFORM_ENV_KEYS = [
  'WEAPP_TW_TARGET',
  'WEAPP_TAILWINDCSS_TARGET',
  'UNI_PLATFORM',
  'UNI_UTS_PLATFORM',
  'TARO_ENV',
  'MPX_CLI_MODE',
  'MPX_CURRENT_TARGET_MODE',
] as const

const originalEnvValues = new Map<string, string | undefined>(
  PLATFORM_ENV_KEYS.map(key => [key, process.env[key]]),
)

function resetPlatformEnv() {
  for (const key of PLATFORM_ENV_KEYS) {
    const value = originalEnvValues.get(key)
    if (value === undefined) {
      delete process.env[key]
    }
    else {
      process.env[key] = value
    }
  }
}

describe('unitConversion', () => {
  afterEach(() => {
    resetPlatformEnv()
  })

  it('keeps units when disabled', async () => {
    const styleHandler = createStyleHandler({
      unitConversion: false,
    })

    const { css } = await styleHandler('.a{width:10px;height:20rpx}', {
      isMainChunk: true,
    })

    expect(css).toContain('10px')
    expect(css).toContain('20rpx')
  })

  it('converts units with global custom rules', async () => {
    const styleHandler = createStyleHandler({
      unitConversion: {
        rules: [
          { from: 'px', to: 'rpx', factor: 2 },
          { from: 'rem', to: 'rpx', factor: 32 },
        ],
      },
    })

    const { css } = await styleHandler('.a{width:10px;height:1rem}', {
      isMainChunk: true,
    })

    expect(css).toContain('20rpx')
    expect(css).toContain('32rpx')
    expect(css).not.toContain('10px')
    expect(css).not.toContain('1rem')
  })

  it('selects platform rules from explicit platform option', async () => {
    const styleHandler = createStyleHandler({
      unitConversion: {
        default: {
          rules: [
            { from: 'px', to: 'dp', factor: 1 },
          ],
        },
        platforms: {
          'mp-weixin': {
            rules: [
              { from: 'px', to: 'rpx', factor: 2 },
            ],
          },
          h5: {
            rules: [
              { from: 'rpx', to: 'px', factor: 0.5 },
            ],
          },
        },
      },
    })

    const weapp = await styleHandler('.a{width:10px;height:20rpx}', {
      isMainChunk: true,
      platform: 'weapp',
    })
    const h5 = await styleHandler('.a{width:10px;height:20rpx}', {
      isMainChunk: true,
      platform: 'web',
    })
    const unknown = await styleHandler('.a{width:10px;height:20rpx}', {
      isMainChunk: true,
      platform: 'quickapp',
    })

    expect(weapp.css).toContain('20rpx')
    expect(weapp.css).toContain('height:20rpx')
    expect(h5.css).toContain('width:10px')
    expect(h5.css).toContain('height:10px')
    expect(unknown.css).toContain('10dp')
  })

  it('infers platform from framework environment variables', () => {
    for (const key of PLATFORM_ENV_KEYS) {
      delete process.env[key]
    }
    process.env.UNI_PLATFORM = 'h5'

    expect(resolveUnitConversionPlatform({})).toBe('h5')
    expect(resolveUnitConversionConfig({
      unitConversion: {
        platforms: {
          WEB: {
            rules: [
              { from: 'rpx', to: 'px', factor: 0.5 },
            ],
          },
          weapp: {
            rules: [
              { from: 'px', to: 'rpx', factor: 2 },
            ],
          },
        },
      },
    })?.rules?.[0]).toMatchObject({
      from: 'rpx',
      to: 'px',
    })
  })

  it('skips platform config without rules', () => {
    expect(resolveUnitConversionConfig({
      platform: 'weapp',
      unitConversion: {
        platforms: {
          weapp: {},
        },
      },
    })).toBeUndefined()
  })
})
