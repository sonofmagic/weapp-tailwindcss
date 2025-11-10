import { describe, expect, it } from 'vitest'
import {
  create,
  tailwindMergeVersion,
  twMerge,
  weappTwIgnore,
} from '@/index'

describe('v4 runtime exports', () => {
  it('provides preconfigured twMerge for tailwind-merge v3', () => {
    expect(twMerge('text-[#ececec]', 'text-[#ECECEC]')).toBe('text-_b_hECECEC_B')
  })

  it('tracks the underlying tailwind-merge major version', () => {
    expect(tailwindMergeVersion).toBe(3)
  })

  it('forwards template literals to weappTwIgnore helper', () => {
    expect(weappTwIgnore`\n  foo\n`).toBe('\\n  foo\\n')
  })

  it('supports runtime factory options', () => {
    const { twMerge: rawTwMerge } = create({ escape: false })

    expect(rawTwMerge('text-[#ececec]')).toBe('text-[#ececec]')
  })
})
