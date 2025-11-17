import { describe, expect, it } from 'vitest'
import { twMerge } from '@/index'

describe('twMerge snapshot', () => {
  it('keeps rpx lengths when mixed with color utilities', () => {
    expect(twMerge('text-red text-[80rpx]')).toMatchInlineSnapshot('"text-red text-_b80rpx_B"')
  })
})
