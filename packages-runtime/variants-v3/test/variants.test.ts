import { describe, expect, it } from 'vitest'
import {
  cn,
  cnBase,
  create,
  createTV,
  defaultConfig,
  tv,
} from '@/index'

describe('variants-v3 runtime', () => {
  it('escapes tv output by default', () => {
    const button = tv({
      base: 'text-[#ececec]',
      variants: {
        tone: {
          accent: 'bg-[#ECECEC]',
        },
      },
    })

    expect(button()).toBe('text-_b_hececec_B')
    expect(button({ tone: 'accent' })).toBe('text-_b_hececec_B bg-_b_hECECEC_B')
  })

  it('deduplicates escaped classes', () => {
    const button = tv({
      base: 'text-_b_hececec_B',
      variants: {
        tone: {
          accent: 'text-[#ececec]',
        },
      },
    })

    expect(button({ tone: 'accent' })).toBe('text-_b_hececec_B')
  })

  it('escapes rpx units and color literals inside tv output', () => {
    const stack = tv({
      base: 'text-[24rpx] bg-[#0f0]',
      variants: {
        tone: {
          danger: 'text-[#FF0000] text-[32rpx]',
        },
      },
    })

    const baseOutput = stack()?.split(' ')
    expect(new Set(baseOutput)).toEqual(new Set(['text-_b24rpx_B', 'bg-_b_h0f0_B']))

    const variantOutput = stack({ tone: 'danger' })?.split(' ')
    expect(new Set(variantOutput)).toEqual(new Set([
      'text-_b32rpx_B',
      'bg-_b_h0f0_B',
      'text-_b_hFF0000_B',
    ]))
  })

  it('supports custom transformers through create', () => {
    const { tv: rawTv } = create({ escape: false })
    const badge = rawTv({ base: 'text-[#ececec]' })

    expect(badge()).toBe('text-[#ececec]')
  })

  it('accepts boolean escape/unescape options', () => {
    const { tv: rawTv } = create({ escape: true, unescape: true })
    const badge = rawTv({ base: 'text-[#ececec]' })

    expect(badge()).toBe('text-_b_hececec_B')
  })

  it('respects disabled escape/unescape options in runtime factory', () => {
    const runtime = create({ escape: false, unescape: false })
    const badge = runtime.tv({
      base: 'text-[#ECECEC]',
      variants: {
        tone: {
          accent: 'text-[#101010]',
        },
      },
    })

    expect(badge({ tone: 'accent' })).toBe('text-[#101010]')

    const aggregate = runtime.cn('text-[#ECECEC]', 'text-[#101010]')
    expect(aggregate()).toBe('text-[#101010]')
    expect(aggregate({ twMerge: false })).toBe('text-[#ECECEC] text-[#101010]')

    const mergedTv = runtime.tv({
      base: 'text-[#101010]',
      variants: {
        tone: {
          accent: 'text-[#ECECEC]',
        },
      },
    })
    expect(mergedTv({ tone: 'accent' })).toBe('text-[#ECECEC]')
  })

  it('wraps cn aggregation with merge + escaping', () => {
    const aggregate = cn('text-[#ececec]', 'text-[#ECECEC]')

    expect(aggregate()).toBe('text-_b_hECECEC_B')
    expect(aggregate({ twMerge: false })).toBe('text-_b_hececec_B text-_b_hECECEC_B')
  })

  it('escapes cnBase results', () => {
    expect(cnBase('text-[#ececec]', 'bg-[#101010]')).toBe('text-_b_hececec_B bg-_b_h101010_B')
  })

  it('re-exports default config unchanged', () => {
    expect(defaultConfig.twMerge).toBe(true)
  })

  it('creates isolated tv instances via createTV', () => {
    const makeTv = createTV({
      twMerge: true,
    })
    const button = makeTv({
      base: 'text-[#ececec]',
    })

    expect(button()).toBe('text-_b_hececec_B')
  })
})
