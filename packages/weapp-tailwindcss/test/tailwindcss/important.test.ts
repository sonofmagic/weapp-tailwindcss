import { getCompilerContext } from '@/context'
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
    const { styleHandler } = getCompilerContext()
    const res = await styleHandler(css, { isMainChunk: true, cssChildCombinatorReplaceValue: ['view'] })
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
    const { styleHandler } = getCompilerContext()
    const res = await styleHandler(css, { isMainChunk: true, cssChildCombinatorReplaceValue: ['view'] })
    expect(res.css).toMatchSnapshot()
  })

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/470 case 0', async () => {
    const { css } = await getCss([
      'space-x-4',
    ], {
      // postcssPlugins: [isPseudoClass()],
      twConfig: {
        important: '.app-provider',
      },
    })
    expect(css).toMatchSnapshot()
    const { styleHandler } = getCompilerContext()
    const res = await styleHandler(css, { isMainChunk: true, cssChildCombinatorReplaceValue: ['view'] })
    expect(res.css).toMatchSnapshot()
  })

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/470 case 1', async () => {
    const { css } = await getCss([
      'space-x-4',
    ], {
      // postcssPlugins: [isPseudoClass()],
      twConfig: {
        important: '.app-provider[data-v-hash]',
      },
    })
    expect(css).toMatchSnapshot()
    const { styleHandler } = getCompilerContext()
    const res = await styleHandler(css, { isMainChunk: true, cssChildCombinatorReplaceValue: ['view'] })
    expect(res.css).toMatchSnapshot()
  })
})
