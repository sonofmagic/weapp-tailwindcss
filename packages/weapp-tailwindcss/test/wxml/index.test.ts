import { getCompilerContext } from '@/context'
import { createGetCase, wxmlCasePath } from '../util'

const getCase = createGetCase(wxmlCasePath)

describe('wxml', () => {
  it('mpx style single quote', async () => {
    const code = await getCase('mpx-style.wxml')
    const { templateHandler } = getCompilerContext()
    const res = await templateHandler(code)
    expect(res).toBe(code)
  })

  it('mpx style single double', async () => {
    const code = await getCase('mpx-style-1.wxml')
    const { templateHandler } = getCompilerContext()
    const res = await templateHandler(code)
    expect(res).toBe(code)
  })

  it('weapp-vite case 0', async () => {
    const code = await getCase('weapp-vite-case0.wxml')
    const { templateHandler } = getCompilerContext()
    const res = await templateHandler(code)
    expect(res).toBe(`<view class="bg-_h7d7ac2_ text-_100px_ text-_h123456_ {{true?'h-_30px_':'h-_45px_'}}">111</view>`)
  })
})
