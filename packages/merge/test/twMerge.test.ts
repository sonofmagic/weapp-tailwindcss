import { create as createCva, cva } from '@/cva'
import {
  create as createV3,
  tailwindMergeVersion as tailwindMergeV3Version,
  twMerge,
} from '@/v3'
import {
  tailwindMergeVersion as tailwindMergeV4Version,
  twMerge as twMergeV4,
} from '@/v4'

describe('v3', () => {
  it('merges tailwind classes and escapes the output', () => {
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0_d5')
    expect(twMerge('text-[34px]', 'text-[#ececec]')).toBe('text-_b34px_B text-_b_hececec_B')
    expect(twMerge('text-[34px]', 'text-[#ECECEC]')).toBe('text-_b34px_B text-_b_hECECEC_B')
    expect(twMergeV4('text-[34px]', 'text-[#ECECEC]')).toBe('text-_b34px_B text-_b_hECECEC_B')
    expect(twMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0_d5 text-_b34px_B text-_b_hececec_B')
    expect(twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0_d5 text-_b34px_B text-_b_hececec_B')
  })

  it('normalizes already escaped class tokens before merging', () => {
    expect(twMerge('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-_b_hececec_B')
    expect(twMerge('text-_b_hECECEC_B', 'text-_b_hececec_B')).toBe('text-_b_hececec_B')
    expect(twMergeV4('text-_b_hececec_B', 'text-[#ECECEC]')).toBe('text-_b_hECECEC_B')
  })
})

describe('factory options', () => {
  it('can disable final escaping while keeping unescape enabled', () => {
    const { twMerge: rawMerge } = createV3({ escape: false })

    expect(rawMerge('text-[#ECECEC]')).toBe('text-[#ECECEC]')
    expect(rawMerge('text-_b_hececec_B')).toBe('text-[#ececec]')
  })

  it('can disable unescape to opt out of normalization', () => {
    const { twMerge: strictMerge } = createV3({ unescape: false })

    expect(strictMerge('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-_b_hececec_B')
  })

  it('can disable both escape and unescape for complete pass-through', () => {
    const { twMerge: passthrough } = createV3({ escape: false, unescape: false })

    expect(passthrough('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-[#ececec]')
  })
})

describe('version metadata', () => {
  it('exposes tailwind-merge major version numbers', () => {
    expect(tailwindMergeV3Version).toBe(2)
    expect(tailwindMergeV4Version).toBe(3)
  })
})

describe('cva integration', () => {
  it('applies escaping by default', () => {
    const button = cva('text-[#ECECEC]')

    expect(button()).toBe('text-_b_hECECEC_B')
  })

  it('can disable escaping entirely', () => {
    const { cva: plainCva } = createCva({ escape: false, unescape: false })
    const tag = plainCva('text-[#ECECEC]')

    expect(tag()).toBe('text-[#ECECEC]')
  })
})
