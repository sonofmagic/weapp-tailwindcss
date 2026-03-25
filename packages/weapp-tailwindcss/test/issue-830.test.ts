import { getCompilerContext } from '@/context'

const SOURCE = `page,
:root {
  --spacing: 8rpx;
}
.mt-12 {
  margin-top: calc(var(--spacing) * 12);
}
`

describe('issue #830', () => {
  it('reproduces tailwind v4 spacing fallback output that still keeps the calc declaration', async () => {
    const ctx = getCompilerContext({
      cssCalc: true,
    })

    const { css } = await ctx.styleHandler(SOURCE, {
      isMainChunk: true,
    })

    expect(css).toContain('margin-top: 96rpx;')
    expect(css).toContain('margin-top: calc(var(--spacing)*12);')
  })

  it('can remove the spacing calc declaration via cssCalc includeCustomProperties config', async () => {
    const ctx = getCompilerContext({
      cssCalc: {
        includeCustomProperties: ['--spacing'],
      },
    })

    const { css } = await ctx.styleHandler(SOURCE, {
      isMainChunk: true,
    })

    expect(css).toContain('margin-top: 96rpx;')
    expect(css).not.toContain('margin-top: calc(var(--spacing)*12);')
  })
})
