import { describe, expect, it } from 'vitest'
import { createStyleHandler } from '@/handler'

describe('unitsToPx', () => {
  it('keeps units when disabled', async () => {
    const styleHandler = createStyleHandler({
      unitsToPx: false,
    })

    const { css } = await styleHandler('.a{margin:2rem;padding:2rpx}', {
      isMainChunk: true,
    })

    expect(css).toContain('2rem')
    expect(css).toContain('2rpx')
  })

  it('converts units to px when enabled', async () => {
    const styleHandler = createStyleHandler({
      unitsToPx: true,
    })

    const { css } = await styleHandler('.a{margin:2rem;padding:2rpx}', {
      isMainChunk: true,
    })

    expect(css).toContain('32px')
    expect(css).toContain('1px')
    expect(css).not.toContain('2rem')
    expect(css).not.toContain('2rpx')
  })

  it('preserves custom unitMap and transform fallback behavior', async () => {
    const styleHandler = createStyleHandler({
      unitsToPx: {
        unitMap: [
          ['rem', null],
          ['rpx', false],
          [/^x$/, 4],
        ],
        transform: value => value * 10,
      },
    })

    const { css } = await styleHandler('.a{margin:2rem;padding:2rpx;top:3x}', {
      isMainChunk: true,
    })

    expect(css).toContain('20px')
    expect(css).toContain('2rpx')
    expect(css).toContain('12px')
  })

  it('keeps all units when transform is disabled', async () => {
    const styleHandler = createStyleHandler({
      unitsToPx: {
        transform: false,
      },
    })

    const { css } = await styleHandler('.a{margin:2rem;padding:2rpx}', {
      isMainChunk: true,
    })

    expect(css).toContain('2rem')
    expect(css).toContain('2rpx')
  })
})
