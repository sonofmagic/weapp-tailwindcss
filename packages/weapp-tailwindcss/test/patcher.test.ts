import { createPatch, getInstalledPkgJsonPath } from '@/tailwindcss/patcher'

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

  it('patch warning', () => {
    const patch = createPatch({
      units: ['rpx'],
      dangerousOptions: {
        // @ts-ignore
        lengthUnitsFilePath: 12_354,
        // @ts-ignore
        overwrite: 'false',
      },
    })
    expect(patch()).toBe(undefined)
  })

  // it('patch snap', () => {
  //   // const patch = createPatch({
  //   //   units: ['rpx'],
  //   //   dangerousOptions: {
  //   //     gteVersion: '3.0.0',
  //   //     packageName: 'tailwindcss'
  //   //   }
  //   // })
  //   // expect(patch()).toMatchSnapshot()
  // })
})
