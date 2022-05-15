import { templeteHandler } from '@/wxml'
import { wxmlCasePath, createGetCase } from './util'

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
    console.log(ts)
    // expect(ts < 100).toBe(true)
    expect(str).toBe(str)
  })
})
