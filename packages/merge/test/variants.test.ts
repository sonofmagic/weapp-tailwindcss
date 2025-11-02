import { describe, expect, it } from 'vitest'
import {
  cn,
  cnBase,
  createTV,
  create as createVariants,
  defaultConfig,
  tv,
} from '@/variants'

describe('variants runtime', () => {
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

  it('supports custom transformers through create', () => {
    const { tv: rawTv } = createVariants({ escape: false })
    const badge = rawTv({ base: 'text-[#ececec]' })

    expect(badge()).toBe('text-[#ececec]')
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
