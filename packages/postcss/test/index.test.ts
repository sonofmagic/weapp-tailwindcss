import tailwindcss from '@tailwindcss/postcss'
import { postcssRemoveComment } from '@weapp-tailwindcss/test-helper'
import path from 'pathe'
import postcss from 'postcss'
import { createStyleHandler } from '@/index'

function generateCss(css: string, base: string) {
  return postcss([
    tailwindcss({
      base,
    }),
    postcssRemoveComment,
  ])
    .process(css, {
      from: './index.ts',
    })
}

describe('index', () => {
  it('keeps :host in transformed root scope for main chunk', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(':root{--x:1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('page,.tw-root,wx-root-portal-content,:host{--x:1;}')
  })

  it('keeps :host in transformed root scope for uni-app x main chunk', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const { css } = await styleHandler(':root{--x:1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('page,.tw-root,wx-root-portal-content,:host{--x:1;}')
  })

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
