/* eslint-disable no-template-curly-in-string */
import { getClassCacheSet } from 'tailwindcss-patch'
// import { createGetCase, jsCasePath } from './util'
import { SimpleMappingChars2String } from '@/escape'
import { createjsHandler } from '@/js/index'
import { getCss } from '#test/helpers/getTwCss'
import { getOptions } from '@/options'
import { defaultOptions } from '@/defaults'
// const getCase = createGetCase(jsCasePath)

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
  let h: ReturnType<typeof createjsHandler>
  let rh: ReturnType<typeof createjsHandler>
  let mh: ReturnType<typeof createjsHandler>
  let dh: ReturnType<typeof createjsHandler>
  let defaultJsHandler: ReturnType<typeof createjsHandler>
  beforeEach(() => {
    h = createjsHandler({
      escapeMap: SimpleMappingChars2String
    })
    rh = createjsHandler({
      escapeMap: SimpleMappingChars2String,
      strategy: 'replace'
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
      expect(code).toBe("const n = 'text-_12px_ flex \n bg-[red] w-2d5'")
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
      expect(code).toMatchSnapshot() // ('const n = `text-_12px_ \n\n  flex  \n\n  bg-[red]`')
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
    expect(code).toBe('const n = "* 1 * 2 w-_100px_";')
    expect(code).toMatchSnapshot()
  })

  it("[replace] jsPreserveClass '*' and but not 'w-[100px]' keyword", () => {
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
    expect(code).toBe(testCase)

    // \n 被展开导致的错误
    //     const LINEFEED = "
    // ";
  })
})
