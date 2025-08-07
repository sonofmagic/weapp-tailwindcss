import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'
import { generateCss } from './utils'

async function compose(base: string) {
  const styleHandler = createStyleHandler({
    isMainChunk: true,
  })
  const { css: code } = await generateCss(
    path.resolve(__dirname, base),
    {
      css: await fs.readFile(path.resolve(__dirname, base, './index.css'), 'utf8'),
    },
  )
  expect(code).toMatchSnapshot()
  const { css } = await styleHandler(code)
  expect(css).toMatchSnapshot()
}

describe('compose', () => {
  it('components 0', async () => {
    await compose('./fixtures/css/compose-0')
  })

  it('no components 0', async () => {
    await compose('./fixtures/css/compose-1')
  })
})
