import { transform } from 'esbuild'
import { getFixture } from './utils'

function getCss(input: string | Uint8Array) {
  return transform(input, {
    loader: 'css',
    target: [
      // 'es2020',
      'chrome58',
      // 'edge16',
      // 'firefox57',
      // 'node12',
      // 'safari11',
    ],
  })
}

describe('esbuild', () => {
  it('base', async () => {
    const { code } = await getCss(await getFixture('base.css'))
    expect(code).toMatchSnapshot()
  })

  it('components', async () => {
    const { code } = await getCss(await getFixture('components.css'))
    expect(code).toMatchSnapshot()
  })
})
