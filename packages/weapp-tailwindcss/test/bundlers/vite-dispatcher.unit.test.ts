import type { Plugin, ResolvedConfig } from 'vite'
import { describe, expect, it } from 'vitest'
import { createContext, resetVitePluginTestContext, setCurrentContext } from './vite-plugin.testkit'

function findPlugin(plugins: Plugin[] | undefined, suffix: string) {
  return plugins?.find(plugin => plugin.name?.endsWith(suffix))
}

describe('vite 单入口 dispatcher', () => {
  it('无标记 Generic 项目在 configResolved 后使用 Web profile', async () => {
    const context = createContext({ appType: undefined, generator: undefined, platform: undefined, cssOptions: undefined })
    setCurrentContext(context)
    const { WeappTailwindcss } = await import('@/bundlers/vite')
    const plugins = WeappTailwindcss()
    const post = findPlugin(plugins, ':post')!
    await post.configResolved?.call(post, {
      command: 'build',
      root: '/project',
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(context.generator).toMatchObject({ target: 'web' })
    const js = findPlugin(plugins, ':js:serve')
    const jsResult = await js?.transform?.call(js, 'const cls = "text-red-500"', '/project/main.ts')
    expect(jsResult).toBeUndefined()
    expect(context.jsHandler).not.toHaveBeenCalled()
    resetVitePluginTestContext()
  })

  it('显式小程序 target 保留主入口的历史插件能力', async () => {
    const context = createContext({ appType: undefined, generator: { target: 'weapp' } })
    setCurrentContext(context)
    const { WeappTailwindcss } = await import('@/bundlers/vite')
    const plugins = WeappTailwindcss()!
    const post = findPlugin(plugins, ':post')!
    await post.configResolved?.call(post, {
      command: 'build',
      root: '/project',
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const js = findPlugin(plugins, ':js:serve')
    expect(js).toBeDefined()
    resetVitePluginTestContext()
  })
})
