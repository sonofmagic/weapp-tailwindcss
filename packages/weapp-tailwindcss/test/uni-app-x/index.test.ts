import type { ICustomAttributesEntities, JsHandler } from '@/types'
import { createGetCase, fixturesRootPath } from '#test/util'
import process from 'node:process'
import { beforeEach, afterEach } from 'vitest'
import { vi } from 'vitest'
import { getCompilerContext } from '@/context'
import { transformUVue } from '@/uni-app-x'
import { replaceWxml } from '@/wxml'

const getCase = createGetCase(fixturesRootPath)

function extractInjectedStyle(code: string) {
  const matches = [...code.matchAll(/<style scoped>\n([\s\S]*?)\n<\/style>/g)]
  const last = matches.at(-1)
  return last?.[1] ?? ''
}

function extractAliasByUtility(styleBlock: string) {
  const entries = [...styleBlock.matchAll(/\.([A-Za-z0-9-]+) \{\n  @apply ([^;]+);/g)]
  return new Map(entries.map(match => [match[2], match[1]]))
}

describe('uni-app-x', () => {
  const originalUtsPlatform = process.env.UNI_UTS_PLATFORM

  beforeEach(() => {
    process.env.UNI_UTS_PLATFORM = originalUtsPlatform
  })

  afterEach(() => {
    process.env.UNI_UTS_PLATFORM = originalUtsPlatform
  })

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

  it('transforms object literal class bindings with whitespace', () => {
    const { jsHandler } = getCompilerContext()
    const runtimeSet = new Set<string>([
      'border-[#ff0000]',
      'bg-blue-600/50',
    ])
    const code = `
<template>
  <view :class="{ 'border-[#ff0000] bg-blue-600/50': isActive }">hello</view>
</template>
`
    const result = transformUVue(code, 'literal.uvue', jsHandler, runtimeSet)
    expect(result?.code).toContain(replaceWxml('border-[#ff0000] bg-blue-600/50'))
  })

  it('transforms array and ternary based vue bindings', () => {
    const { jsHandler } = getCompilerContext()
    const runtimeSet = new Set<string>([
      'bg-[#123456]',
      'bg-[#654321]',
      'text-[#ff0000]',
      'font-bold',
      'border-[#111111]',
      'border-solid',
      'bg-[#999999]',
      'text-[#b01515]',
    ])
    const code = `
<template>
  <view :class="[
      flag ? 'bg-[#123456]' : 'bg-[#654321]',
      extra,
      { 'text-[#ff0000] font-bold': toggled },
      condition && 'border-[#111111] border-solid'
    ]">
    complex
  </view>
  <text class="" :class="condition ? 'bg-[#999999] text-[#b01515]' : ''">fallback</text>
  <text :class="">empty</text>
</template>
<script setup lang="ts">
const flag = true
const extra = 'font-bold'
const toggled = true
const condition = true
</script>
`
    const result = transformUVue(code, 'complex.uvue', jsHandler, runtimeSet)
    expect(result?.code).toContain(`'${replaceWxml('bg-[#123456]')}'`)
    expect(result?.code).toContain(`'${replaceWxml('bg-[#654321]')}'`)
    expect(result?.code).toContain(`'${replaceWxml('text-[#ff0000] font-bold')}'`)
    expect(result?.code).toContain(`'${replaceWxml('border-[#111111] border-solid')}'`)
    expect(result?.code).toContain(replaceWxml('bg-[#999999]'))
    expect(result?.code).toContain(replaceWxml('text-[#b01515]'))
  })

  it('respects customAttributes for static and dynamic bindings', () => {
    const { jsHandler } = getCompilerContext()
    const runtimeSet = new Set<string>([
      'bg-[#121212]',
      'bg-[#343434]',
      'text-[#565656]',
    ])
    const customAttributesEntities: ICustomAttributesEntities = [
      ['*', ['foo-class']],
      ['view', ['bar-class']],
    ]
    const code = `
<template>
  <view foo-class="bg-[#121212]" :foo-class="condition ? 'bg-[#343434]' : ''">
    <view :bar-class="'text-[#565656]'">inner</view>
  </view>
</template>
<script setup lang="ts">
const condition = true
</script>
`
    const result = transformUVue(code, 'custom.uvue', jsHandler, runtimeSet, {
      customAttributesEntities,
    })
    expect(result?.code).toContain(`foo-class="${replaceWxml('bg-[#121212]')}"`)
    expect(result?.code).toContain(replaceWxml('bg-[#343434]'))
    expect(result?.code).toContain(replaceWxml('text-[#565656]'))
  })

  it('honors disabledDefaultTemplateHandler with custom class rules', () => {
    const { jsHandler } = getCompilerContext()
    const runtimeSet = new Set<string>([
      'bg-[#abcdef]',
      'bg-[#fedcba]',
    ])
    const customAttributesEntities: ICustomAttributesEntities = [
      ['*', ['class']],
    ]
    const code = `
<template>
  <view class="bg-[#abcdef]" :class="'bg-[#fedcba]'">content</view>
</template>
`
    const result = transformUVue(code, 'disabled-default.uvue', jsHandler, runtimeSet, {
      customAttributesEntities,
      disabledDefaultTemplateHandler: true,
    })
    expect(result?.code).toContain(replaceWxml('bg-[#abcdef]'))
    expect(result?.code).toContain(replaceWxml('bg-[#fedcba]'))
  })

  it('ignores non-uvue files', () => {
    const jsHandler: JsHandler = vi.fn((source: string) => ({ code: source }))
    const result = transformUVue('<template><view/></template>', 'App.vue', jsHandler, new Set())
    expect(result).toBeUndefined()
    expect(jsHandler).not.toHaveBeenCalled()
  })

  it('does not expand static space-y utility in uvue template', () => {
    const { jsHandler } = getCompilerContext()
    const code = `
<template>
  <view class="space-y-4 px-4">
    <view />
    <view class="text-[#123456]" />
    <text :class="dynamicCls">hello</text>
    text
  </view>
</template>
`
    const result = transformUVue(code, '/src/pages/index.uvue', jsHandler, new Set([
      'space-y-4',
      'px-4',
      'text-[#123456]',
    ]))

    expect(result?.code).toContain('class="space-y-4 px-4"')
    expect(result?.code).toContain(`class="text-_b_h123456_B"`)
    expect(result?.code).toContain(':class="dynamicCls"')
    expect(result?.code).not.toContain('wts-')
    expect(result?.code).not.toContain('@apply mt-4;')
  })

  it('does not expand static space-x utility in uvue template', () => {
    const { jsHandler } = getCompilerContext()
    const code = `
<template>
  <view class="space-x-[12px]">
    <view />
    <view />
  </view>
</template>
`
    const result = transformUVue(code, '/src/pages/space-x.uvue', jsHandler, new Set(['space-x-[12px]']))
    expect(result?.code).toContain('class="space-x-_b12px_B"')
    expect(result?.code).not.toContain('wts-')
    expect(result?.code).not.toContain('@apply ml-[12px];')
  })

  it('does not expand reversed space utilities in uvue template', () => {
    const { jsHandler } = getCompilerContext()
    const code = `
<template>
  <view class="space-y-4 space-y-reverse space-x-2 space-x-reverse px-4">
    <view />
    <view />
  </view>
</template>
`
    const result = transformUVue(code, '/src/pages/space-reverse.uvue', jsHandler, new Set([
      'space-y-4',
      'space-y-reverse',
      'space-x-2',
      'space-x-reverse',
      'px-4',
    ]))

    expect(result?.code).toContain('class="space-y-4 space-y-reverse space-x-2 space-x-reverse px-4"')
    expect(result?.code).not.toContain('wts-')
    expect(result?.code).not.toContain('@apply mb-4;')
    expect(result?.code).not.toContain('@apply mr-2;')
  })

  it('does not expand dynamic parent space utilities in uvue template', () => {
    const { jsHandler } = getCompilerContext()
    const runtimeSet = new Set<string>([
      'space-y-4',
      'px-4',
      'text-[#123456]',
    ])
    const code = `
<template>
  <view :class="['space-y-4', 'px-4']">
    <view />
    <text class="text-[#123456]">hello</text>
  </view>
</template>
`
    const result = transformUVue(code, '/src/pages/dynamic-space-parent.uvue', jsHandler, runtimeSet)

    expect(result?.code).not.toContain('@apply mt-4;')
    expect(result?.code).not.toContain('wts-')
    expect(result?.code).toContain('space-y-4')
    expect(result?.code).toContain('px-4')
    expect(result?.code).toContain(replaceWxml('text-[#123456]'))
  })

  it.each(['app-android', 'app-ios', 'web'])(
    'supports issue 822 component local styles on %s',
    async (platform) => {
      process.env.UNI_UTS_PLATFORM = platform
      const { jsHandler } = getCompilerContext({
        uniAppX: true,
      })
      const runtimeSet = new Set<string>([
        'border',
        'border-solid',
        'border-[#999]',
        'p-4',
        'w-full',
        'h-[200px]',
        'bg-[#87add3]',
        'text-[#111]',
        'p-[20.32px]',
        'border-[#111111]',
        'bg-[#123456]',
        'mb-[12.32px]',
        'bg-[#d7700a]',
        'text-[93.54rpx]',
        'bg-[#d2e252]',
        'text-[#ff0000]',
        'bg-[#f205f6]',
        'text-[#70ed0a]',
      ])
      const source = await getCase('uni-app-x/issue-822/components/ScopedChild.uvue')
      const result = transformUVue(
        source,
        '/src/components/ScopedChild.uvue',
        jsHandler,
        runtimeSet,
        { enableComponentLocalStyle: true },
      )

      expect(result?.code).toContain('<style scoped>')
      const styleBlock = extractInjectedStyle(result!.code)
      const aliasByUtility = extractAliasByUtility(styleBlock)
      expect(aliasByUtility.get('bg-[#87add3]')).toBeTruthy()
      expect(aliasByUtility.get('text-[93.54rpx]')).toBeTruthy()
      expect(aliasByUtility.get('bg-[#123456]')).toBeTruthy()
      expect(result?.code).toContain(`class="${aliasByUtility.get('border')} ${aliasByUtility.get('border-solid')} ${aliasByUtility.get('border-[#999]')} ${aliasByUtility.get('p-4')}"`)
      expect(result?.code).toContain(aliasByUtility.get('text-[#111]')!)
      expect(result?.code).toContain(aliasByUtility.get('bg-[#123456]')!)
      expect(result?.code).toContain(aliasByUtility.get('text-[93.54rpx]')!)
      expect(result?.code).not.toContain(replaceWxml('bg-[#123456]'))

      expect(styleBlock).toContain(`.${aliasByUtility.get('bg-[#87add3]')} {`)
      expect(styleBlock).toContain('@apply bg-[#87add3];')
      expect(styleBlock).toContain('@apply text-[93.54rpx];')
      expect(styleBlock).toContain('@apply bg-[#123456];')
    },
  )

  it('keeps custom scoped classes out of component local @apply output on app-android', async () => {
    process.env.UNI_UTS_PLATFORM = 'app-android'
    const { jsHandler } = getCompilerContext({
      uniAppX: true,
    })
    const runtimeSet = new Set<string>([
      'border',
      'border-solid',
      'border-[#999]',
      'p-4',
      'w-full',
      'h-[200px]',
      'bg-[#87add3]',
      'text-[#111]',
      'bg-[#123456]',
      'mb-[12.32px]',
      'bg-[#d7700a]',
    ])
    const source = await getCase('uni-app-x/issue-822/components/ScopedChildMixed.uvue')
    const result = transformUVue(
      source,
      '/src/components/ScopedChildMixed.uvue',
      jsHandler,
      runtimeSet,
      { enableComponentLocalStyle: true },
    )

    expect(result?.code).toContain('<style scoped>')
    expect(result?.code).toContain('class="manual-child"')
    const styleBlock = extractInjectedStyle(result!.code)
    const aliasByUtility = extractAliasByUtility(styleBlock)
    expect(aliasByUtility.get('bg-[#87add3]')).toBeTruthy()
    expect(aliasByUtility.get('bg-[#123456]')).toBeTruthy()
    expect(result?.code).toContain(aliasByUtility.get('text-[#111]')!)
    expect(result?.code).toContain(aliasByUtility.get('bg-[#123456]')!)
    expect(result?.code).toContain('.manual-child {')
    expect(result?.code).toContain('width: 123px;')
    expect(styleBlock).not.toContain('@apply manual-child;')
    expect(result?.code).not.toContain('@apply manual-child;')
    expect(styleBlock).toContain('@apply bg-[#87add3];')
    expect(styleBlock).toContain('@apply bg-[#123456];')
  })
})
