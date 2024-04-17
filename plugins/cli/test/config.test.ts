import path from 'node:path'
import fs from 'fs-extra'
import { fixturesPath } from './utils'
import { createConfigLoader, initConfig } from '@/config'

describe('config', () => {
  it('load js config', () => {
    const root = path.resolve(fixturesPath, 'configs/js')
    const configLoader = createConfigLoader(root)
    const s = configLoader.search()
    delete s?.config.root
    expect(s?.config).toMatchSnapshot()
  })

  it('load ts config', () => {
    const root = path.resolve(fixturesPath, 'configs/ts')
    const configLoader = createConfigLoader(root)
    const s = configLoader.search()
    delete s?.config.root
    expect(s?.config).toMatchSnapshot()
  })

  it('load nothing', () => {
    const root = path.resolve(fixturesPath, 'configs/nothing')
    const configLoader = createConfigLoader(root)
    const s = configLoader.search()
    delete s?.config.root
    expect(s?.config).toMatchSnapshot()
  })

  it('init js config', () => {
    const root = path.resolve(fixturesPath, 'configs-output/js')
    const p = initConfig({
      root
    })
    expect(fs.existsSync(p)).toBe(true)
    const configLoader = createConfigLoader(root)
    const s = configLoader.search()
    delete s?.config.root
    expect(s?.config).toMatchSnapshot()
  })

  it('init ts config', () => {
    const root = path.resolve(fixturesPath, 'configs-output/ts')
    const p = initConfig({
      root,
      lang: 'ts'
    })
    expect(fs.existsSync(p)).toBe(true)
    const configLoader = createConfigLoader(root)
    const s = configLoader.search()
    delete s?.config.root
    expect(s?.config).toMatchSnapshot()
  })
})
