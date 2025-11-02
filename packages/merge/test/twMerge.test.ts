import { vi } from 'vitest'
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
  it('should ', () => {
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0_d5')
    expect(twMerge('text-[34px]', 'text-[#ececec]')).toBe('text-_b34px_B text-_b_hececec_B')
    expect(twMerge('text-[34px]', 'text-[#ECECEC]')).toBe('text-_b34px_B text-_b_hECECEC_B')
    expect(twMergeV4('text-[34px]', 'text-[#ECECEC]')).toBe('text-_b34px_B text-_b_hECECEC_B')
    expect(twMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0_d5 text-_b34px_B text-_b_hececec_B')
    expect(twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0_d5 text-_b34px_B text-_b_hececec_B')
  })
})

describe('factory options', () => {
  it('honours custom escapeFn when provided', () => {
    const escapeFn = vi.fn((value: string) => `__${value}__`)
    const { twMerge: customTwMerge } = createV3({ escapeFn })

    expect(customTwMerge('text-[#ececec]')).toBe('__text-[#ececec]__')
    expect(escapeFn).toHaveBeenCalledWith('text-[#ececec]')
  })

  it('skips escaping when disableEscape is true', () => {
    const { twMerge: rawMerge } = createV3({ disableEscape: true })

    expect(rawMerge('text-[#ECECEC]')).toBe('text-[#ECECEC]')
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

  it('supports custom escapeFn', () => {
    const escapeFn = vi.fn((value: string) => `__${value}__`)
    const { cva: customCva } = createCva({ escapeFn })
    const badge = customCva('text-[#ECECEC]')

    expect(badge()).toBe('__text-[#ECECEC]__')
    expect(escapeFn).toHaveBeenCalledWith('text-[#ECECEC]')
  })

  it('can disable escaping entirely', () => {
    const { cva: plainCva } = createCva({ disableEscape: true })
    const tag = plainCva('text-[#ECECEC]')

    expect(tag()).toBe('text-[#ECECEC]')
  })
})
