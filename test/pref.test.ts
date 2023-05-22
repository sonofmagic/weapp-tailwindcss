import { wxmlCasePath, createGetCase } from './util'
import { templeteHandler } from '@/wxml'

const getCase = createGetCase(wxmlCasePath)
describe('performance', () => {
  beforeEach(() => {
    process.env.DEBUG = '*'
  })
  test('long time', async () => {
    const now = Date.now()
    const source = await getCase('pref.wxml')
    const str = templeteHandler(source)

    const ts = Date.now() - now
    expect(ts < 1000).toBe(true)
    expect(str).toBe(str)
  })
})
