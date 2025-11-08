import { describe, expect, it } from 'vitest'
import { create } from '@/index'

describe('merge-v3 factory options', () => {
  it('can disable final escaping while keeping unescape enabled', () => {
    const { twMerge: rawMerge } = create({ escape: false })

    expect(rawMerge('text-[#ECECEC]')).toBe('text-[#ECECEC]')
    expect(rawMerge('text-_b_hececec_B')).toBe('text-[#ececec]')
  })

  it('can disable unescape to opt out of normalization', () => {
    const { twMerge: strictMerge } = create({ unescape: false })

    expect(strictMerge('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-_b_hececec_B')
  })

  it('can disable both escape and unescape for complete pass-through', () => {
    const { twMerge: passthrough } = create({ escape: false, unescape: false })

    expect(passthrough('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-[#ececec]')
  })
})
