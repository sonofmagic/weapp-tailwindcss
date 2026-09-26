import type { NormalizedInputOptions, PluginContext } from 'rollup'
import { describe, expect, it } from 'vitest'
import { createFrameworkSourceCandidatesPlugin } from '@/bundlers/vite/shared/framework-source-candidates-plugin'

describe('Vite 文件型 source 的监听生命周期', () => {
  it.each([
    '/project/source.vue',
    String.raw`C:\project\source.vue`,
    '/source.vue',
    'source.vue',
  ])('每轮构建都向本轮上下文注册仍然有效的扫描文件：%s', async (file) => {
    let files = new Set([file])
    const plugin = createFrameworkSourceCandidatesPlugin({
      prepareTailwindGeneration: async () => {},
      hmrTimingRecorder: { measure: async (_name: string, task: () => Promise<void>) => task() },
      sourceScanSession: { getWatchFiles: () => files },
    })
    const buildStart = typeof plugin.buildStart === 'function' ? plugin.buildStart : plugin.buildStart?.handler
    expect(buildStart).toBeTypeOf('function')
    const build = async () => {
      const registered = new Set<string>()
      const context = { addWatchFile: (id: string) => registered.add(id) } as PluginContext
      await buildStart!.call(context, {} as NormalizedInputOptions)
      return registered
    }
    expect(await build()).toEqual(new Set([file]))
    expect(await build()).toEqual(new Set([file]))
    files = new Set()
    expect(await build()).toEqual(new Set())
    files = new Set([file])
    expect(await build()).toEqual(new Set([file]))
  })
})
