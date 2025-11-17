import { describe, expect, it } from 'vitest'
import { cn } from '@/index'

describe('variants snapshot', () => {
  it('preserves rpx lengths when merging classes', () => {
    const merged = cn('text-red text-[80rpx]')
    expect(merged()).toMatchInlineSnapshot('"text-red text-_b80rpx_B"')
  })

  it('deduplicates rpx overrides across prefixes when using cn helper', () => {
    const merged = cn('text-[4rpx]', 'text-[8rpx]', 'border-[6rpx]', 'border-[2rpx]')
    expect(merged()).toMatchInlineSnapshot('"text-_b8rpx_B border-_b2rpx_B"')
  })
})
