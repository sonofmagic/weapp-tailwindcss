import path from 'node:path'
import { createConfigLoader, initConfig, updatePackageJson, updateProjectConfig } from '@/config'
import fs from 'fs-extra'
import { fixturesPath } from './utils'

describe.skip('config', () => {
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

  describe('initConfig', () => {
    it('init js config', () => {
      const root = path.resolve(fixturesPath, 'configs-output/js')
      const p = initConfig({
        root,
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
        lang: 'ts',
      })
      expect(fs.existsSync(p)).toBe(true)
      const configLoader = createConfigLoader(root)
      const s = configLoader.search()
      delete s?.config.root
      expect(s?.config).toMatchSnapshot()
    })

    it('init js config with tsconfig', () => {
      const root = path.resolve(fixturesPath, 'configs-output/js-tsconfig')
      const p = initConfig({
        root,
      })
      expect(fs.existsSync(p)).toBe(true)
      const configLoader = createConfigLoader(root)
      const s = configLoader.search()
      delete s?.config.root
      expect(s?.config).toMatchSnapshot()
    })

    it('init ts config with tsconfig', () => {
      const root = path.resolve(fixturesPath, 'configs-output/ts-tsconfig')
      const p = initConfig({
        root,
        lang: 'ts',
      })
      expect(fs.existsSync(p)).toBe(true)
      const configLoader = createConfigLoader(root)
      const s = configLoader.search()
      delete s?.config.root
      expect(s?.config).toMatchSnapshot()
    })
  })

  describe('updateProjectConfig', () => {
    it('updateProjectConfig js native project', async () => {
      const root = path.resolve(fixturesPath, 'configs/json/js')
      const target = path.resolve(root, 'output.json')
      updateProjectConfig({
        root,
        dest: target,
      })
      expect(fs.existsSync(target)).toBe(true)
      const res = await import(target)
      expect(res.default).toMatchSnapshot()
    })

    it('updateProjectConfig js native configed project', async () => {
      const root = path.resolve(fixturesPath, 'configs/json/js-configed')
      const target = path.resolve(root, 'output.json')
      updateProjectConfig({
        root,
        dest: target,
      })
      expect(fs.existsSync(target)).toBe(true)
      const res = await import(target)
      expect(res.default).toMatchSnapshot()
    })
  })

  describe('updatePackageJson', () => {
    it('updatePackageJson js native project', async () => {
      const root = path.resolve(fixturesPath, 'configs/js')
      const target = path.resolve(root, 'pkg.json')
      updatePackageJson({
        root,
        dest: target,
      })
      expect(fs.existsSync(target)).toBe(true)
      const res = await import(target)
      expect(res.default).toMatchSnapshot()
    })

    it('updatePackageJson ts native project', async () => {
      const root = path.resolve(fixturesPath, 'configs/ts')
      const target = path.resolve(root, 'pkg.json')
      updatePackageJson({
        root,
        dest: target,
      })
      expect(fs.existsSync(target)).toBe(true)
      const res = await import(target)
      expect(res.default).toMatchSnapshot()
    })
  })
})
