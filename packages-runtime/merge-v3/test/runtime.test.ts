import { describe, expect, it } from 'vitest'
import {
  create,
  tailwindMergeVersion,
  twMerge,
  weappTwIgnore,
} from '@/index'

describe('merge-v3 runtime exports', () => {
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

  it('accepts boolean escape/unescape options', () => {
    const { twMerge: rawTwMerge } = create({ escape: true, unescape: true })

    expect(rawTwMerge('text-[#ececec]', 'text-[#ECECEC]')).toBe('text-_b_hECECEC_B')
  })

  it('treats rpx arbitrary values as lengths for color-like utilities', () => {
    expect(twMerge('text-red', 'text-[80rpx]')).toBe('text-red text-_b80rpx_B')
    expect(twMerge('border-red-500', 'border-[10rpx]')).toBe('border-red-500 border-_b10rpx_B')
    expect(twMerge('bg-red-500', 'bg-[6rpx]')).toBe('bg-red-500 bg-_b6rpx_B')
    expect(twMerge('outline-red-500', 'outline-[4rpx]')).toBe('outline-red-500 outline-_b4rpx_B')
    expect(twMerge('ring-red-500', 'ring-[12rpx]')).toBe('ring-red-500 ring-_b12rpx_B')
  })

  it('deduplicates repeated rpx overrides per prefix', () => {
    expect(twMerge('text-[4rpx]', 'text-[2rpx]', 'text-[1rpx]')).toBe('text-_b1rpx_B')
    expect(twMerge('border-[6rpx]', 'border-[8rpx]', 'border-[2rpx]', 'border-blue-500')).toBe(
      'border-_b2rpx_B border-blue-500',
    )
    expect(twMerge('bg-[6rpx]', 'bg-[12rpx]', 'bg-[8rpx]', 'bg-green-500')).toBe(
      'bg-_b8rpx_B bg-green-500',
    )
    expect(twMerge('outline-[10rpx]', 'outline-[4rpx]', 'outline-[1rpx]')).toBe('outline-_b1rpx_B')
    expect(twMerge('ring-[10rpx]', 'ring-[4rpx]', 'ring-[8rpx]', 'ring-red-500')).toBe(
      'ring-_b8rpx_B ring-red-500',
    )
  })
})
