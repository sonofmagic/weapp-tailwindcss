import { postcssRemoveComment } from '@weapp-tailwindcss/test-helper'
import autoprefixer from 'autoprefixer'
// import tailwindcss from '@tailwindcss/postcss'
// import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'
import { createStyleHandler } from '@/index'

async function generateCss(base: string, plugins: readonly postcss.AcceptedPlugin[] = []) {
  const tailwindcss = (await import('@tailwindcss/postcss')).default
  return await postcss([
    ...plugins,
    tailwindcss({
      base,
    }),
    postcssRemoveComment,

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

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/638 case 0', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/638-0'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/643', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/643'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/652', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/652'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/695', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/695'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
  // https://developer.mozilla.org/en-US/docs/Web/CSS/calc-keyword
  it('https://github.com/sonofmagic/weapp-tailwindcss/issues/695 taro rpx case', async () => {
    const code = `.rounded-full {
  border-radius: calc(infinity * 1rpx);
}
`

    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('space-x-number', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/space-x-number'), [autoprefixer({
      add: true,
      env: 'ie 11',
    })])
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('cssSelectorReplacement case 0', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/space-x-number'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssSelectorReplacement: {
        root: ['page', 'wx-root-content'],
      },
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })

  it('custom case 0', async () => {
    const code = await generateCss(path.resolve(__dirname, './fixtures/issues/custom'))
    expect(code.css).toMatchSnapshot()
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(code.css)
    expect(css).toMatchSnapshot()
  })
})
