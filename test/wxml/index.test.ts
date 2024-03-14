import { wxmlCasePath, createGetCase } from '../util'
import { getOptions } from '@/options'

const getCase = createGetCase(wxmlCasePath)

describe('wxml', () => {
  it('mpx style single quote', async () => {
    const code = await getCase('mpx-style.wxml')
    const { templateHandler } = getOptions()
    const res = await templateHandler(code)
    expect(res).toBe(code)
  })

  it('mpx style single double', async () => {
    const code = await getCase('mpx-style-1.wxml')
    const { templateHandler } = getOptions()
    const res = await templateHandler(code)
    expect(res).toBe(code)
  })
})
