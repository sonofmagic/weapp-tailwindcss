import path from 'pathe'
import { createStyleHandler } from '@/handler'
import { generateCss } from './utils'

describe('calc', () => {
  it('case 0', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssCalc: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('case 1', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
      cssPresetEnv: {
        features: {
          'custom-properties': true,
        },
      },
      cssCalc: {
        mediaQueries: true,
        precision: 5,
        preserve: false,
        selectors: true,
      },
    })
    expect(css).toMatchSnapshot()
  })

  it('case 2', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
      cssCalc: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('case 3', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/calc'))

    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
      cssCalc: true,
      rem2rpx: true,
    })
    expect(css).toMatchSnapshot()
  })
})
