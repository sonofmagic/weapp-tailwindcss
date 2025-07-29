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
})
