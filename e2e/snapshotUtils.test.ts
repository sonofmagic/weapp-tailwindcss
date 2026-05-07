import { describe, expect, it } from 'vitest'
import { normalizeCssSnapshot } from './snapshotUtils'

describe('normalizeCssSnapshot', () => {
  it('removes scanner noise utilities without a class list', () => {
    expect(normalizeCssSnapshot([
      ':host { --spacing: 8rpx; }',
      '/*$vite$:1*/',
      '.start { left: var(--spacing); }',
      '.end { right: var(--spacing); }',
      '.border-bs { border-top-width: 1px; }',
      '.border-be { border-bottom-width: 1px; }',
      '.text-_b45rpx_B { font-size: 45rpx; }',
    ].join('\n'))).toBe([
      ':host { --spacing: 8rpx; }',
      '.text-_b45rpx_B { font-size: 45rpx; }',
    ].join('\n'))
  })

  it('removes scanner noise utilities even when class list contains them', () => {
    expect(normalizeCssSnapshot([
      ':host { --spacing: 8rpx; }',
      '/*$vite$:1*/',
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

  it('removes fallback declarations before equivalent var declarations', () => {
    expect(normalizeCssSnapshot([
      '.rounded-md {',
      '  border-radius: 12rpx;',
      '  border-radius: var(--radius-md);',
      '}',
      '.border-b-_b4rpx_B {',
      '  border-bottom-style: var(--tw-border-style);',
      '  border-bottom-width: 4rpx;',
      '}',
    ].join('\n'))).toBe([
      '.rounded-md {',
      '  border-radius: var(--radius-md);',
      '}',
      '.border-b-_b4rpx_B {',
      '  border-bottom-width: 4rpx;',
      '}',
    ].join('\n'))
  })
})
