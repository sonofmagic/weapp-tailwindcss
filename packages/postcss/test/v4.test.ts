import { styleHandler } from '@/index'
import fs from 'fs-extra'
import path from 'pathe'

describe('v4', () => {
  it('vite', async () => {
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-vite.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('postcss', async () => {
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-postcss.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
})
