/* eslint-disable no-template-curly-in-string */
import { SimpleMappingChars2StringEntries } from '@/dic'
import { createjsHandler } from '@/js/index'
describe('jsHandler', () => {
  it('common case', () => {
    const h = createjsHandler({
      escapeEntries: SimpleMappingChars2StringEntries
    })
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    const code = h(`const n = 'text-[12px] flex bg-[red] w-2.5'`, set).code
    expect(code).toBe('const n = "text-_12px_ flex bg-[red] w-2d5";')
  })

  it('preserve space', () => {
    const h = createjsHandler({
      escapeEntries: SimpleMappingChars2StringEntries
    })
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    set.add('w-2.5')
    // const code = h("const n = 'text-[12px] flex' + '\n' + ' bg-[red] w-2.5'", set).code
    const code = h("const n = 'text-[12px] flex \\n bg-[red] w-2.5'", set).code
    expect(code).toBe('const n = "text-_12px_ flex \\n bg-[red] w-2d5";')
  })

  it('preserve space case2', () => {
    const h = createjsHandler({
      escapeEntries: SimpleMappingChars2StringEntries
    })
    const set: Set<string> = new Set()
    set.add('text-[12px]')
    set.add('flex')
    const code = h("const n = `text-[12px] \\n\\n  flex  \\n\\n  bg-[red] '`", set).code
    expect(code).toBe("const n = `text-_12px_ \\n\\n  flex  \\n\\n  bg-[red] '`;")
  })

  it('babel TemplateElement case', () => {
    const h = createjsHandler({
      escapeEntries: SimpleMappingChars2StringEntries
    })
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
    const h = createjsHandler({
      escapeEntries: SimpleMappingChars2StringEntries
    })
    const set: Set<string> = new Set()
    set.add('text-[#123456]')
    set.add('bg-[#fff]')
    set.add('text-[50px]')
    const code = h(testCase, set).code
    expect(code).toMatchSnapshot()
  })
})
