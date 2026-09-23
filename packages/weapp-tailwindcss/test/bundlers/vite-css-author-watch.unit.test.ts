import type { Plugin, ResolvedConfig } from 'vite'
import { beforeEach, expect, it, vi } from 'vitest'
import { createContext, createRollupAsset, resetVitePluginTestContext, setCurrentContext } from './vite-plugin.testkit'

beforeEach(() => {
  vi.resetModules()
  resetVitePluginTestContext()
})

it('普通作者 CSS 重复编译后回滚仍消费本轮产物，不能被登记成生成来源', async () => {
  const { WeappTailwindcss } = await import('@/bundlers/vite')
  const styleHandler = vi.fn(async (css: string) => ({ css: css.replace('color:red', 'color:crimson') }))
  setCurrentContext(createContext({
    cssMatcher: (file: string) => file.endsWith('.acss'),
    mainCssChunkMatcher: () => false,
    styleHandler,
  }))
  const postPlugin = WeappTailwindcss()?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
  await (postPlugin.configResolved as any).call(postPlugin, {
    command: 'serve',
    root: process.cwd(),
    css: { postcss: { plugins: [] } },
    build: { outDir: 'dist' },
  } as ResolvedConfig)
  const hook = postPlugin.generateBundle as any
  const generateBundle = typeof hook === 'object' ? hook.handler : hook
  const run = async (source: string) => {
    const asset = { ...createRollupAsset(source), fileName: 'styles/card.acss' }
    await generateBundle.call(postPlugin, {}, { 'styles/card.acss': asset })
    return asset.source.toString()
  }
  const initial = '.scope{--spacing:2rpx;color:red}'
  const cleared = '.scope{color:blue}'

  expect(await run(initial)).toBe('.scope{--spacing:2rpx;color:crimson}')
  expect(await run(cleared)).toBe(cleared)
  expect(await run(cleared)).toBe(cleared)
  expect(styleHandler).toHaveBeenCalledTimes(2)
  expect(await run(initial)).toBe('.scope{--spacing:2rpx;color:crimson}')
  expect(styleHandler).toHaveBeenCalledTimes(3)
})
