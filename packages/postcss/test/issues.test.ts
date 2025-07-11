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
})
