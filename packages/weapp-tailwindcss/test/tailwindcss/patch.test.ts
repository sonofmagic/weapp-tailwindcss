import path from 'node:path'
import { getInstalledPkgJsonPath, internalPatch } from '@/tailwindcss/patcher'
import { findAstNode } from '@/tailwindcss/supportCustomUnit'
import { createGetCase, tailwindcssCasePath } from '#test/util'

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
const getCase = createGetCase(tailwindcssCasePath)

describe('tailwindcss source code patch', () => {
  it('getInstalledPkgJsonPath case 0', () => {
    // @ts-ignore
    const p = getInstalledPkgJsonPath(supportCustomLengthUnitsPatch)
    expect(p).toContain('tailwindcss')
    expect(p).toContain('node_modules')
  })

  it('findAstNode case 0', async () => {
    // @ts-ignore
    const content = await getCase(supportCustomLengthUnitsPatch.dangerousOptions.lengthUnitsFilePath)
    // @ts-ignore
    const { arrayRef, changed } = findAstNode(content, supportCustomLengthUnitsPatch)
    expect(arrayRef).toBeTruthy()
    expect(changed).toBe(true)
  })

  it('findAstNode case 1', async () => {
    // @ts-ignore
    const content = await getCase('dataTypes.js')
    // @ts-ignore
    const { arrayRef, changed } = findAstNode(content, supportCustomLengthUnitsPatch)
    expect(arrayRef).toBeTruthy()
    expect(changed).toBe(false)
  })

  it.skip('internalPatch case 0', () => {
    const opt = supportCustomLengthUnitsPatch
    opt.dangerousOptions.overwrite = false
    const code = internalPatch(path.resolve(tailwindcssCasePath, 'package.json'), opt)
    expect(code).toMatchSnapshot()
  })
})
