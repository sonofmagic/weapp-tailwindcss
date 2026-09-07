import type { Plugin, ResolvedConfig } from 'vite'
import { postcss } from '@weapp-tailwindcss/postcss'
import { expect, it, vi } from 'vitest'
import { createJsHandler } from '@/js'
import { createUniAppXPlugins } from '@/uni-app-x/vite'

function hook(plugin: Plugin, name: 'load' | 'transform') {
  const value = plugin[name] as any
  return typeof value === 'object' ? value.handler : value
}

it.each(['/project/Probe.uvue', 'C:\\project\\Probe.uvue', '/Probe.uvue', 'components/Probe.uvue'])('keeps generated Web style requests owned by their SFC: %s', async (id) => {
  const plugins = createUniAppXPlugins({
    appType: 'uni-app-x',
    customAttributesEntities: [],
    disabledDefaultTemplateHandler: false,
    mainCssChunkMatcher: vi.fn(() => true),
    runtimeState: { readyPromise: Promise.resolve() },
    styleHandler: async code => await postcss().process(code, { from: undefined, map: { inline: false } }),
    jsHandler: createJsHandler({}),
    ensureRuntimeClassSet: async () => new Set(['h-8', 'h-12']),
    getResolvedConfig: () => ({ command: 'serve', root: '/project' } as ResolvedConfig),
    isWebGeneratorTarget: () => true,
    uniAppX: {
      enabled: true,
      componentLocalStyles: { enabled: true, onlyWhenStyleIsolationVersion2: false, componentMatcher: () => true },
    },
  })
  const sfc = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue')!
  const css = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css:pre')!
  const styleId = `${id}?vue&type=style&index=1&scoped=probe&lang.css`
  for (const utility of ['h-8', 'h-12', 'h-8']) {
    const source = `<template><view class="${utility}" /></template><style>.author { color: red; }</style>`
    const output = await hook(sfc, 'transform').call(sfc, source, id)
    expect(output.code).toContain(`@apply ${utility};`)
    // 框架可能为不存在于原始描述符中的生成块返回完整 SFC。
    expect(await hook(sfc, 'transform').call(sfc, source, styleId)).toBeUndefined()
    const loaded = await hook(css, 'load').call(css, styleId)
    expect(loaded.code).toContain(`@apply ${utility};`)
    expect(loaded.code).not.toContain('<template>')
    expect(loaded.code).not.toContain(`@apply ${utility === 'h-8' ? 'h-12' : 'h-8'};`)
    const alias = output.code.match(/class="([^"]+)"/)![1]
    expect(loaded.code).toContain(`.${alias}`)
    const transformed = await hook(css, 'transform').call(css, source, styleId)
    expect(transformed.code).toContain(`@apply ${utility};`)
    expect(transformed.code).toContain(`.${alias}`)
    expect(transformed.code).not.toContain('<template>')
  }
  await hook(sfc, 'transform').call(sfc, '<template><view /></template><style>.author { color: red; }</style>', id)
  expect(await hook(css, 'load').call(css, styleId)).toBeUndefined()
})
