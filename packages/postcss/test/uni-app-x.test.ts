import { createStyleHandler } from '@/index'
import fs from 'fs-extra'
import path from 'pathe'

describe('uni-appx', () => {
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
})
