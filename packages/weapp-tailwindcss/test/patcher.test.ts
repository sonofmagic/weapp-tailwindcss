import { getInstalledPkgJsonPath } from '@/tailwindcss/patcher'

describe('patcher unit test', () => {
  it('not found pkg', () => {
    const res = getInstalledPkgJsonPath({
      dangerousOptions: {
        packageName: 'faketailwindcss',
      },
      units: ['rpx'],
    })
    expect(res).toBe(undefined)
  })

  it('found pkg', () => {
    const res = getInstalledPkgJsonPath({
      dangerousOptions: {
        packageName: 'tailwindcss',
      },
      units: ['rpx'],
    })
    expect(res).toBeTruthy()
    const isStr = typeof res === 'string'
    expect(isStr).toBe(true)
    isStr && expect(res.length > 0).toBe(true)
  })
})
