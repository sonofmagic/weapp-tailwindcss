import type { JsHandler } from '@/types'
import { createGetCase, fixturesRootPath } from '#test/util'
import { vi } from 'vitest'
import { getCompilerContext } from '@/context'
import { transformUVue } from '@/uni-app-x'
import { replaceWxml } from '@/wxml'

const getCase = createGetCase(fixturesRootPath)

describe('uni-app-x', () => {
  it('index.uvue', async () => {
    const { jsHandler } = getCompilerContext()
    const vueRawCode = await getCase('uni-app-x/index.uvue')
    const classNameSet = new Set<string>()
    classNameSet.add('text-[#258f27]')
    classNameSet.add('text-[100px]')
    classNameSet.add('py-[22.32px]')

    expect(transformUVue(vueRawCode, 'index.uvue', jsHandler, classNameSet)).toMatchSnapshot()
  })

  it('app.uvue', async () => {
    const { jsHandler } = getCompilerContext()
    const vueRawCode = await getCase('uni-app-x/App.uvue')
    const classNameSet = new Set<string>()
    classNameSet.add('text-[#258f27]')
    classNameSet.add('text-[100px]')
    classNameSet.add('py-[22.32px]')

    expect(transformUVue(vueRawCode, 'App.uvue', jsHandler, classNameSet)).toMatchSnapshot()
  })

  it('setup-lang-uts.uvue', async () => {
    const { jsHandler } = getCompilerContext()
    const vueRawCode = await getCase('uni-app-x/setup-lang-uts.uvue')
    const classNameSet = new Set<string>()
    classNameSet.add('text-[#258f27]')
    classNameSet.add('text-[100px]')
    classNameSet.add('py-[22.32px]')
    classNameSet.add('bg-[#000]')
    classNameSet.add('bg-[#111]')
    classNameSet.add('bg-[#222]')

    expect(transformUVue(vueRawCode, 'setup-lang-uts.uvue', jsHandler, classNameSet)).toMatchSnapshot()
  })

  it('transforms static and dynamic class bindings', () => {
    const runtimeSet = new Set<string>()
    const jsHandler: JsHandler = vi.fn((source: string) => ({ code: `handled(${source})` }))
    const code = `
<template>
  <view class="text-[#123]" :class="dynamicCls">
    <text>{{ label }}</text>
  </view>
</template>
<script lang="ts">
const label = 'hi'
</script>
`
    const result = transformUVue(code, 'sample.uvue', jsHandler, runtimeSet)
    expect(result?.code).toContain(`class="${replaceWxml('text-[#123]')}"`)
    expect(result?.code).toContain('handled(dynamicCls)')
    expect(result?.code).toContain('handled(\nconst label = \'hi\'\n)')
    expect(jsHandler).toHaveBeenCalled()
  })

  it('ignores non-uvue files', () => {
    const jsHandler: JsHandler = vi.fn((source: string) => ({ code: source }))
    const result = transformUVue('<template><view/></template>', 'App.vue', jsHandler, new Set())
    expect(result).toBeUndefined()
    expect(jsHandler).not.toHaveBeenCalled()
  })
})
