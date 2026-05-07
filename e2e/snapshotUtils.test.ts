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

  it('normalizes Tailwind CSS v4 default token output differences', () => {
    expect(normalizeCssSnapshot([
      ':host {',
      '  --spacing: 8rpx;',
      '  --color-gray-200: rgb(229, 231, 235);',
      '  --color-gray-400: rgb(153, 161, 175);',
      '  --blur: 8rpx;',
      '  --drop-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);',
      '  --radius: 8rpx;',
      '  --backdrop-blur: 8rpx;',
      '}',
      '.rounded {',
      '  border-radius: var(--radius);',
      '}',
      '.blur {',
      '  --tw-blur: blur(var(--blur));',
      '}',
      '.outline {',
      '  outline-width: 3rpx;',
      '}',
      '.ring {',
      '  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6));',
      '}',
    ].join('\n'))).toBe([
      ':host {',
      '  --spacing: 8rpx;',
      '}',
      '.rounded {',
      '  border-radius: 8rpx;',
      '}',
      '.blur {',
      '  --tw-blur: blur(8rpx);',
      '}',
      '.outline {',
      '  outline-width: 1rpx;',
      '}',
      '.ring {',
      '  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);',
      '}',
    ].join('\n'))
  })
})
