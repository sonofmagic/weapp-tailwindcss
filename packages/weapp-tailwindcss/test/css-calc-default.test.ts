import { getCompilerContext } from '@/context'

const SOURCE = `page,
:root {
  --spacing: 8rpx;
}
.icon {
  --svg: url("data:image/svg+xml,AAA");
  mask-image: var(--svg);
  width: calc(var(--spacing) * 2);
}
`

describe('cssCalc defaults', () => {
  it('does not expand custom properties when cssCalc is not configured', async () => {
    const ctx = getCompilerContext()

    const { css } = await ctx.styleHandler(SOURCE, {
      isMainChunk: true,
    })

    expect(css).toContain('--svg: url("data:image/svg+xml,AAA");')
    expect(css).toContain('-webkit-mask-image: var(--svg);')
    expect(css).toContain('mask-image: var(--svg);')
    expect(css).not.toContain('-webkit-mask-image: url(')
    expect(css).not.toContain('mask-image: url(')
    expect(css).toContain('width: calc(var(--spacing) * 2);')
    expect(css).not.toContain('width: 16rpx;')
  })

  it('keeps custom property and calc expansion available through explicit opt-in', async () => {
    const ctx = getCompilerContext({
      cssOptions: {
        cssCalc: true,
      },
    })

    const { css } = await ctx.styleHandler(SOURCE, {
      isMainChunk: true,
    })

    expect(css).toContain('-webkit-mask-image: url("data:image/svg+xml,AAA");')
    expect(css).toContain('mask-image: url("data:image/svg+xml,AAA");')
    expect(css).toContain('-webkit-mask-image: var(--svg);')
    expect(css).toContain('mask-image: var(--svg);')
    expect(css).toContain('width: 16rpx;')
    expect(css).toContain('width: calc(var(--spacing)*2);')
  })
})
