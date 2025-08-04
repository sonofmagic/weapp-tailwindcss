import tailwindcss from '@tailwindcss/postcss'
import path from 'pathe'
import postcss from 'postcss'
import { createStyleHandler } from '@/index'

function generateCss(css: string, base: string) {
  return postcss([
    tailwindcss({
      base,
    }),
  ])
    .process(css, {
      from: './index.ts',
    })
}

describe('index', () => {
  it('only utilities', async () => {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/calc-keyword
    const code = await generateCss('@import "weapp-tailwindcss";', path.resolve(__dirname, './fixtures/main'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
})
