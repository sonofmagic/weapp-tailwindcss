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
})
