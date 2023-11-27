/* eslint-disable no-template-curly-in-string */
import { getClassCacheSet } from 'tailwindcss-patch'
import { createGetCase, jsCasePath } from './util'
import { SimpleMappingChars2String } from '@/escape'
import { createJsHandler } from '@/js/index'
import { getCss } from '#test/helpers/getTwCss'
// import { getOptions } from '@/options'
// import { defaultOptions } from '@/defaults'
const getCase = createGetCase(jsCasePath)

const testTable = [
  {
    name: '[replace strategy]',
    strategy: 'replace'
  }
] as {
  name: string
  strategy?: 'replace'
}[]

describe('taro app', () => {
  let h: ReturnType<typeof createJsHandler>
  let rh: ReturnType<typeof createJsHandler>
  let mh: ReturnType<typeof createJsHandler>
  // let dh: ReturnType<typeof createJsHandler>
  // let defaultJsHandler: ReturnType<typeof createJsHandler>
  beforeEach(() => {
    h = createJsHandler({
      escapeMap: SimpleMappingChars2String
    })
    rh = createJsHandler({
      escapeMap: SimpleMappingChars2String
    })
    mh = createJsHandler({
      escapeMap: SimpleMappingChars2String
    })

    // dh = createJsHandler({
    //   escapeMap: SimpleMappingChars2String,
    //   minifiedJs: true,
    //   arbitraryValues: {
    //     allowDoubleQuotes: true
    //   }
    // })

    // const { jsHandler } = getOptions()
    // defaultJsHandler = jsHandler
  })

  it.each(testTable)('$name break taro-terser-minify case', async ({ strategy }) => {
    const testCase = await getCase('taro-terser-minify.js')
    const set: Set<string> = new Set()
    process.env.NODE_ENV = 'production'
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(testCase, set).code
    const code0 = mh(testCase, set).code
    if (strategy !== 'replace') {
      expect(code).toBe(code0)
    }

    expect(code).toMatchSnapshot()
    // const css = getCss([testCase])
    // const context = getContexts()
    // const set = getClassCacheSet()
    // expect(set.size).toBeGreaterThan(0)
  })

  it.each(testTable)('$name vue3SaticNodeStr case', async ({ strategy }) => {
    const testCase = await getCase('taro-vue-static-node.js')
    await getCss(testCase)
    const set = getClassCacheSet()
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it.each(testTable)('$name vue3SaticNodeStr short case', async ({ strategy }) => {
    const testCase = await getCase('taro-vue-static-node-short.js')
    await getCss(testCase)
    const set = getClassCacheSet()
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(testCase, set).code
    expect(code).toMatchSnapshot()
  })
})
