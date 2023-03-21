import { getInstalledPkgJsonPath, internalPatch } from '@/tailwindcss/patcher'
import { findAstNode } from '@/tailwindcss/supportCustomUnit'
import { tailwindcssCasePath, createGetCase } from '#test/util'
import { getOptions } from '@/defaults'
import path from 'path'
import type { ILengthUnitsPatchOptions } from '@/types'
const getCase = createGetCase(tailwindcssCasePath)
describe('tailwindcss source code patch', () => {
  it('getInstalledPkgJsonPath case 0', () => {
    const options = getOptions()
    // @ts-ignore
    const p = getInstalledPkgJsonPath(options.supportCustomLengthUnitsPatch)
    expect(p).toContain('tailwindcss')
    expect(p).toContain('node_modules')
  })

  it('findAstNode case 0', async () => {
    const options = getOptions()
    // @ts-ignore
    const content = await getCase(options.supportCustomLengthUnitsPatch.dangerousOptions.lengthUnitsFilePath)
    // @ts-ignore
    const { arrayRef, changed } = findAstNode(content, options.supportCustomLengthUnitsPatch)
    expect(arrayRef).toBeTruthy()
    expect(changed).toBe(true)
  })

  it('findAstNode case 1', async () => {
    const options = getOptions()
    // @ts-ignore
    const content = await getCase('dataTypes.js')
    // @ts-ignore
    const { arrayRef, changed } = findAstNode(content, options.supportCustomLengthUnitsPatch)
    expect(arrayRef).toBeTruthy()
    expect(changed).toBe(false)
  })

  it.skip('internalPatch case 0', () => {
    const options = getOptions()

    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const code = internalPatch(path.resolve(tailwindcssCasePath, 'package.json'), opt)
    expect(code).toMatchSnapshot()
  })

  it('patch lts', () => {
    const options = getOptions()
    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const res = internalPatch(path.resolve(tailwindcssCasePath, 'versions/lts/package.json'), opt, false)
    expect(res).toMatchSnapshot()
  })
  it('patch 3.2.7', () => {
    const options = getOptions()
    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const res = internalPatch(path.resolve(tailwindcssCasePath, 'versions/3.2.7/package.json'), opt, false)
    expect(res).toMatchSnapshot()
  })

  it('patch 3.2.6', () => {
    const options = getOptions()
    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const res = internalPatch(path.resolve(tailwindcssCasePath, 'versions/3.2.6/package.json'), opt, false)
    expect(res).toMatchSnapshot()
  })

  it('patch 3.2.4', () => {
    const options = getOptions()
    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const res = internalPatch(path.resolve(tailwindcssCasePath, 'versions/3.2.4/package.json'), opt, false)
    expect(res).toMatchSnapshot()
  })

  it('patch 3.2.3', () => {
    const options = getOptions()
    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const res = internalPatch(path.resolve(tailwindcssCasePath, 'versions/3.2.3/package.json'), opt, false)
    expect(res).toMatchSnapshot()
  })

  it('patch 3.0.0', () => {
    const options = getOptions()
    const opt = options.supportCustomLengthUnitsPatch as Required<ILengthUnitsPatchOptions>
    opt.dangerousOptions.overwrite = false
    const res = internalPatch(path.resolve(tailwindcssCasePath, 'versions/3.0.0/package.json'), opt, false)
    expect(res).toMatchSnapshot()
  })
})
