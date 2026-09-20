import { logger } from '@weapp-tailwindcss/logger'
import * as css from '@weapp-tailwindcss/postcss/transform'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { collectRpxThemeRiskSources, shouldCheckRpxThemeRisk, warnRpxThemeRisk } from '@/tailwindcss/v4/rpx-theme-warning'

describe('rpx theme warning policy', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs() })

  it.each(['mp-weixin', 'weapp', 'wx', 'weixin'])('enables known WeChat platform %s', (platform) => {
    expect(shouldCheckRpxThemeRisk({}, 'weapp', { platform })).toBe(true)
  })

  it.each(['mp-alipay', 'mp-toutiao', 'app-android', 'h5'])('skips other platform %s', (platform) => {
    expect(shouldCheckRpxThemeRisk({}, 'weapp', { platform })).toBe(false)
  })

  it('honors output target and log level before inspecting CSS', () => {
    expect(shouldCheckRpxThemeRisk({}, 'web', { platform: 'mp-weixin' })).toBe(false)
    for (const logLevel of ['silent', 'error'] as const) {
      expect(shouldCheckRpxThemeRisk({}, 'weapp', { platform: 'mp-weixin', logLevel })).toBe(false)
    }
    vi.stubEnv('UNI_PLATFORM', 'mp-weixin')
    expect(shouldCheckRpxThemeRisk({}, 'weapp', {})).toBe(true)
    expect(shouldCheckRpxThemeRisk({}, 'weapp', { platform: 'mp-alipay' })).toBe(false)
  })

  it('deduplicates identical source CSS and session warnings before output parsing', () => {
    const collect = vi.spyOn(css, 'collectRpxThemeVariables')
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const session = {}
    const source = '@theme { --spacing: 3rpx }'
    const variables = collectRpxThemeRiskSources([source, source])
    expect(collect).toHaveBeenCalledTimes(1)
    warnRpxThemeRisk(session, variables, '.a { width: calc(var(--spacing) * 8) }')
    const inspect = vi.spyOn(css, 'inspectRpxCalcUsage')
    warnRpxThemeRisk(session, variables, '.a { width: 24rpx }')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('仍含运行时 calc：--spacing')
    expect(inspect).not.toHaveBeenCalled()
    expect(shouldCheckRpxThemeRisk(session, 'weapp', { platform: 'mp-weixin' })).toBe(false)
  })

  it('distinguishes inline expressions, static values, and unknown output', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    warnRpxThemeRisk({}, ['--gap'], '.a { width: calc(3rpx * 8) }')
    expect(warn.mock.lastCall?.[0]).toContain('内联 rpx')
    warnRpxThemeRisk({}, ['--gap'], '.a { width: 24rpx }')
    expect(warn.mock.lastCall?.[0]).toContain('未检测到相关运行时 calc')
    warnRpxThemeRisk({}, ['--gap'], '.a { width: calc(3rpx * 8)')
    expect(warn.mock.lastCall?.[0]).toContain('无法完成诊断')
  })
})
