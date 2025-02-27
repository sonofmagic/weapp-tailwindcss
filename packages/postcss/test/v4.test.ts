import { createStyleHandler } from '@/index'
import fs from 'fs-extra'
import path from 'pathe'

describe('v4', () => {
  it('vite', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-vite.css'), 'utf8')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it('postcss', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-postcss.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('v4', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.out.css'), css, 'utf8')
  })

  it('v4 space-y-*', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `
      :where(.space-y-0 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 0) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 0) * calc(1 - var(--tw-space-y-reverse)));
  }
    `
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('v4 space-y-* case 2', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssChildCombinatorReplaceValue: ['view', 'text'],
    })
    const code = `
:where(.space-y-0 > :not(:last-child)) {}
    `
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('--tw-gradient-position', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `.bg-gradient-to-b:not(n):not(n):not(n) {
    --tw-gradient-position: to bottom in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }
.bg-gradient-to-t:not(n):not(n):not(n) {
    --tw-gradient-position: to top in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }
.bg-gradient-to-tr:not(n):not(n):not(n) {
    --tw-gradient-position: to top right in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }`
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
})
