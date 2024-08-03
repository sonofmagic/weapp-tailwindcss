import path from 'pathe'
import { diff } from 'just-diff'
import { createFilter } from 'vite'
import { defaultExcluded, getProjectConfig, isAppRoot, scanEntries, searchAppEntry } from '@/utils'

function getFilter(cwd: string) {
  return createFilter([], [...defaultExcluded, path.resolve(cwd, 'dist/**')])
}

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

  describe('searchAppEntry', () => {
    it.each(absDirs)('$name', ({ path: p, name }) => {
      if (name.includes('-ts')) {
        expect(searchAppEntry(path.resolve(p, 'miniprogram'))).toBeTruthy()
      }
      else {
        expect(searchAppEntry(p)).toBeTruthy()
      }
    })
  })

  function normalizeScanEntries(result: Awaited<ReturnType<typeof scanEntries>>) {
    return {
      app: path.normalize(result?.app ?? ''),
      pages: [...result?.pages ?? []].map(x => path.normalize(x)),
      components: [...result?.components ?? []].map(x => path.normalize(x)),
      // css: result?.css.map(x => path.normalize(x)),
    }
  }
  describe('scanEntries', () => {
    it.each(absDirs)('$name', async ({ path: p, name }) => {
      if (name.includes('-ts')) {
        const cwd = path.resolve(p, 'miniprogram')
        expect(normalizeScanEntries(await scanEntries(cwd, { relative: true, filter: getFilter(cwd) }))).toMatchSnapshot()
      }
      else {
        expect(normalizeScanEntries(await scanEntries(p, { relative: true, filter: getFilter(p) }))).toMatchSnapshot()
      }
    })
  })
})
