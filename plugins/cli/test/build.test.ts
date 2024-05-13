import path from 'node:path'
import { fixturesPath } from './utils'
import { build } from '@/build'

describe.skip('build', () => {
  it('native', async () => {
    const nativePath = path.resolve(fixturesPath, 'native')
    const { globsSet } = await build({
      root: nativePath,
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
