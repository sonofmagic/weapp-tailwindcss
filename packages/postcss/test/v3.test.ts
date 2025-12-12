import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

describe('v3', () => {
  it('v3', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v3.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v3.out.css'), css, 'utf8')
  })

  it('v3 case 0', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v3.css'), 'utf8')
    const res = await styleHandler(code, {
      isMainChunk: true,
      postcssOptions: {
        options: {
          map: {
            inline: false,
            from: 'xxx.css',
          },

        },
      },
    })
    expect(res.css).toMatchSnapshot()
    // expect(res.map.toString().includes('sourceMappingURL=data:application/json;base64')).toBe(true)
    expect(res.map).toMatchSnapshot()
  })

  it('v3 uni-app x', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v3.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v3.uni-app-x.css'), css, 'utf8')
  })

  it('v3 bbb', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `
    .divide-dashed > :not([hidden]) ~ :not([hidden]) {
}
.ttt > :not(template) ~ :not(template) {
}

    `
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    // fs.writeFile(path.resolve(__dirname, './fixtures/css/v3.out.css'), css, 'utf8')
  })

  it('recovers misparsed arbitrary rpx values in jit', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `
.border-_b10rpx_B { border-style: var(--tw-border-style); border-color: 10rpx; }
.text-_b32rpx_B { color: 32rpx; }
.bg-_b10rpx_B { background-color: 10rpx; }
.outline-_b5rpx_B { outline-color: 5rpx; }
.ring-_b8rpx_B { --tw-ring-color: 8rpx; }
`
    const { css } = await styleHandler(code, {
      isMainChunk: true,
      majorVersion: 3,
    })

    expect(css).toContain('border-width: 10rpx')
    expect(css).not.toContain('border-color: 10rpx')
    expect(css).toContain('font-size: 32rpx')
    expect(css).not.toContain('color: 32rpx')
    expect(css).toContain('background-size: 10rpx')
    expect(css).not.toContain('background-color: 10rpx')
    expect(css).toContain('outline-width: 5rpx')
    expect(css).not.toContain('outline-color: 5rpx')
    expect(css).toContain('--tw-ring-offset-width: 8rpx')
    expect(css).not.toContain('--tw-ring-color: 8rpx')
  })
})
