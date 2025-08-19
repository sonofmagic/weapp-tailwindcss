import tailwindcss from '@tailwindcss/postcss'
import { postcssRemoveComment } from '@weapp-tailwindcss/test-helper'
// import fs from 'fs-extra'
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

describe('utilities', () => {
  it('only utilities', async () => {
    const code = await generateCss('@import "weapp-tailwindcss/utilities";', path.resolve(__dirname, './fixtures/utilities'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('utilities + theme', async () => {
    const code = await generateCss('@import "weapp-tailwindcss/theme";@import "weapp-tailwindcss/utilities";', path.resolve(__dirname, './fixtures/utilities'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('utilities + theme + rgb', async () => {
    const code = await generateCss('@import "weapp-tailwindcss/theme";@import "weapp-tailwindcss/css/rgb.css";@import "weapp-tailwindcss/utilities";', path.resolve(__dirname, './fixtures/utilities'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('utilities + custom theme', async () => {
    const code = await generateCss(`@theme default {
      --spacing: 0.25rem;};@import "weapp-tailwindcss/utilities";`, path.resolve(__dirname, './fixtures/utilities'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('only theme', async () => {
    const code = await generateCss('@import "weapp-tailwindcss/theme";', path.resolve(__dirname, './fixtures/utilities'))
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
