import { MappingChars2String } from '@weapp-core/escape'
import { describe, expect, it } from 'vitest'
import { collectUnescapedDynamicCandidates } from '@/bundlers/vite/generate-bundle/candidates'
import { createJsHandler } from '@/js'
import { createTemplateHandler } from '@/wxml'
import { replaceWxml } from '@/wxml/shared'

const misescapeCases = [
  {
    label: 'tailwindcss v3',
    majorVersion: 3,
    runtimeClass: 'bg-[red]',
  },
  {
    label: 'tailwindcss v4',
    majorVersion: 4,
    runtimeClass: 'text-[55rpx]',
  },
] as const

describe('vite misescape regressions', () => {
  it.each(misescapeCases)('keeps non-class JS and JSX text untouched in $label', ({ majorVersion, runtimeClass }) => {
    const jsHandler = createJsHandler({
      babelParserOptions: {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      },
      escapeMap: MappingChars2String,
      needEscaped: true,
      tailwindcssMajorVersion: majorVersion,
    })
    const classNameSet = new Set([runtimeClass])
    const code = `
const literal = "Hello world!"
const trace = "at App.vue:4 index.ts:120:3"
const expression = "size > 4 ? Hello world! : keep-[business]"
const view = <View className="${runtimeClass}">Hello world!</View>
`

    const result = jsHandler(code, classNameSet).code

    expect(result).toContain(`className="${replaceWxml(runtimeClass, { escapeMap: MappingChars2String })}"`)
    expect(result).toContain('"Hello world!"')
    expect(result).toContain('>Hello world!</View>')
    expect(result).toContain('at App.vue:4 index.ts:120:3')
    expect(result).toContain('keep-[business]')
    expect(result).not.toContain('Hello world_e')
    expect(result).not.toContain('App_dvue_c4')
    expect(result).not.toContain('index_dts_c120_c3')
    expect(result).not.toContain('keep-_bbusiness_B')
  })

  it('supports single and double quoted content utilities by default', () => {
    const singleQuoted = 'before:content-[\'11111\']'
    const doubleQuoted = 'before:content-["11111"]'
    const jsHandler = createJsHandler({
      babelParserOptions: {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      },
      escapeMap: MappingChars2String,
      needEscaped: true,
      tailwindcssMajorVersion: 3,
    })

    const singleResult = jsHandler(
      `<View className="${singleQuoted}">Hello world!</View>`,
      new Set([singleQuoted]),
    ).code
    const doubleResult = jsHandler(
      `<View className='${doubleQuoted}'>Hello world!</View>`,
      new Set([doubleQuoted]),
    ).code

    expect(singleResult).toContain(replaceWxml(singleQuoted, { escapeMap: MappingChars2String }))
    expect(doubleResult).toContain(replaceWxml(doubleQuoted, { escapeMap: MappingChars2String }))
    expect(doubleResult).toContain('Hello world!')
  })

  it.each(misescapeCases)('keeps non-class WXML text and expressions untouched in $label', async ({ majorVersion, runtimeClass }) => {
    const jsHandler = createJsHandler({
      escapeMap: MappingChars2String,
      needEscaped: true,
      tailwindcssMajorVersion: majorVersion,
    })
    const templateHandler = createTemplateHandler({
      escapeMap: MappingChars2String,
      jsHandler,
    })
    const wxml = `
<view class="${runtimeClass}">Hello world!</view>
<view class="{{ active ? '${runtimeClass}' : 'text-red-500' }}">{{ message === 'Hello world!' ? 'keep-[business]' : 'at App.vue:4' }}</view>
<view data-label="Hello world!" aria-label="keep-[business]"></view>
`

    const result = await templateHandler(wxml, { runtimeSet: new Set([runtimeClass]) })

    expect(result).toContain(`class="${replaceWxml(runtimeClass, { escapeMap: MappingChars2String })}"`)
    expect(result).toContain(`active ? '${replaceWxml(runtimeClass, { escapeMap: MappingChars2String })}'`)
    expect(result).toContain('>Hello world!</view>')
    expect(result).toContain("message === 'Hello world!'")
    expect(result).toContain("'text-red-500'")
    expect(result).toContain("'keep-[business]'")
    expect(result).toContain("'at App.vue:4'")
    expect(result).toContain('data-label="Hello world!"')
    expect(result).toContain('aria-label="keep-[business]"')
    expect(result).not.toContain('Hello world_e')
    expect(result).not.toContain('keep-_bbusiness_B')
    expect(result).not.toContain('App_dvue_c4')
  })

  it.each(misescapeCases)('only retries extracted WXML dynamic candidates in $label', ({ runtimeClass }) => {
    const source = `
<view class="{{ active ? '${runtimeClass}' : 'keep-[business]' }}">{{ message === 'Hello world!' ? 'keep-[business]' : 'at App.vue:4' }}</view>
`

    expect(collectUnescapedDynamicCandidates(source, new Set([runtimeClass]))).toEqual([runtimeClass])
    expect(collectUnescapedDynamicCandidates(source, new Set<string>())).toEqual([])
  })
})
