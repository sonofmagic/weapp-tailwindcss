import { describe, expect, it } from 'vitest'
import { normalizeCssSnapshot } from './snapshotUtils'

describe('normalizeCssSnapshot', () => {
  it('removes scanner noise utilities even when class list contains them', () => {
    expect(normalizeCssSnapshot([
      ':host { --spacing: 8rpx; }',
      '.start { left: var(--spacing); }',
      '.end { right: var(--spacing); }',
      '.border-bs { border-top-width: 1px; }',
      '.border-be { border-bottom-width: 1px; }',
      '.text-_b45rpx_B { font-size: 45rpx; }',
    ].join('\n'), {
      classList: ['start', 'end', 'border-bs', 'border-be', 'text-_b45rpx_B'],
    })).toBe([
      ':host { --spacing: 8rpx; }',
      '.text-_b45rpx_B { font-size: 45rpx; }',
    ].join('\n'))
  })
})
