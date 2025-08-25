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
})
