/* eslint-disable no-template-curly-in-string */
import { getClassCacheSet } from 'tailwindcss-patch'
// import { createGetCase, jsCasePath } from './util'
import { createGetCase, jsCasePath, createPutCase } from './util'
import { SimpleMappingChars2String } from '@/escape'
import { createJsHandler } from '@/js/index'
import { getCss } from '#test/helpers/getTwCss'
import { getOptions } from '@/options'
import { defaultOptions } from '@/defaults'

const getCase = createGetCase(jsCasePath)
const putCase = createPutCase(jsCasePath)

const testTable = [
  {
    name: ''
  },
  {
    name: '[replace strategy]',
    strategy: 'replace'
  }
] as {
  name: string
  strategy?: 'replace'
}[]

describe('jsHandler', () => {
  let h: ReturnType<typeof createJsHandler>
  let rh: ReturnType<typeof createJsHandler>
  let mh: ReturnType<typeof createJsHandler>
  let dh: ReturnType<typeof createJsHandler>
  // let smh: ReturnType<typeof createJsHandler>
  let defaultJsHandler: ReturnType<typeof createJsHandler>
  beforeEach(() => {
    h = createJsHandler({
      escapeMap: SimpleMappingChars2String
    })
    rh = createJsHandler({
      escapeMap: SimpleMappingChars2String,
      strategy: 'replace'
    })
    mh = createJsHandler({
      escapeMap: SimpleMappingChars2String,
      minifiedJs: true
    })

    dh = createJsHandler({
      escapeMap: SimpleMappingChars2String,
      minifiedJs: true,
      arbitraryValues: {
        allowDoubleQuotes: true
      }
    })

    // smh = createJsHandler({
    //   escapeMap: SimpleMappingChars2String,
    //   generateMap: true
    // })

    const { jsHandler } = getOptions()
    defaultJsHandler = jsHandler
  })
  it.each(testTable)('$name common case', ({ strategy }) => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    if (strategy === 'replace') {
      expect(code).toBe("const n = 'text-_12px_ flex bg-[red] w-2d5'")
    } else {
      expect(code).toBe('const n = "text-_12px_ flex bg-[red] w-2d5";')
    }
  })

  it.each(testTable)('$name common case with ignore comment', ({ strategy }) => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(`const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'`, set).code
    if (strategy === 'replace') {
      expect(code).toBe("const n = /*weapp-tw ignore*/ 'text-[12px] flex bg-[red] w-2.5'")
    } else {
      expect(code).toBe("const n = /*weapp-tw ignore*/'text-[12px] flex bg-[red] w-2.5';")
    }
  })

  it('[minified] common case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const code = mh(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe('const n="text-_12px_ flex bg-[red] w-2d5";')
  })

  it.each(testTable)('$name preserve space', ({ strategy }) => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const xxx = strategy === 'replace' ? rh : h

    const code = xxx("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    if (strategy === 'replace') {
      expect(code).toBe("const n = 'text-_12px_ flex \\n bg-[red] w-2d5'")
    } else {
      expect(code).toBe('const n = "text-_12px_ flex \\n bg-[red] w-2d5";')
    }
  })

  it('[minified] preserve space', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')

    const code = mh("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    expect(code).toBe('const n="text-_12px_ flex \\n bg-[red] w-2d5";')
  })

  it.each(testTable)('$name preserve space case2', ({ strategy }) => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    const xxx = strategy === 'replace' ? rh : h

    const code = xxx('const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red]`', set).code
    if (strategy === 'replace') {
      // expect(code).toBe('const n = `text-_12px_ \n\n  flex  \n\n  bg-[red]`')
      expect(code).toBe('const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red]`')
      // .toMatchSnapshot() // ('const n = `text-_12px_ \n\n  flex  \n\n  bg-[red]`')
    } else {
      expect(code).toBe('const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red]`;')
    }
  })

  it.each(testTable)('$name babel TemplateElement case', ({ strategy }) => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx("const p = 'text-[12px]';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    if (strategy === 'replace') {
      expect(code).toBe("const p = 'text-_12px_';const n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ '`")
    } else {
      expect(code).toBe('const p = "text-_12px_";\nconst n = `${p} \\n\\n  flex  \\n\\n  bg-_red_ \'`;')
    }
  })

  it.each(testTable)('$name TemplateElement case 0', ({ strategy }) => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('text-[199px]')
    set.add('flex')
    set.add("bg-[url('天气好')]")
    set.add('bg-[red]')
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx("const p = 'text-[12px]';const n = `bg-[url('天气好')]${p}text-[199px] \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    if (strategy === 'replace') {
      expect(code).toBe("const p = 'text-_12px_';const n = `bg-_url_qu5929u6c14u597dq__${p}text-_199px_ \\n\\n  flex  \\n\\n  bg-_red_ '`")
    } else {
      expect(code).toBe('const p = "text-_12px_";\nconst n = `bg-_url_qu5929u6c14u597dq__${p}text-_199px_ \\n\\n  flex  \\n\\n  bg-_red_ \'`;')
    }
  })

  it('[minified] babel TemplateElement case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('bg-[red]')
    const code = mh("const p = 'text-[12px]';const n = `${p} \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe('const p="text-_12px_";const n=`${p} \\n\\n  flex  \\n\\n  bg-_red_ \'`;')
  })

  it.each(testTable)('$name mpx jit classNames', ({ strategy }) => {
    const testCase = `data: {
      classNames: "text-[#123456] text-[50px] bg-[#fff]"
    }`

    const set: Set<string> = new Set()
    set.add('text-[#123456]')
    set.add('bg-[#fff]')
    set.add('text-[50px]')
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(testCase, set).code
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

  it.each(testTable)('$name img url case', ({ strategy }) => {
    const testCase = `data: {
      classNames: "bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]"
    }`

    const set: Set<string> = new Set()
    set.add("bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]")
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('"after:content-["对酒当歌，人生几何"]"', async () => {
    const testCase = 'const a = \'after:content-["对酒当歌，人生几何"]\''
    await getCss(testCase)
    const set = getClassCacheSet()
    const code = dh(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it.each(testTable)('$name "after:content-[\'对酒当歌，人生几何\']"', async ({ strategy }) => {
    const testCase = 'const a = "after:content-[\'对酒当歌，人生几何\']"'
    await getCss(testCase)
    const set = getClassCacheSet()
    const xxx = strategy === 'replace' ? rh : h
    const code = xxx(testCase, set).code
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
    expect(code).toBe('const n = "* 1 * 2 w-_100px_";')
    expect(code).toMatchSnapshot()
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
      },
      strategy: 'replace'
    })
    const code = myCustomJsHandler("const n = '* 1 * 2 w-[100px]'", set).code
    expect(code).toBe("const n = '* 1 * 2 w-_100px_'")
  })

  it('LINEFEED case', () => {
    const testCase = 'const LINEFEED = "\\n";'
    const set = new Set<string>()
    const code = rh(testCase, set).code
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
    const code = rh(`eval("const cls = 'w-[100px]';console.log(cls)")`, set).code
    expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  })

  it('eval TemplateElement case 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = rh("eval(`const cls = 'w-[100px]';console.log(cls)`)", set).code
    expect(code).toBe("eval(`const cls = 'w-_100px_';console.log(cls)`)")
  })

  it('eval StringLiteral case regen 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = h(`eval("const cls = 'w-[100px]';console.log(cls)")`, set).code
    expect(code).toBe('eval("const cls = \\"w-_100px_\\";\\nconsole.log(cls);");')
  })

  it('eval TemplateElement case regen 0', () => {
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    const code = h("eval(`const cls = 'w-[100px]';console.log(cls)`)", set).code
    expect(code).toBe('eval(`const cls = "w-_100px_";\nconsole.log(cls);`);')
  })

  it('jsStringEscape getCase 0', async () => {
    const aarun = await getCase('jsStringEscape.js')
    const set: Set<string> = new Set()
    set.add('w-[100px]')
    set.add('w-[99px]')
    const code = rh(aarun, set).code
    await putCase('jsStringEscape.res.js', code)
    expect(code).toMatchSnapshot()
  })
  // it('eval StringLiteral case 1', () => {
  //   const set: Set<string> = new Set()
  //   set.add('w-[100px]')
  //   const code = rh(`eval("const cls = 'w-[100px]'\\\n;console.log(cls)")`, set).code
  //   expect(code).toBe('eval("const cls = \\\'w-_100px_\\\';console.log(cls)")')
  // })

  it('taro-url-before case', async () => {
    const aarun = await getCase('taro-url-before.js')
    const set: Set<string> = new Set()
    const code = rh(aarun, set).code
    expect(code).toMatchSnapshot()
  })

  it('unicode case 0', async () => {
    const unicodeCase = await getCase('taro-url-unicode.js')
    const set: Set<string> = new Set()
    const code = rh(unicodeCase, set).code
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
})
