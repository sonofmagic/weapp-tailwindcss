import { describe, expect, it } from 'vitest'
import { create, cva } from '@/index'

describe('cva runtime', () => {
  it('escapes the generated class list by default', () => {
    const button = cva('text-[#ececec]')

    expect(button()).toBe('text-_b_hececec_B')
  })

  it('keeps simple class lists unchanged after escaping', () => {
    const button = cva('w-full rounded-full bg-success p-1')

    expect(button()).toBe('w-full rounded-full bg-success p-1')
  })

  it('supports disabling the final escape stage', () => {
    const { cva: rawCva } = create({ escape: false })
    const badge = rawCva('text-[#ececec]')

    expect(badge()).toBe('text-[#ececec]')
  })

  it('accepts boolean escape/unescape options', () => {
    const { cva: rawCva } = create({ escape: true, unescape: true })
    const badge = rawCva('text-[#ececec]')

    expect(badge()).toBe('text-_b_hececec_B')
  })

  it('normalizes escaped classes before evaluating variants', () => {
    const badge = cva('text-_b_hececec_B', {
      variants: {
        tone: {
          accent: 'text-[#ececec]',
        },
      },
    })

    expect(badge({ tone: 'accent' })).toBe('text-_b_hececec_B text-_b_hececec_B')
  })

  it('respects custom mapping options', () => {
    const { cva: customCva } = create({
      escape: {
        map: {
          '#': '__hash__',
        },
      },
    })

    const badge = customCva('text-[#ececec]')

    expect(badge()).toBe('text-_b__hash__ececec_B')
  })

  it('returns empty output without caching or escaping work', () => {
    const { cva: rawCva } = create({
      escape: {
        map: {
          ' ': '__space__',
        },
      },
    })
    const empty = rawCva()

    expect(empty()).toBe('')
  })

  it('reuses cached escaped values and evicts oldest entries when the cache is full', () => {
    const badge = cva('', {
      variants: {
        index: Object.fromEntries(
          Array.from({ length: 257 }, (_, index) => [`v${index}`, `text-[${index}rpx]`]),
        ),
      },
    })

    expect(badge({ index: 'v0' } as never)).toBe('text-_b0rpx_B')
    expect(badge({ index: 'v0' } as never)).toBe('text-_b0rpx_B')

    for (let index = 1; index <= 256; index++) {
      expect(badge({ index: `v${index}` } as never)).toBe(`text-_b${index}rpx_B`)
    }

    expect(badge({ index: 'v0' } as never)).toBe('text-_b0rpx_B')
  })
})
