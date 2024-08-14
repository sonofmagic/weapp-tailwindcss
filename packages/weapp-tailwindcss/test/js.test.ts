/* eslint-disable no-template-curly-in-string */
// import punycode from 'node:punycode'
import { TailwindcssPatcher } from 'tailwindcss-patch'
// import { createGetCase, jsCasePath } from './util'
// import { js } from '@ast-grep/napi'
// import swc from '@swc/core'
// import MagicString from 'magic-string'
// import { jsStringEscape } from '@ast-core/escape'

// swc 在解析中文的时候，会导致 span 增加，从而无法精确定位，不知道是不是bug
import { createGetCase, createPutCase, jsCasePath, tsCasePath } from './util'
import { SimpleMappingChars2String, decodeUnicode } from '@/escape'
import { createJsHandler } from '@/js/index'
import { getCss } from '#test/helpers/getTwCss'
import { getOptions } from '@/options'
import { defaultOptions } from '@/defaults'
// import { parse } from '@/babel'
const getCase = createGetCase(jsCasePath)
const getTsCase = createGetCase(tsCasePath)
const putCase = createPutCase(jsCasePath)

function getClassCacheSet() {
  const twPatcher = new TailwindcssPatcher()
  return twPatcher.getClassCacheSet()
}

const testTable = [
  {
    name: 'common',
  },
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
      escapeMap: SimpleMappingChars2String,
    })

    dh = createJsHandler({
      escapeMap: SimpleMappingChars2String,
      // minifiedJs: true,
      arbitraryValues: {
        allowDoubleQuotes: true,
      },
    })

    astGreph = createJsHandler({
      escapeMap: SimpleMappingChars2String,
      jsAstTool: 'ast-grep',
    })

    const { jsHandler } = getOptions()
    defaultJsHandler = jsHandler
  })
  it.each(testTable)('$name common case', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const { code } = await h(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set)
    expect(code).toBe('const n = \'text-_12px_ flex bg-[red] w-2d5\'')
  })

  it('astGrep common case', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const { code } = await astGreph(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set)
    expect(code).toBe('const n = \'text-_12px_ flex bg-[red] w-2d5\'')
  })

  it.each(testTable)('$name common case with ignore comment', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const { code } = await h(`const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'`, set)
    expect(code).toBe('const n = /*weapp-tw ignore*/ \'text-[12px] flex bg-[red] w-2.5\'')
  })

  // it('astGrep common case with ignore comment', () => {
  //   const set: Set<string> = new Set()
  //   set.add('text-[12px]')
  //   set.add('flex')
  //   set.add('w-2.5')

  //   const code = astGreph(`const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'`, set).code
  //   expect(code).toBe("const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'")
  // })

  it.each(testTable)('$name preserve space', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const xxx = h

    const { code } = await xxx('const n = \'text-[12px] flex \\n bg-[red] w-2.5\'', set)
    expect(code).toBe('const n = \'text-_12px_ flex \\n bg-[red] w-2d5\'')
  })

  it('astGrep preserve space', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const { code } = await astGreph('const n = \'text-[12px] flex \\n bg-[red] w-2.5\'', set)
    expect(code).toBe('const n = \'text-_12px_ flex \\n bg-[red] w-2d5\'')
  })

  it.each(testTable)('$name preserve space case2', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')

    const { code } = await h('const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red]`', set)
    expect(code).toBe('const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red]`')
  })

  it('astGrep preserve space case2', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')

    const { code } = await astGreph('const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red]`', set)
    expect(code).toBe('const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red]`')
  })

  it.each(testTable)('$name babel TemplateElement case', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')

    const { code } = await h('const p = \'text-[12px]\';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] \'`', set)
    expect(code).toBe('const p = \'text-_12px_\';const n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ \'`')
  })

  it('astGrep TemplateElement case', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')

    const { code } = await astGreph('const p = \'text-[12px]\';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] \'`', set)
    expect(code).toBe('const p = \'text-_12px_\';const n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ \'`')
  })

  it.each(testTable)('$name TemplateElement case 0', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('text-[199px]')
    set.add('flex')
    set.add('bg-[url(\'天气好\')]')
    set.add('bg-[red]')

    const { code } = await h('const p = \'text-[12px]\';const n = `bg-[url(\'天气好\')]${p}text-[199px] \\n\\n  flex  \\n\\n  bg-[red] \'`', set)
    expect(code).toBe('const p = \'text-_12px_\';const n = `bg-_url_qu5929u6c14u597dq__${p}text-_199px_ \\n\\n  flex  \\n\\n  bg-_red_ \'`')
  })

  it('astGrep TemplateElement case 0', async () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('text-[199px]')
    set.add('flex')
    set.add('bg-[url(\'天气好\')]')
    set.add('bg-[red]')
    set.add('leading-[24px]')
    const s = 'const p = \'text-[12px] leading-[24px]\';const n = `bg-[url(\'天气好\')]${p}text-[199px] \\n\\n  flex  \\n\\n  bg-[red] \'`'
    const { code } = await astGreph(s, set)
    expect(code).toBe('const p = \'text-_12px_ leading-_24px_\';const n = `bg-_url_qu5929u6c14u597dq__${p}text-_199px_ \\n\\n  flex  \\n\\n  bg-_red_ \'`')
  })

  it.each(testTable)('$name mpx jit classNames', async () => {
    const testCase = `data: {
      classNames: "text-[#123456] text-[50px] bg-[#fff]"
    }`

    const set: Set<string> = new Set()
    set.add('text-[#123456]')
    set.add('bg-[#fff]')
    set.add('text-[50px]')

    const { code } = await h(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it.each(testTable)('$name img url case', async () => {
    const testCase = `data: {
      classNames: "bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]"
    }`

    const set: Set<string> = new Set()
    set.add('bg-[url(\'https://ylnav.com/assets/images/vu/divider-gray.webp\')]')

    const { code } = await h(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('"after:content-["对酒当歌，人生几何"]"', async () => {
    const testCase = 'const a = \'after:content-["对酒当歌，人生几何"]\''
    await getCss(testCase)
    const set = getClassCacheSet()
    const { code } = await dh(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it.each(testTable)('$name "after:content-[\'对酒当歌，人生几何\']"', async () => {
    const testCase = 'const a = "after:content-[\'对酒当歌，人生几何\']"'
    await getCss(testCase)
    const set = getClassCacheSet()

    const { code } = await h(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('jsPreserveClass \'*\' keyword', async () => {
    const set: Set<string> = new Set()
    set.add('*')

    const { code } = await defaultJsHandler('const n = \'* 1 * 2\'', set)

    expect(code).toMatchSnapshot()
  })

  it('jsPreserveClass \'*\' and \'w-[100px]\' keyword', async () => {
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
      },
    })
    const { code } = await myCustomJsHandler('const n = \'* 1 * 2 w-[100px]\'', set)

    expect(code).toMatchSnapshot()
  })

  it('jsPreserveClass \'*\' and but not \'w-[100px]\' keyword', async () => {
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
      },
    })
    const { code } = await myCustomJsHandler('const n = \'* 1 * 2 w-[100px]\'', set)
    expect(code).toBe('const n = \'* 1 * 2 w-_100px_\'')
  })

  it('[replace] jsPreserveClass \'*\' and but not \'w-[100px]\' keyword', async () => {
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
      },
    })
    const { code } = await myCustomJsHandler('const n = \'* 1 * 2 w-[100px]\'', set)
    expect(code).toBe('const n = \'* 1 * 2 w-_100px_\'')
  })

  it('lINEFEED case', async () => {
    const testCase = 'const LINEFEED = "\\n";'
    const set = new Set<string>()
    const { code } = await h(testCase, set)
    // 'const LINEFEED = "\n";'
    // 'const LINEFEED = "\\n";'
    expect(code).toBe(testCase)

    // \n 被展开导致的错误
    //     const LINEFEED = "
    // ";
  })

  it('mangleContext case', async () => {
    const set: Set<string> = new Set()
    // set.add('*')
    set.add('w-[100px]')
    const { jsHandler, setMangleRuntimeSet } = getOptions({
      mangle: true,
    })
    setMangleRuntimeSet(set)
    const { code } = await jsHandler('const n = \'* 1 * 2 w-[100px]\'', set)
    expect(code).toBe('const n = \'* 1 * 2 tw-a\'')
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

  it('eval StringLiteral case 0', async () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const { code } = await h(`eval("const cls = 'w-[100px]';console.log(cls)")`, set)
    expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  })

  it('eval TemplateElement case 0', async () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const { code } = await h('eval(`const cls = \'w-[100px]\';console.log(cls)`)', set)
    expect(code).toBe('eval(`const cls = \'w-_100px_\';console.log(cls)`)')
  })

  it('eval StringLiteral case regen 0', async () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const { code } = await h(`eval("const cls = 'w-[100px]';console.log(cls)")`, set)
    expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  })

  it('eval TemplateElement case regen 0', async () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const { code } = await h('eval(`const cls = \'w-[100px]\';console.log(cls)`)', set)
    expect(code).toBe('eval(`const cls = \'w-_100px_\';console.log(cls)`)')
  })

  it('jsStringEscape getCase 0', async () => {
    const aarun = await getCase('jsStringEscape.js')
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    set.add('w-[99px]')
    const { code } = await h(aarun, set)
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
    const { code } = await h(aarun, set)
    expect(code).toMatchSnapshot()
  })

  it('unicode case 0', async () => {
    const unicodeCase = await getCase('taro-url-unicode.js')
    const set: Set<string> = new Set()
    const { code } = await h(unicodeCase, set)
    expect(code).toMatchSnapshot()
  })

  it('taro-lottie-miniprogram-dev', async () => {
    const testCase = await getCase('taro-lottie-miniprogram-dev.js')
    const set: Set<string> = new Set()
    const { jsHandler } = getOptions()
    expect(async () => {
      const { code } = await jsHandler(testCase, set)
      expect(code).toBe(testCase)
    }).not.toThrow()
  })

  it('taro-lottie-miniprogram-build-no-compress', async () => {
    const testCase = await getCase('taro-lottie-miniprogram-build-no-compress.js')
    const set: Set<string> = new Set()
    const { jsHandler } = getOptions()
    expect(async () => {
      const { code } = await jsHandler(testCase, set)
      expect(code).toBe(testCase)
    }).not.toThrow()
  })

  it('taro-lottie-miniprogram-build', async () => {
    const testCase = await getCase('taro-lottie-miniprogram-build.js')
    const set: Set<string> = new Set()
    const { jsHandler } = getOptions()
    expect(async () => {
      const { code } = await jsHandler(testCase, set)
      expect(code).toBe(testCase)
    }).not.toThrow()
  })

  it('issues/276 case 0', async () => {
    const testCase = `const x = "rounded-[20rpx] before:rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('rounded-[20rpx]')
    set.add('before:rounded-[20rpx]')
    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('issues/276 case 1', async () => {
    const testCase = `const x = "rounded-[20rpx] before:rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('before:rounded-[20rpx]')
    set.add('rounded-[20rpx]')

    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('issues/276 case 2', async () => {
    const testCase = `const x = "before:rounded-[20rpx] rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('rounded-[20rpx]')
    set.add('before:rounded-[20rpx]')
    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('issues/276 case 3', async () => {
    const testCase = `const x = "before:rounded-[20rpx] rounded-[20rpx]"`
    const set: Set<string> = new Set()
    set.add('before:rounded-[20rpx]')
    set.add('rounded-[20rpx]')

    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符 case 0', async () => {
    const testCase = `const a ={ className: "after:content-['\u7684\u6492\u7684\u6492']", children: "\u4E8B\u5B9E\u4E0A" }`
    const set: Set<string> = new Set()
    set.add('after:content-[\'的撒的撒\']')

    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符 case 1', async () => {
    const testCase = `const a ={ className: "after:content-['\u7684\u6492\u7684\u6492']", children: "\u4E8B\u5B9E\u4E0A" }`
    const set: Set<string> = new Set()
    set.add('after:content-[\'的撒的撒\']')

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符 case 2', async () => {
    const testCase = `"use strict";(wx["webpackJsonp"]=wx["webpackJsonp"]||[]).push([[280],{3747:function(n,e,o){var t=o(6073),c=o(118),r=o(5349),u=function(){return(0,r.jsx)(c.Ss,{className:"before:content-['moduleA_\u666E\u901A\u5206\u5305']",children:"moduleA \u666E\u901A\u5206\u5305"})},s={};Page((0,t.createPageConfig)(u,"moduleA/pages/index",{root:{cn:[]}},s||{}))}},function(n){var e=function(e){return n(n.s=e)};n.O(0,[907,96],(function(){return e(3747)}));n.O()}]);`
    const set: Set<string> = new Set()
    set.add('before:content-[\'moduleA_普通分包\']')

    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符 case 3', async () => {
    const testCase = `"use strict";(wx["webpackJsonp"]=wx["webpackJsonp"]||[]).push([[280],{3747:function(n,e,o){var t=o(6073),c=o(118),r=o(5349),u=function(){return(0,r.jsx)(c.Ss,{className:"before:content-['moduleA_\u666E\u901A\u5206\u5305']",children:"moduleA \u666E\u901A\u5206\u5305"})},s={};Page((0,t.createPageConfig)(u,"moduleA/pages/index",{root:{cn:[]}},s||{}))}},function(n){var e=function(e){return n(n.s=e)};n.O(0,[907,96],(function(){return e(3747)}));n.O()}]);`
    const set: Set<string> = new Set()
    set.add('before:content-[\'moduleA_普通分包\']')

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符产物 case 0', async () => {
    const testCase = await getCase('taro-vue-rust-zh.js')
    const set: Set<string> = new Set()
    set.add('after:content-[\'我知道我心,永恒12we_ds\']')

    const { jsHandler } = getOptions()
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符产物 case 1', async () => {
    const testCase = await getCase('taro-vue-rust-zh.js')
    const set: Set<string> = new Set()
    set.add('after:content-[\'我知道我心,永恒12we_ds\']')

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符产物 case 2', async () => {
    const testCase = await getCase('taro-vue3-test-dist.js')
    const set: Set<string> = new Set()
    set.add('after:content-[\'我知道我心,永恒12we_ds\']')

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符产物 case 3', async () => {
    const testCase = await getCase('taro-vue3-test-build-dist.js')
    const set: Set<string> = new Set()
    set.add('after:content-[\'我知道我心,永恒12we_ds\']')

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符产物 case 4', async () => {
    const testCase = await getCase('taro-vue3-test-build-dist-short.js')
    const set: Set<string> = new Set()
    set.add('after:content-[\'我知道我心,永恒12we_ds\']')

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('中文字符转义 case 0', () => {
    const a1: string = 'after:content-[\'\\u6211\\u77e5\\u9053\\u6211\\u5fc3,\\u6c38\\u605212we_ds\']'
    const a2: string = 'after:content-[\'我知道我心,永恒12we_ds\']'
    expect(a1 === a2).toBe(false)
  })

  it('中文字符转义 case 1', () => {
    const a1: string = 'after:content-[\'\u6211\u77E5\u9053\u6211\u5FC3,\u6C38\u605212we_ds\']'
    const a2: string = 'after:content-[\'我知道我心,永恒12we_ds\']'
    expect(a1 === a2).toBe(true)
  })

  it('中文字符转义 case 2', () => {
    const str: string = decodeUnicode('after:content-[\'\\u6211\\u77e5\\u9053\\u6211\\u5fc3,\\u6c38\\u605212we_ds\']')
    // 匹配Unicode编码的正则表达式
    // const unicodeRegex = /\\\\?\\/g

    // // 替换Unicode编码为对应字符
    // str = str.replaceAll(unicodeRegex, function (match) {
    //   return match === '\\' ? '' : String.fromCodePoint(Number.parseInt('0x' + match.slice(2), 16))
    // })
    const a2: string = 'after:content-[\'我知道我心,永恒12we_ds\']'
    expect(str === a2).toBe(true)
  })

  it('empty case 0', async () => {
    const testCase = `const a = ''`
    const set: Set<string> = new Set()

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it('short case 0', async () => {
    const testCase = `const a = '1'`
    const set: Set<string> = new Set()

    const { jsHandler } = getOptions({
      jsAstTool: 'ast-grep',
    })
    const code = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })
  // it('中文字符产物 after build case 0', () => {
  //   const a = "w-1.5 h-[calc(100vh-100px)] bg-[#fafafa] after:content-['\u6211\u77E5\u9053\u6211\u5FC3,\u6C38\u605212we_ds']"
  // })

  // const b = "after:content-['\\u6211\\u77e5\\u9053\\u6211\\u5fc3,\\u6c38\\u605212we_ds']"

  // "after:content-['我知道我心,永恒12we_ds']"

  it('ts file parser 0', async () => {
    const testCase = await getTsCase('native-ts-0.ts')
    const set: Set<string> = new Set()
    set.add('text-[100px]')
    set.add('bg-[#123456]')
    const { jsHandler } = getOptions()
    expect(async () => {
      const { code, error } = await jsHandler(testCase, set)
      expect(code).toMatchSnapshot()
      expect(error).toBeFalsy()
    }).not.toThrow()
  })

  it('ts file parser noting', async () => {
    const testCase = await getTsCase('native-ts-noting.ts')
    const set: Set<string> = new Set()

    const { jsHandler } = getOptions()
    expect(async () => {
      const { code, error } = await jsHandler(testCase, set)
      expect(code).toBe(testCase)
      expect(error).toBeFalsy()
    }).not.toThrow()
  })

  it('ts file parser throw error', async () => {
    const testCase = await getTsCase('native-ts-throw.ts')
    const set: Set<string> = new Set()

    const { jsHandler } = getOptions()
    const { error } = await jsHandler(testCase, set)
    expect(error).toBeTruthy()
  })

  it('ts file parser not throw error 0', async () => {
    const testCase = await getTsCase('native-ts-throw.ts')
    const set: Set<string> = new Set()

    const { jsHandler } = getOptions({
      babelParserOptions: {
        plugins: ['typescript'],
      },
    })
    const { error } = await jsHandler(testCase, set)
    expect(error).toBeFalsy()
  })

  it('ts file parser not throw error 1', async () => {
    const testCase = await getTsCase('native-ts-throw.ts')
    const set: Set<string> = new Set()

    const { jsHandler } = getOptions({
      babelParserOptions: {
        // @ts-ignore
        plugins: ['@babel/plugin-syntax-typescript'],
      },
    })
    const { error } = await jsHandler(testCase, set)
    expect(error).toBeTruthy()
  })
})
