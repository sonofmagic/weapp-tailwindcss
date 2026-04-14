import { describe, expect, it } from 'vitest'
import {
  EMPTY_SIGNAL,
  FULL_SIGNAL,
  probeFeatures,
  signalToCacheKey,
} from '@/content-probe'

describe('content probe', () => {
  describe('probeFeatures', () => {
    it('空字符串返回全 false', () => {
      const signal = probeFeatures('')
      expect(signal).toEqual({
        hasModernColorFunction: false,
        hasPresetEnvFeatures: false,
      })
    })

    it('不包含任何特征的简单 CSS 返回全 false', () => {
      const css = '.container { color: red; font-size: 14px; }'
      const signal = probeFeatures(css)
      expect(signal).toEqual({
        hasModernColorFunction: false,
        hasPresetEnvFeatures: false,
      })
    })

    it('包含 rgb(r g b / a) 的 CSS 返回 hasModernColorFunction: true', () => {
      const css = '.box { color: rgb(255 0 0 / 0.5); }'
      const signal = probeFeatures(css)
      expect(signal.hasModernColorFunction).toBe(true)
    })

    it('包含 rgba 空格分隔写法也返回 hasModernColorFunction: true', () => {
      const css = '.box { color: rgba(100 200 50 / 1); }'
      const signal = probeFeatures(css)
      expect(signal.hasModernColorFunction).toBe(true)
    })

    it('传统逗号分隔的 rgb() 不触发 hasModernColorFunction', () => {
      const css = '.box { color: rgb(255, 0, 0); }'
      const signal = probeFeatures(css)
      expect(signal.hasModernColorFunction).toBe(false)
    })

    it('包含 :is() 的 CSS 返回 hasPresetEnvFeatures: true', () => {
      const css = ':is(.a, .b) { color: red; }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('包含 oklab() 的 CSS 返回 hasPresetEnvFeatures: true', () => {
      const css = '.box { color: oklab(0.5 0.1 -0.1); }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('包含 oklch() 的 CSS 返回 hasPresetEnvFeatures: true', () => {
      const css = '.box { color: oklch(0.7 0.15 180); }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('包含 color-mix() 的 CSS 返回 hasPresetEnvFeatures: true', () => {
      const css = '.box { color: color-mix(in srgb, red, blue); }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('包含 @layer 的 CSS 返回 hasPresetEnvFeatures: true', () => {
      const css = '@layer base { .a { color: red; } }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('包含 color() 的 CSS 返回 hasPresetEnvFeatures: true', () => {
      const css = '.box { color: color(display-p3 1 0 0); }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('注释中包含特征关键字时仍返回 true（允许误报）', () => {
      const css = '/* color-mix(in srgb, red, blue) */ .box { color: red; }'
      const signal = probeFeatures(css)
      expect(signal.hasPresetEnvFeatures).toBe(true)
    })

    it('注释中包含现代颜色函数时仍返回 true（允许误报）', () => {
      const css = '/* rgb(255 0 0 / 0.5) */ .box { color: red; }'
      const signal = probeFeatures(css)
      expect(signal.hasModernColorFunction).toBe(true)
    })
  })

  describe('signalToCacheKey', () => {
    it('对不同信号产生不同键', () => {
      const keys = new Set([
        signalToCacheKey({ hasModernColorFunction: false, hasPresetEnvFeatures: false }),
        signalToCacheKey({ hasModernColorFunction: true, hasPresetEnvFeatures: false }),
        signalToCacheKey({ hasModernColorFunction: false, hasPresetEnvFeatures: true }),
        signalToCacheKey({ hasModernColorFunction: true, hasPresetEnvFeatures: true }),
      ])
      expect(keys.size).toBe(4)
    })

    it('相同信号产生相同键', () => {
      const a = signalToCacheKey({ hasModernColorFunction: true, hasPresetEnvFeatures: false })
      const b = signalToCacheKey({ hasModernColorFunction: true, hasPresetEnvFeatures: false })
      expect(a).toBe(b)
    })
  })

  describe('常量', () => {
    it('FULL_SIGNAL 所有标志均为 true', () => {
      expect(FULL_SIGNAL).toEqual({
        hasModernColorFunction: true,
        hasPresetEnvFeatures: true,
      })
    })

    it('EMPTY_SIGNAL 所有标志均为 false', () => {
      expect(EMPTY_SIGNAL).toEqual({
        hasModernColorFunction: false,
        hasPresetEnvFeatures: false,
      })
    })
  })
})
