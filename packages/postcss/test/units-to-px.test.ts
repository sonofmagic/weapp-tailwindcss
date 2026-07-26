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

  it('converts units in uni-app x uvue output without leaving infinity calc values', async () => {
    const styleHandler = createStyleHandler({
      appType: 'uni-app-x',
      majorVersion: 4,
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
      uniAppXUnsupported: 'warn',
      unitsToPx: true,
    })

    const result = await styleHandler(
      '.rounded-full{border-radius:calc(infinity * 1px)}.a{margin:2rem;padding:2rpx;width:10vw}',
      { isMainChunk: true },
    )

    expect(result.css).toContain('border-radius:9999px')
    expect(result.css).toContain('margin:32px')
    expect(result.css).toContain('padding:1px')
    expect(result.css).toContain('width:37.5px')
    expect(result.css).not.toContain('calc(infinity')
    expect(result.warnings()).toEqual([])
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
