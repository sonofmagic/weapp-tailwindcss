import path from 'node:path'
import { build } from '@/build'
import tailwindcss from 'tailwindcss'
import { fixturesPath } from './utils'

describe.skip('build', () => {
  it('native', async () => {
    const nativePath = path.resolve(fixturesPath, 'native')
    const { globsSet } = await build({
      root: nativePath,
      postcssOptions: {
        plugins: [tailwindcss({
          config: path.join(nativePath, 'tailwind.config.js'),
        })],
      },
    })
    expect(globsSet).toMatchSnapshot()
  })

  it('native-ts', async () => {
    const nativePath = path.resolve(fixturesPath, 'native-ts')
    const { globsSet } = await build({
      root: nativePath,
      src: 'miniprogram',
    })
    expect(globsSet).toMatchSnapshot()
  })
})
