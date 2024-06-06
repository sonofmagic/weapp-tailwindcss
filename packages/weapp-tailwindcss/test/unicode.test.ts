import { createGetCase, unicodeCasePath } from './util'
import { decodeUnicode } from '@/js/handlers'
import { jsHandler, jsHandlerAsync } from '@/js'

const getCase = createGetCase(unicodeCasePath)

describe('unicode', () => {
  it('unicode case 0', () => {
    const testCase = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002'
      + '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'
    expect(decodeUnicode(testCase)).toMatchSnapshot()
  })

  it('unicode case 0 fs', async () => {
    const testCase = await getCase('case0.js')

    const { code } = await jsHandlerAsync(testCase, {
      jsAstTool: 'ast-grep',
    })
    expect(code).toMatchSnapshot()
  })

  it('unicode case 1 fs', async () => {
    const testCase = await getCase('case0.js')

    const { code } = await jsHandler(testCase, {

    })
    expect(code).toMatchSnapshot()
  })
})
