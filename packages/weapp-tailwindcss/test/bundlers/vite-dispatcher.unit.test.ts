import type { Plugin, ResolvedConfig } from 'vite'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
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

  it('显式生成 target 不覆盖真实 root 推断出的 Taro framework hook', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-dispatcher-taro-'))
    const previousTaroEnv = process.env['TARO_ENV']
    await writeFile(path.join(root, 'package.json'), JSON.stringify({
      dependencies: {
        '@tarojs/taro': '4.2.1',
      },
    }), 'utf8')
    process.env['TARO_ENV'] = 'alipay'

    try {
      const context = createContext({ appType: undefined, generator: { target: 'weapp' } })
      setCurrentContext(context)
      const { WeappTailwindcss } = await import('@/bundlers/vite')
      const plugins = WeappTailwindcss({ generator: { target: 'weapp' } })!
      const post = findPlugin(plugins, ':post')!
      await post.configResolved?.call(post, {
        command: 'build',
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as ResolvedConfig)

      const browserslist = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:taro-alipay-browserslist-asset')!
      const bundle = {}
      expect(browserslist.generateBundle).toBeTypeOf('function')
      await (browserslist.generateBundle as Function).call(browserslist, {}, bundle, false)

      expect(context.appType).toBe('taro')
      expect(bundle).toHaveProperty('.browserslistrc')
    }
    finally {
      if (previousTaroEnv === undefined) {
        delete process.env['TARO_ENV']
      }
      else {
        process.env['TARO_ENV'] = previousTaroEnv
      }
      resetVitePluginTestContext()
      await rm(root, { recursive: true, force: true })
    }
  })
})
