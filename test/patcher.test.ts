import fs from 'node:fs'
import { mkCacheDirectory, getInstalledPkgJsonPath, createPatch } from '@/tailwindcss/patcher'

describe('patcher unit test', () => {
  it('if will create cache directory', () => {
    const p = mkCacheDirectory()
    expect(fs.existsSync(p)).toBe(true)
  })

  it('not found pkg', () => {
    const res = getInstalledPkgJsonPath({
      dangerousOptions: {
        packageName: 'faketailwindcss'
      },
      units: ['rpx']
    })
    expect(res).toBe(undefined)
  })

  it('patch warning', () => {
    const patch = createPatch({
      units: ['rpx'],
      dangerousOptions: {
        // @ts-ignore
        lengthUnitsFilePath: 12_354,
        // @ts-ignore
        overwrite: 'false'
      }
    })
    expect(patch()).toBe(undefined)
  })
})
