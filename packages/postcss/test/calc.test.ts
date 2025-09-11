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

  it('rpx 运算', async () => {
    const code = `.a{ width: calc(100rpx + 100rpx); height: calc(100 * 100rpx);width: calc(68rpx * 4);height: calc(4 * 17rpx);width: calc(68 * 4rpx);height: calc(4rpx * 17);}`

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
      // cssPresetEnv: {
      //   features: {
      //     'custom-properties': {
      //       preserve: true,
      //     },
      //   },
      // },
    })
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it('rpx + root 变量运算', async () => {
    const code = `:root{--ch:2}; .a{ width: calc(var(--ch) * 1rpx);}`

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
      cssPresetEnv: {
        features: {
          'custom-properties': {
            preserve: true,
          },
        },
      },
    })
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it('rpx + root 变量运算去除', async () => {
    const code = `:root{--ch:2}; .a{ width: calc(var(--ch) * 1rpx);}`

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
      cssPresetEnv: {
        features: {
          'custom-properties': {
            preserve: false,
          },
        },
      },
    })
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it('px 转化 + root 变量运算去除', async () => {
    const code = `:root{--ch:2}; .a{ width: calc(var(--ch) * 1px);}`

    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
      px2rpx: true,
    })
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })
})
