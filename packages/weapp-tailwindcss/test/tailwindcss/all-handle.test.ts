import { getOptions } from '@/options'
import path from 'pathe'
import { getCss } from '../helpers/getTwCss'

describe('all', () => {
  const contentPath = path.resolve(__dirname, '../../../tailwindcss-core-plugins-extractor/src/**/*.ts')

  it('common handle', async () => {
    const { styleHandler } = getOptions()
    const { css } = await getCss([contentPath], {
      css: `@tailwind base;@tailwind components;@tailwind utilities;`,
      isContentGlob: true,
    })
    expect((await styleHandler(css, { isMainChunk: true })).css).toMatchSnapshot()
  })
})