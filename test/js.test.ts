/* eslint-disable no-template-curly-in-string */
import { getClassCacheSet } from 'tailwindcss-patch'
// import { createGetCase, jsCasePath } from './util'
// import { js } from '@ast-grep/napi'
// import swc from '@swc/core'
// import MagicString from 'magic-string'
// import { jsStringEscape } from '@ast-core/escape'

// swc 在解析中文的时候，会导致 span 增加，从而无法精确定位，不知道是不是bug
import { createGetCase, jsCasePath, createPutCase } from './util'
import { SimpleMappingChars2String } from '@/escape'
import { createJsHandler } from '@/js/index'
import { getCss } from '#test/helpers/getTwCss'
import { getOptions } from '@/options'
import { defaultOptions } from '@/defaults'
// import { parse } from '@/babel'
const getCase = createGetCase(jsCasePath)
const putCase = createPutCase(jsCasePath)

const testTable = [
  {
    name: 'common'
  }
] as {
  name: string
  strategy?: 'replace'
}[]

describe('jsHandler', () => {
  let h: ReturnType<typeof createJsHandler>
  let dh: ReturnType<typeof createJsHandler>
  let astGreph: ReturnType<typeof createJsHandler>
  let defaultJsHandler: ReturnType<typeof createJsHandler>
  beforeEach(() => {
    h = createJsHandler({
      escapeMap: SimpleMappingChars2String
    })

    dh = createJsHandler({
      escapeMap: SimpleMappingChars2String,
      // minifiedJs: true,
      arbitraryValues: {
        allowDoubleQuotes: true
      }
    })

    // astGreph = createJsHandler({
    //   escapeMap: SimpleMappingChars2String,
    //   jsAstTool: 'ast-grep'
    // })

    const { jsHandler } = getOptions()
    defaultJsHandler = jsHandler
  })
  it.each(testTable)('$name common case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const code = h(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe("const n = 'text-_12px_ flex bg-[red] w-2d5'")
  })

  it.skip('astGrep common case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const code = astGreph(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe("const n = 'text-_12px_ flex bg-[red] w-2d5'")
  })

  it.each(testTable)('$name common case with ignore comment', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const code = h(`const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe("const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'")
  })

  // it('astGrep common case with ignore comment', () => {
  //   const set: Set<string> = new Set()
  //   set.add('text-[12px]')
  //   set.add('flex')
  //   set.add('w-2.5')

  //   const code = astGreph(`const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'`, set).code
  //   expect(code).toBe("const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'")
  // })

  it.each(testTable)('$name preserve space', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const xxx = h

    const code = xxx("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    expect(code).toBe("const n = 'text-_12px_ flex \\n bg-[red] w-2d5'")
  })

  it.skip('astGrep preserve space', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const code = astGreph("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    expect(code).toBe("const n = 'text-_12px_ flex \\n bg-[red] w-2d5'")
  })

  it.each(testTable)('$name preserve space case2', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')

    const code = h('const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red]`', set).code
    expect(code).toBe('const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red]`')
  })

  it.skip('astGrep preserve space case2', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')

    const code = astGreph('const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red]`', set).code
    expect(code).toBe('const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red]`')
  })

  it.each(testTable)('$name babel TemplateElement case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')

    const code = h("const p = 'text-[12px]';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe("const p = 'text-_12px_';const n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ '`")
  })

  it.skip('astGrep TemplateElement case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')

    const code = astGreph("const p = 'text-[12px]';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe("const p = 'text-_12px_';const n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ '`")
  })

  it.each(testTable)('$name TemplateElement case 0', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('text-[199px]')
    set.add('flex')
    set.add("bg-[url('天气好')]")
    set.add('bg-[red]')

    const code = h("const p = 'text-[12px]';const n = `bg-[url('天气好')]${p}text-[199px] \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe("const p = 'text-_12px_';const n = `bg-_url_qu5929u6c14u597dq__${p}text-_199px_ \\n\\n  flex  \\n\\n  bg-_red_ '`")
  })

  it.skip('astGrep TemplateElement case 0', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('text-[199px]')
    set.add('flex')
    set.add("bg-[url('天气好')]")
    set.add('bg-[red]')
    set.add('leading-[24px]')
    const s = "const p = 'text-[12px] leading-[24px]';const n = `bg-[url('天气好')]${p}text-[199px] \\n\\n  flex  \\n\\n  bg-[red] '`"
    const code = astGreph(s, set).code
    expect(code).toBe("const p = 'text-_12px_ leading-_24px_';const n = `bg-_url_qu5929u6c14u597dq__${p}text-_199px_ \\n\\n  flex  \\n\\n  bg-_red_ '`")
  })

  it.each(testTable)('$name mpx jit classNames', () => {
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

  it.each(testTable)('$name img url case', () => {
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

  it.each(testTable)('$name "after:content-[\'对酒当歌，人生几何\']"', async () => {
    const testCase = 'const a = "after:content-[\'对酒当歌，人生几何\']"'
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
    const myCustomJsHandler = createJsHandler({
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
    const myCustomJsHandler = createJsHandler({
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
    expect(code).toBe("const n = '* 1 * 2 w-_100px_'")
  })

  it("[replace] jsPreserveClass '*' and but not 'w-[100px]' keyword", () => {
    const set: Set<string> = new Set()
    set.add('*')
    set.add('w-[100px]')
    const myCustomJsHandler = createJsHandler({
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
    expect(code).toBe("const n = '* 1 * 2 w-_100px_'")
  })

  it('LINEFEED case', () => {
    const testCase = 'const LINEFEED = "\\n";'
    const set = new Set<string>()
    const code = h(testCase, set).code
    // 'const LINEFEED = "\n";'
    // 'const LINEFEED = "\\n";'
    expect(code).toBe(testCase)

    // \n 被展开导致的错误
    //     const LINEFEED = "
    // ";
  })

  it('mangleContext case', () => {
    const set: Set<string> = new Set()
    // set.add('*')
    set.add('w-[100px]')
    const { jsHandler, setMangleRuntimeSet } = getOptions({
      mangle: true
    })
    setMangleRuntimeSet(set)
    const code = jsHandler("const n = '* 1 * 2 w-[100px]'", set).code
    expect(code).toBe("const n = '* 1 * 2 tw-a'")
  })

  // it('source map case 0', () => {
  //   const set: Set<string> = new Set()
  //   set.add('w-[100px]')
  //   const { jsHandler, setMangleRuntimeSet } = getOptions()
  //   setMangleRuntimeSet(set)
  //   const { code, map } = jsHandler("const n = '* 1 * 2 w-[100px]'", set)
  //   expect(code).toBe("const n = '* 1 * 2 w-_100px_'")
  //   expect(map).toBeTruthy()
  //   expect(map?.toString()).toBe('{"version":3,"sources":[""],"names":[],"mappings":"AAAA,WAAW,iBAAiB"}')
  // })

  it('eval StringLiteral case 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = h(`eval("const cls = 'w-[100px]';console.log(cls)")`, set).code
    expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  })

  it('eval TemplateElement case 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = h("eval(`const cls = 'w-[100px]';console.log(cls)`)", set).code
    expect(code).toBe("eval(`const cls = 'w-_100px_';console.log(cls)`)")
  })

  it('eval StringLiteral case regen 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = h(`eval("const cls = 'w-[100px]';console.log(cls)")`, set).code
    expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  })

  it('eval TemplateElement case regen 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = h("eval(`const cls = 'w-[100px]';console.log(cls)`)", set).code
    expect(code).toBe("eval(`const cls = 'w-_100px_';console.log(cls)`)")
  })

  it('jsStringEscape getCase 0', async () => {
    const aarun = await getCase('jsStringEscape.js')
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    set.add('w-[99px]')
    const code = h(aarun, set).code
    await putCase('jsStringEscape.res.js', code)
    expect(code).toMatchSnapshot()
  })
  // it('eval StringLiteral case 1', () => {
  //   const set: Set<string> = new Set()
  //   set.add('w-[100px]')
  //   const code = h(`eval("const cls = 'w-[100px]'\\\n;console.log(cls)")`, set).code
  //   expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  // })

  it('taro-url-before case', async () => {
    const aarun = await getCase('taro-url-before.js')
    const set: Set<string> = new Set()
    const code = h(aarun, set).code
    expect(code).toMatchSnapshot()
  })

  it('unicode case 0', async () => {
    const unicodeCase = await getCase('taro-url-unicode.js')
    const set: Set<string> = new Set()
    const code = h(unicodeCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('taro-lottie-miniprogram-dev', async () => {
    const testCase = await getCase('taro-lottie-miniprogram-dev.js')
    const set: Set<string> = new Set()
    const { jsHandler } = getOptions()
    expect(() => {
      const { code } = jsHandler(testCase, set)
      expect(code).toBe(testCase)
    }).not.toThrow()
  })

  it('taro-lottie-miniprogram-build-no-compress', async () => {
    const testCase = await getCase('taro-lottie-miniprogram-build-no-compress.js')
    const set: Set<string> = new Set()
    const { jsHandler } = getOptions()
    expect(() => {
      const { code } = jsHandler(testCase, set)
      expect(code).toBe(testCase)
    }).not.toThrow()
  })

  it('taro-lottie-miniprogram-build', async () => {
    const testCase = await getCase('taro-lottie-miniprogram-build.js')
    const set: Set<string> = new Set()
    const { jsHandler } = getOptions()
    expect(() => {
      const { code } = jsHandler(testCase, set)
      expect(code).toBe(testCase)
    }).not.toThrow()
  })

  it('issues/276 case 0', () => {
    const testCase = `const x = "rounded-[20rpx] before:rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('rounded-[20rpx]')
    set.add('before:rounded-[20rpx]')
    const { jsHandler } = getOptions()
    const code = jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('issues/276 case 1', () => {
    const testCase = `const x = "rounded-[20rpx] before:rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('before:rounded-[20rpx]')
    set.add('rounded-[20rpx]')

    const { jsHandler } = getOptions()
    const code = jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('issues/276 case 2', () => {
    const testCase = `const x = "before:rounded-[20rpx] rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('rounded-[20rpx]')
    set.add('before:rounded-[20rpx]')
    const { jsHandler } = getOptions()
    const code = jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('issues/276 case 3', () => {
    const testCase = `const x = "before:rounded-[20rpx] rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('before:rounded-[20rpx]')
    set.add('rounded-[20rpx]')

    const { jsHandler } = getOptions()
    const code = jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })
})
