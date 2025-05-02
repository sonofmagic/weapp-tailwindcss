import { createStyleHandler } from '@/index'
import tailwindcss from '@tailwindcss/postcss'
// import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'

function generateCss(base: string) {
  return postcss([
    tailwindcss({
      base,
    }),
  ])
    .process('@import "weapp-tailwindcss";', {
      from: './index.ts',
    })
}

describe('issues', () => {
  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/631', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/631'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/632', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/632'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/638', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/638'))
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
