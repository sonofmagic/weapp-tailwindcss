import path from 'pathe'
import { getCompilerContext } from '@/context'
import { getCss } from '../helpers/getTwCss'

describe('all', () => {
  const contentPath = path.resolve(__dirname, '../../../tailwindcss-core-plugins-extractor/src/**/*.ts')

  it('common important handle', async () => {
    const { styleHandler } = getCompilerContext()
    const { css } = await getCss([contentPath], {
      css: `@tailwind base;@tailwind components;@tailwind utilities;`,
      isContentGlob: true,
      twConfig: {
        important: '.app',
      },
    })
    expect((await styleHandler(css, { isMainChunk: true, cssChildCombinatorReplaceValue: ['view'] })).css).toMatchSnapshot()
  })
})
