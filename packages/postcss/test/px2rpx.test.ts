import path from 'pathe'
import { createStyleHandler } from '@/handler'
import { generateCss } from './utils'

describe('px2rpx', () => {
  it('case 0', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/px2rpx'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      px2rpx: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('case 1', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/px2rpx'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      px2rpx: {
        designWidth: 375,
      },
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
})
