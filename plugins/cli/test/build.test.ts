import path from 'node:path'
import { fixturesPath } from './utils'
import { build } from '@/build'

describe('build', () => {
  it('native', async () => {
    const nativePath = path.resolve(fixturesPath, 'native')
    await build({
      root: nativePath
    })
    expect(true).toBe(true)
  })
})
