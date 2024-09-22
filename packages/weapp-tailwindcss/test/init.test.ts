import { init } from '@/init'
import path from 'pathe'
import { fixturesRootPath } from './util'

describe('init', () => {
  it('common', async () => {
    await init({
      cwd: path.resolve(fixturesRootPath, 'init/common'),
      pkgJsonBasename: 'package.test.json',
    })
  })

  it('esm', async () => {
    await init({
      cwd: path.resolve(fixturesRootPath, 'init/esm'),
      pkgJsonBasename: 'package.test.json',
    })
  })

  it('no-pkg-json', async () => {
    await init({
      cwd: path.resolve(fixturesRootPath, 'init/no-pkg-json'),
      pkgJsonBasename: 'package.test.json',
    })
  })
})
