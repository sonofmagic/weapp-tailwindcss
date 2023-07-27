/* eslint-disable no-template-curly-in-string */
import { getClassCacheSet } from 'tailwindcss-patch'
import { createGetCase, jsCasePath } from './util'
import { SimpleMappingChars2String } from '@/escape'
import { createjsHandler } from '@/js/index'
import { getCss } from '#test/helpers/getTwCss'
import { getOptions } from '@/options'
import { defaultOptions } from '@/defaults'
const getCase = createGetCase(jsCasePath)
describe('jsHandler', () => {
  let h: ReturnType<typeof createjsHandler>
  let mh: ReturnType<typeof createjsHandler>
  let dh: ReturnType<typeof createjsHandler>
  let defaultJsHandler: ReturnType<typeof createjsHandler>
  beforeEach(() => {
    h = createjsHandler({
      escapeMap: SimpleMappingChars2String
    })
    mh = createjsHandler({
      escapeMap: SimpleMappingChars2String,
      minifiedJs: true
    })

    dh = createjsHandler({
      escapeMap: SimpleMappingChars2String,
      minifiedJs: true,
      arbitraryValues: {
        allowDoubleQuotes: true
      }
    })

    const { jsHandler } = getOptions()
    defaultJsHandler = jsHandler
  })
  it('common case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const code = h(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe('const n = "text-_12px_ flex bg-[red] w-2d5";')
  })

  it('common case with ignore comment', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const code = h(`const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe("const n = /*weapp-tw ignore*/'text-[12px] flex bg-[red] w-2.5';")
  })

  it('[minified] common case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const code = mh(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe('const n="text-_12px_ flex bg-[red] w-2d5";')
  })

  it('preserve space', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    // const code = h("const n = 'text-[12px] flex' + '\n' + ' bg-[red] w-2.5'", set).code
    const code = h("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    expect(code).toBe('const n = "text-_12px_ flex \\n bg-[red] w-2d5";')
  })

  it('[minified] preserve space', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    // const code = h("const n = 'text-[12px] flex' + '\n' + ' bg-[red] w-2.5'", set).code
    const code = mh("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    expect(code).toBe('const n="text-_12px_ flex \\n bg-[red] w-2d5";')
  })

  it('preserve space case2', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    const code = h("const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe("const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red] '`;")
  })

  it('babel TemplateElement case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')
    const code = h("const p = 'text-[12px]';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe('const p = "text-_12px_";\nconst n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ \'`;')
  })

  it('[minified] babel TemplateElement case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')
    const code = mh("const p = 'text-[12px]';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe('const p="text-_12px_";const n=`${p} \\n\\n  flex  \\n\\n  bg-_red_ \'`;')
  })

  it('mpx jit classNames', () => {
    const testCase = `data: {
      classNames: "text-[#123456] text-[50px] bg-[#fff]"
    }`

    const set: Set<string> = new Set()
    set.add('text-[#123456]')
    set.add('bg-[#fff]')
    set.add('text-[50px]')
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('[minified] mpx jit classNames', () => {
    const testCase = `data: {
      classNames: "text-[#123456] text-[50px] bg-[#fff]"
    }`

    const set: Set<string> = new Set()
    set.add('text-[#123456]')
    set.add('bg-[#fff]')
    set.add('text-[50px]')
    const code = mh(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('img url case', () => {
    const testCase = `data: {
      classNames: "bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]"
    }`

    const set: Set<string> = new Set()
    set.add("bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]")
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('"after:content-["对酒当歌，人生几何"]"', async () => {
    const testCase = 'const a = \'after:content-["对酒当歌，人生几何"]\''
    await getCss(testCase)
    const set = getClassCacheSet()
    const code = dh(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('"after:content-[\'对酒当歌，人生几何\']"', async () => {
    const testCase = 'const a = "after:content-[\'对酒当歌，人生几何\']"'
    await getCss(testCase)
    const set = getClassCacheSet()
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('break taro-terser-minify case', async () => {
    const testCase = await getCase('taro-terser-minify.js')
    const set: Set<string> = new Set()
    process.env.NODE_ENV = 'production'
    const code = h(testCase, set).code
    const code0 = mh(testCase, set).code
    expect(code).toBe(code0)
    expect(code).toMatchSnapshot()
    // const css = getCss([testCase])
    // const context = getContexts()
    // const set = getClassCacheSet()
    // expect(set.size).toBeGreaterThan(0)
  })

  it('vue3SaticNodeStr case', async () => {
    const testCase = await getCase('taro-vue-static-node.js')
    await getCss(testCase)
    const set = getClassCacheSet()
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('vue3SaticNodeStr short case', async () => {
    const testCase = await getCase('taro-vue-static-node-short.js')
    await getCss(testCase)
    const set = getClassCacheSet()
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it("jsPreserveClass '*' keyword", () => {
    const set: Set<string> = new Set()
    set.add('*')

    const code = defaultJsHandler("const n = '* 1 * 2'", set).code

    expect(code).toMatchSnapshot()
  })

  it("jsPreserveClass '*' and 'w-[100px]' keyword", () => {
    const set: Set<string> = new Set()
    set.add('*')
    set.add('w-[100px]')
    const myCustomJsHandler = createjsHandler({
      escapeMap: SimpleMappingChars2String,
      jsPreserveClass(keyword) {
        if (defaultOptions.jsPreserveClass?.(keyword)) {
          return true
        }
        if (keyword === 'w-[100px]') {
          return true
        }
      }
    })
    const code = myCustomJsHandler("const n = '* 1 * 2 w-[100px]'", set).code

    expect(code).toMatchSnapshot()
  })

  it("jsPreserveClass '*' and but not 'w-[100px]' keyword", () => {
    const set: Set<string> = new Set()
    set.add('*')
    set.add('w-[100px]')
    const myCustomJsHandler = createjsHandler({
      escapeMap: SimpleMappingChars2String,
      jsPreserveClass(keyword) {
        if (defaultOptions.jsPreserveClass?.(keyword)) {
          return true
        }
        // if (keyword === 'w-[100px]') {
        //   return true
        // }
      }
    })
    const code = myCustomJsHandler("const n = '* 1 * 2 w-[100px]'", set).code

    expect(code).toMatchSnapshot()
  })
})
