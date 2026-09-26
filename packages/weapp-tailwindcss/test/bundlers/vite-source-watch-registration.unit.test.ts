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
    const roots = new Set<string>()
    let hasCssConsumer = true
    const plugin = createFrameworkSourceCandidatesPlugin({
      prepareTailwindGeneration: async () => {},
      hmrTimingRecorder: { measure: async (_name: string, task: () => Promise<void>) => task() },
      sourceScanSession: { getWatchFiles: () => files },
      tailwindRootCssModuleIds: roots,
    })
    const buildStart = typeof plugin.buildStart === 'function' ? plugin.buildStart : plugin.buildStart?.handler
    const generateBundle = typeof plugin.generateBundle === 'function' ? plugin.generateBundle : plugin.generateBundle?.handler
    expect(buildStart).toBeTypeOf('function')
    const build = async () => {
      const registered = new Set<string>()
      const context = {
        addWatchFile: (id: string) => registered.add(id),
        getModuleInfo: (id: string) => hasCssConsumer && id === 'virtual:tailwind-entry' ? { id } : null,
      } as PluginContext
      await buildStart!.call(context, {} as NormalizedInputOptions)
      expect(registered.size).toBe(0)
      // 首轮 transform 后才知道 CSS 消费者，辅助构建图不能在 buildStart 扫描阶段抢占监听。
      roots.add('virtual:tailwind-entry')
      await generateBundle!.call(context, {} as any, {}, false)
      return registered
    }
    expect(await build()).toEqual(new Set([file]))
    expect(await build()).toEqual(new Set([file]))
    files = new Set()
    expect(await build()).toEqual(new Set())
    files = new Set([file])
    expect(await build()).toEqual(new Set([file]))
    hasCssConsumer = false
    expect(await build()).toEqual(new Set())
    hasCssConsumer = true
    expect(await build()).toEqual(new Set([file]))
  })
})
