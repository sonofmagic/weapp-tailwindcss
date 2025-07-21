import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

describe('uni-app-x', () => {
  it('css', async () => {
    const styleHandler = createStyleHandler({
      // uniAppX: true,
    })
    const { css } = await styleHandler(
      await fs.readFile(
        path.resolve(__dirname, './fixtures/css/uni-app-x.css'),
        'utf8',
      ),
      {
        isMainChunk: true,
      },
    )
    expect(css).toMatchSnapshot('css')
  })

  it('app.uvue?vue&type=style&index=0&lang.css', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
    })
    const { css } = await styleHandler(
      await fs.readFile(
        path.resolve(__dirname, './fixtures/css/App.uvue?vue&type=style&index=0&lang.css'),
        'utf8',
      ),
      {
        isMainChunk: true,
      },
    )
    expect(css).toMatchSnapshot('css')
  })
})
