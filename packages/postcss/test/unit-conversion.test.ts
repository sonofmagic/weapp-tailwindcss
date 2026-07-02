import { afterEach, describe, expect, it } from 'vitest'
import { createStyleHandler } from '@/handler'
import {
  convertTailwindcssRpxDeclarationToRem,
  convertTailwindcssRpxDeclarationsToRem,
  convertTailwindcssRpxValueToRem,
  normalizeTailwindcssRpxDeclaration,
  normalizeTailwindcssRpxDeclarations,
  normalizeTailwindcssWebRpxDeclarations,
  postcss,
} from '@/index'
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

  it('normalizes explicit platform names and resolves aliases/default fallbacks', () => {
    expect(resolveUnitConversionPlatform({ platform: '  MP-WEIXIN  ' })).toBe('mp-weixin')

    expect(resolveUnitConversionConfig({
      platform: 'wx',
      unitConversion: {
        platforms: {
          wechat: {
            rules: [
              { from: 'px', to: 'rpx', factor: 2 },
            ],
          },
        },
      },
    })?.rules?.[0]).toMatchObject({ to: 'rpx' })

    expect(resolveUnitConversionConfig({
      platform: 'unknown',
      unitConversion: {
        platforms: {
          '*': {
            rules: [
              { from: 'px', to: 'upx', factor: 1 },
            ],
          },
        },
      },
    })?.rules?.[0]).toMatchObject({ to: 'upx' })
  })

  it('skips disabled, false and empty platform configs', () => {
    expect(resolveUnitConversionConfig({
      platform: 'weapp',
      unitConversion: {
        platforms: {
          weapp: false,
        },
      },
    })).toBeUndefined()

    expect(resolveUnitConversionConfig({
      platform: 'weapp',
      unitConversion: {
        platforms: {
          weapp: {
            disabled: true,
            rules: [
              { from: 'px', to: 'rpx', factor: 2 },
            ],
          },
        },
      },
    })).toBeUndefined()

    expect(resolveUnitConversionConfig({
      platform: 'weapp',
      unitConversion: {
        platforms: {},
      },
    })).toBeUndefined()
  })

  it('normalizes Tailwind rpx declarations and converts rpx values to rem', () => {
    expect(convertTailwindcssRpxValueToRem('calc(64RPX - 32rpx)', {
      rootValue: 32,
      unitPrecision: 2,
    })).toBe('calc(2rem - 1rem)')
    expect(convertTailwindcssRpxValueToRem('10px')).toBe('10px')
    expect(convertTailwindcssRpxValueToRem('-0rpx')).toBe('0rem')

    const color = postcss.decl({ prop: 'color', value: '32rpx' })
    expect(normalizeTailwindcssRpxDeclaration(color)).toBe(true)
    expect(color.prop).toBe('font-size')

    const background = postcss.decl({ prop: 'background-color', value: '32rpx' })
    expect(normalizeTailwindcssRpxDeclaration(background)).toBe(true)
    expect(background.prop).toBe('background-size')

    const border = postcss.decl({ prop: 'border-top-color', value: '32rpx' })
    expect(normalizeTailwindcssRpxDeclaration(border)).toBe(true)
    expect(border.prop).toBe('border-top-width')

    const oldVersion = postcss.decl({ prop: 'color', value: '32rpx' })
    expect(normalizeTailwindcssRpxDeclaration(oldVersion, { majorVersion: 3 as 4 })).toBe(false)

    const root = postcss.parse('.a{outline-color:32rpx;--tw-ring-color:16rpx;width:64rpx;color:red}')
    expect(normalizeTailwindcssRpxDeclarations(root)).toBe(true)
    expect(convertTailwindcssRpxDeclarationsToRem(root)).toBe(true)
    expect(root.toString()).toContain('outline-width:1rem')
    expect(root.toString()).toContain('--tw-ring-offset-width:0.5rem')

    const unchanged = postcss.decl({ prop: 'width', value: '10px' })
    expect(convertTailwindcssRpxDeclarationToRem(unchanged)).toBe(false)
    expect(normalizeTailwindcssWebRpxDeclarations(postcss.parse('.a{width:10px}'))).toBe(false)
  })
})
