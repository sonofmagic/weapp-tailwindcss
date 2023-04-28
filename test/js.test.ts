/* eslint-disable no-template-curly-in-string */
import { SimpleMappingChars2StringEntries } from '@/dic'
import { createjsHandler } from '@/js/index'
import { createGetCase, jsCasePath } from './util'
// import { getCss } from '#test/helpers/getTwCss'
// import { getClassCacheSet, getContexts } from 'tailwindcss-patch'
const getCase = createGetCase(jsCasePath)
describe('jsHandler', () => {
  let h: ReturnType<typeof createjsHandler>
  beforeEach(() => {
    h = createjsHandler({
      escapeEntries: SimpleMappingChars2StringEntries
    })
  })
  it('common case', () => {
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const code = h(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe('const n = "text-_12px_ flex bg-[red] w-2d5";')
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

  it('img url case', () => {
    const testCase = `data: {
      classNames: "bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]"
    }`

    const set: Set<string> = new Set()
    set.add("bg-[url('https://ylnav.com/assets/images/vu/divider-gray.webp')]")
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })

  it('break taro-terser-minify case', async () => {
    const testCase = await getCase('taro-terser-minify.js')
    const set: Set<string> = new Set()
    process.env.NODE_ENV = 'production'
    const code = h(testCase, set).code

    expect(code).toMatchSnapshot()
    // const css = getCss([testCase])
    // const context = getContexts()
    // const set = getClassCacheSet()
    // expect(set.size).toBeGreaterThan(0)
  })
})
