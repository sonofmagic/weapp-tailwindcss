import { describe, expect, it } from 'vitest'
import { createRpxLengthTransform } from '@/rpx-length'

describe('createRpxLengthTransform', () => {
  const transform = createRpxLengthTransform()

  it('returns original string when no rpx values are present', () => {
    expect(transform.prepareValue('text-red')).toBe('text-red')
    expect(transform.restoreValue('text-red')).toBe('text-red')
  })

  it('normalizes and restores rpx values for configured prefixes', () => {
    const prepared = transform.prepareValue('text-red text-[20rpx] border-[5rpx] text-[30rpx]')

    expect(typeof prepared).toBe('object')
    if (typeof prepared === 'string') {
      throw new TypeError('expected metadata')
    }

    expect(prepared.value).toBe('text-red text-[length:20rpx] border-[length:5rpx] text-[length:30rpx]')

    const restored = transform.restoreValue(prepared.value, prepared.metadata)
    expect(restored).toBe('text-red text-[20rpx] border-[5rpx] text-[30rpx]')
  })

  it('respects metadata counts when restoring repeated placeholders', () => {
    const prepared = transform.prepareValue('text-[4rpx] text-[4rpx]')
    if (typeof prepared === 'string') {
      throw new TypeError('expected metadata')
    }

    const onceRestored = transform.restoreValue('text-[length:4rpx]', prepared.metadata)
    expect(onceRestored).toBe('text-[4rpx]')
  })

  it('skips metadata entries whose counts reach zero', () => {
    const prepared = transform.prepareValue('text-[8rpx]')
    if (typeof prepared === 'string') {
      throw new TypeError('expected metadata')
    }
    prepared.metadata.replacements['text-[length:8rpx]'] = 0
    expect(transform.restoreValue(prepared.value, prepared.metadata)).toBe(prepared.value)
  })
})
