import { getInstalledPkgJsonPath } from '@/tailwindcss/patcher'

describe('patcher unit test', () => {
  it('not found pkg', () => {
    const res = getInstalledPkgJsonPath()
    expect(res).toBeTruthy()
  })

  it('found pkg', () => {
    const res = getInstalledPkgJsonPath()
    expect(res).toBeTruthy()
    const isStr = typeof res === 'string'
    expect(isStr).toBe(true)
    isStr && expect(res.length > 0).toBe(true)
  })
})
