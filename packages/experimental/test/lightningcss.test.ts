import { Buffer } from 'node:buffer'
import { transform } from 'lightningcss'
import { getFixture } from './utils'

// https://lightningcss.dev/transpilation.html
// https://github.com/vitejs/vite/blob/b135918b91e8381c50bd2d076d40e9a65fe68bfe/packages/vite/src/node/plugins/css.ts#L2163
// https://github.com/vitejs/vite/blob/b135918b91e8381c50bd2d076d40e9a65fe68bfe/packages/plugin-legacy/src/index.ts#L227
// https://github.com/vitejs/vite/blob/b135918b91e8381c50bd2d076d40e9a65fe68bfe/packages/vite/src/node/plugins/css.ts#L2122
describe('lightningcss', () => {
  it('base', async () => {
    const { code } = await transform({
      code: Buffer.from(await getFixture('base.css')),
      filename: 'style.css',
      targets: {
        chrome: 61,
      },
    })
    expect(code.toString()).toMatchSnapshot()
  })

  it('components', async () => {
    const { code } = await transform({
      code: Buffer.from(await getFixture('components.css')),
      filename: 'style.css',
      targets: {
        chrome: 61,
      },
    })
    expect(code.toString()).toMatchSnapshot()
  })
})
