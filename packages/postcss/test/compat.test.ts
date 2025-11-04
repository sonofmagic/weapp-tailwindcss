import { createStyleHandler } from '@/index'

describe('compat', () => {
  it('styleHandler calc', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssPresetEnv: {
        features: {
          'custom-properties': true,
          'nested-calc': true,
        },
        // browsers: ['defaults'],
      },
    })
    const { css } = await styleHandler(`
:root{
--spacing: 8rpx;
--radius-3xl: 48rpx;
--radius-4xl: calc(var(--spacing) * 8);
}`,
    )
    expect(css).toMatchSnapshot()
  })

  it('downgrades modern rgb syntax via preset env defaults', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(`
.a{
  color: rgb(245 247 255 / var(--tw-bg-opacity));
  background: rgb(59 130 246 / 0.5);
}
`)
    expect(css).toContain('color: rgba(245, 247, 255, var(--tw-bg-opacity));')
    expect(css).toContain('background: rgba(59, 130, 246, 0.5);')
  })
})
