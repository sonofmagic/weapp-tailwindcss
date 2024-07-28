import path from 'node:path'
import { diff } from 'just-diff'
import { findAppEntry, getProjectConfig, isAppRoot, scanEntries } from '@/utils'

describe('utils', () => {
  const appsDir = path.resolve(__dirname, '../../../apps')
  function getApp(app: string) {
    return path.resolve(appsDir, app)
  }
  const dirs = [
    'native',
    'native-skyline',
    'native-ts',
    'native-ts-skyline',
    'vite-native',
    'vite-native-skyline',
    'vite-native-ts',
    'vite-native-ts-skyline',
  ]

  const absDirs = dirs.map((x) => {
    return {
      name: x,
      path: getApp(x),
    }
  })
  describe('getProjectConfig', () => {
    it.each(absDirs)('$name', ({ path: p }) => {
      expect(diff(
        getProjectConfig(p, { ignorePrivate: true }),
        getProjectConfig(p),
      )).toMatchSnapshot()
    })
  })

  describe('isAppRoot', () => {
    it.each(absDirs)('$name', ({ path: p, name }) => {
      if (name.includes('-ts')) {
        expect(isAppRoot(path.resolve(p, 'miniprogram'))).toBe(true)
      }
      else {
        expect(isAppRoot(p)).toBe(true)
      }
    })
  })

  describe('findAppEntry', () => {
    it.each(absDirs)('$name', ({ path: p, name }) => {
      if (name.includes('-ts')) {
        expect(findAppEntry(path.resolve(p, 'miniprogram'))).toBeTruthy()
      }
      else {
        expect(findAppEntry(p)).toBeTruthy()
      }
    })
  })

  describe('scanEntries', () => {
    it.each(absDirs)('$name', async ({ path: p, name }) => {
      if (name.includes('-ts')) {
        expect(await scanEntries(path.resolve(p, 'miniprogram'), { relative: true })).toMatchSnapshot()
      }
      else {
        expect(await scanEntries(p, { relative: true })).toMatchSnapshot()
      }
    })
  })
})
