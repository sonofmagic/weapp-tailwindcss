import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

describe('uni-app', () => {
  it('postcss', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/uni-app.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })
})
