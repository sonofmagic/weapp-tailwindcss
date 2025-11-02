import { describe, expect, it } from 'vitest'
import {
  create,
  tailwindMergeVersion,
  twMerge,
  weappTwIgnore,
} from '@/v3'

describe('v3 runtime exports', () => {
  it('provides preconfigured twMerge for tailwind-merge v2', () => {
    expect(twMerge('text-[#ececec]', 'text-[#ECECEC]')).toBe('text-_b_hECECEC_B')
  })

  it('reports the underlying tailwind-merge major version', () => {
    expect(tailwindMergeVersion).toBe(2)
  })

  it('shares the weappTwIgnore helper', () => {
    expect(weappTwIgnore`\tfoo`).toBe('\\tfoo')
  })

  it('respects factory options when creating a runtime', () => {
    const { twMerge: rawTwMerge } = create({ escape: false })

    expect(rawTwMerge('text-[#ececec]')).toBe('text-[#ececec]')
  })
})
