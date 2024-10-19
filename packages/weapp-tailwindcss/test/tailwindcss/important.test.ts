import { getOptions } from '@/options'
// @ts-ignore
// import isPseudoClass from '@csstools/postcss-is-pseudo-class'
import { getCss } from '../helpers/getTwCss'

describe('important', () => {
  it('normal', async () => {
    const { css } = await getCss([
      'space-x-4',
    ], {
      // postcssPlugins: [isPseudoClass()],
      twConfig: {
        // important: '#app-provider',
      },
    })
    expect(css).toMatchSnapshot()
    const { styleHandler } = getOptions()
    const res = await styleHandler(css, { isMainChunk: true })
    expect(res.css).toMatchSnapshot()
  })
  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/470', async () => {
    const { css } = await getCss([
      'space-x-4',
    ], {
      // postcssPlugins: [isPseudoClass()],
      twConfig: {
        important: '#app-provider',
      },
    })
    expect(css).toMatchSnapshot()
    const { styleHandler } = getOptions()
    const res = await styleHandler(css, { isMainChunk: true })
    expect(res.css).toMatchSnapshot()
  })
})
