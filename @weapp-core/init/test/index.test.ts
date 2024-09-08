import { initConfig, initViteConfigFile, updatePackageJson, updateProjectConfig } from '@/index'
import fs from 'fs-extra'
import path from 'pathe'

const appsDir = path.resolve(__dirname, '../../../apps')
const fixturesDir = path.resolve(__dirname, './fixtures')
describe('index', () => {
  it.each(['vite-native', 'vite-native-skyline', 'vite-native-ts', 'vite-native-ts-skyline'])('%s', (name) => {
    const root = path.resolve(appsDir, name)
    const p0 = path.resolve(fixturesDir, name, 'package.json')
    updatePackageJson({ root, dest: p0, command: 'weapp-vite' })
    const p1 = path.resolve(fixturesDir, name, 'project.config.json')
    updateProjectConfig({ root, dest: p1 })
    expect(fs.existsSync(p0)).toBe(true)
    expect(fs.existsSync(p1)).toBe(true)
  })

  it.each(['vite-native', 'vite-native-skyline', 'vite-native-ts', 'vite-native-ts-skyline'])('%s callback', (name) => {
    const root = path.resolve(appsDir, name)
    const p0 = path.resolve(fixturesDir, name, 'package0.json')
    const res0 = updatePackageJson({
      root,
      dest: p0,
      command: 'weapp-vite',
      write: false,
      cb(set) {
        set('type', 'module')
      },
    })
    expect(res0).toMatchSnapshot()
    const p1 = path.resolve(fixturesDir, name, 'project0.config.json')
    const res1 = updateProjectConfig({ root, dest: p1, write: false })
    expect(res1).toMatchSnapshot()
    expect(fs.existsSync(p0)).toBe(false)
    expect(fs.existsSync(p1)).toBe(false)
  })

  it.each(['vite-native', 'vite-native-skyline', 'vite-native-ts', 'vite-native-ts-skyline'])('%s vite.config.ts', (name) => {
    const root = path.resolve(appsDir, name)
    const res0 = initViteConfigFile({
      root,
      write: false,
    })
    expect(res0).toMatchSnapshot()
  })

  it.each(['vite-native', 'vite-native-skyline', 'vite-native-ts', 'vite-native-ts-skyline', 'cjs', 'no-pkg-json'])('%s vite.config.ts', (name) => {
    const root = path.resolve(fixturesDir, name)
    const res = initConfig({
      root,
      command: 'weapp-vite',
    })
    expect(res).toBeTruthy()
  })
})
