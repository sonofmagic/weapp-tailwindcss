import { getInstalledPkgJsonPath } from '@/tailwindcss/patcher'

const supportCustomLengthUnitsPatch = {
  units: ['rpx'],
  dangerousOptions: {
    gteVersion: '3.0.0',
    lengthUnitsFilePath: 'lib/util/dataTypes.js',
    packageName: 'tailwindcss',
    variableName: 'lengthUnits',
    overwrite: true,
  },
}

describe('tailwindcss source code patch', () => {
  it('getInstalledPkgJsonPath case 0', () => {
    // @ts-ignore
    const p = getInstalledPkgJsonPath(supportCustomLengthUnitsPatch)
    expect(p).toContain('tailwindcss')
    expect(p).toContain('node_modules')
  })
})
