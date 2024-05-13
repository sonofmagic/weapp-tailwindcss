import { createGetCase, wxmlCasePath } from './util'
import { templateHandler } from '#test/v2/wxml'

const getCase = createGetCase(wxmlCasePath)
describe('performance', () => {
  beforeEach(() => {
    process.env.DEBUG = '*'
  })
  it('long time', async () => {
    const now = Date.now()
    const source = await getCase('pref.wxml')
    const str = templateHandler(source)

    const ts = Date.now() - now
    expect(ts < 1000).toBe(true)
    expect(str).toBe(str)
  })
})
