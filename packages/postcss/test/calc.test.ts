import path from 'pathe'
import { createStyleHandler } from '@/handler'
import { generateCss } from './utils'

describe('calc', () => {
  it('默认的情况', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))
    expect(code.css).toMatchSnapshot()
  })

  it('设置 cssCalc true', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })

  it('传入 cssCalc 配置', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: {
        mediaQueries: true,
        precision: 5,
        preserve: false,
        selectors: true,
      },
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })

  it('同时确保 custom-properties 也开启', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })

  it('cssCalc 和 rem2rpx 同时开启', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
      rem2rpx: true,
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })

  it('custom-properties 设置 preserve 为 true', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssPresetEnv: {
        features: {
          'custom-properties': {
            preserve: true,
          },
        },
      },
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })
})
