import type { OutputAsset } from 'rollup'
import type { HmrContext, Plugin, ResolvedConfig, TransformResult } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { replaceWxml } from '@/wxml'
import {
  createContext,
  createRollupChunk,
  getCurrentContext,
  getTransformUVueMock,
  resetVitePluginTestContext,
  setCurrentContext,
} from './vite-plugin.testkit'

const TEST_TIMEOUT_MS = 2000

async function loadUnifiedVitePlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.UnifiedViteWeappTailwindcssPlugin
}

describe('bundlers/vite UnifiedViteWeappTailwindcssPlugin uni-app-x', () => {
  beforeEach(() => {
    vi.resetModules()
    resetVitePluginTestContext()
  })

  it('provides uni-app-x specific transforms', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const transformUVueMock = getTransformUVueMock()
    const runtimeSet = new Set(['uvue'])
    setCurrentContext(createContext())
    const currentContext = getCurrentContext()
    currentContext.uniAppX = { enabled: true }
    currentContext.twPatcher = {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => {
        throw new Error('getClassSetSync is not supported for Tailwind CSS v4 projects. Use getClassSet instead.')
      }),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 4,
    }
    currentContext.onStart = vi.fn()
    currentContext.onEnd = vi.fn()

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeDefined()
    const cssPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css') as Plugin
    const cssPrePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css:pre') as Plugin
    const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    expect(cssPlugin?.transform).toBeTypeOf('function')
    expect(cssPrePlugin?.transform).toBeTypeOf('function')
    expect(nvuePlugin?.transform).toBeTypeOf('function')

    const cssTransform = cssPlugin.transform as any
    const cssResult = await cssTransform?.call(cssPlugin, '.foo { color: red; }', 'App.uvue?vue&type=style&index=0') as TransformResult
    expect(cssResult?.code).toBe('css:.foo { color: red; }')
    expect(cssResult?.map).toBeTruthy()

    const nvueBuildStart = nvuePlugin.buildStart as any
    await nvueBuildStart?.call(nvuePlugin)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    const nvueTransform = nvuePlugin.transform as any
    const nvueResult = await nvueTransform?.call(nvuePlugin, 'console.log("x")', 'App.nvue')
    expect(transformUVueMock).toHaveBeenCalledWith('console.log("x")', 'App.nvue', currentContext.jsHandler, runtimeSet)
    expect(nvueResult).toEqual({ code: 'uvue:App.nvue:console.log("x")' })

    const bundle = {
      'index.js': createRollupChunk('const answer = "text-[#424242]"'),
      'index.asset.js': {
        type: 'asset',
        fileName: 'index.js',
        source: 'console.log("text-[#565656]")',
        name: undefined,
        needsCodeReference: false,
        names: [] as string[],
        originalFileName: null,
        originalFileNames: [] as string[],
      } satisfies OutputAsset,
    }

    const generateBundle = postPlugin.generateBundle as any
    await generateBundle?.call(postPlugin, {} as any, bundle)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)

    expect(currentContext.jsHandler).toHaveBeenCalledWith(
      'const answer = "text-[#424242]"',
      runtimeSet,
      expect.objectContaining({
        filename: expect.stringContaining('index.js'),
        moduleGraph: expect.objectContaining({
          resolve: expect.any(Function),
          load: expect.any(Function),
        }),
        babelParserOptions: expect.objectContaining({
          sourceFilename: expect.stringContaining('index.js'),
        }),
      }),
    )
    expect((bundle['index.js'] as any).code).toBe('js:const answer = "text-[#424242]"')
    expect(currentContext.jsHandler).toHaveBeenCalledWith(
      'console.log("text-[#565656]")',
      runtimeSet,
      expect.objectContaining({
        filename: expect.stringContaining('index.asset.js'),
        moduleGraph: expect.objectContaining({
          resolve: expect.any(Function),
          load: expect.any(Function),
        }),
        babelParserOptions: expect.objectContaining({
          plugins: ['typescript'],
          sourceType: 'unambiguous',
          sourceFilename: expect.stringContaining('index.asset.js'),
        }),
        uniAppX: currentContext.uniAppX,
      }),
    )
    expect((bundle['index.asset.js'] as OutputAsset).source).toBe('js:console.log("text-[#565656]")')
  }, TEST_TIMEOUT_MS)

  it('reuses css handler override objects for repeated uni-app-x style transforms', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      uniAppX: { enabled: true },
    }))
    const currentContext = getCurrentContext()

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const cssPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css') as Plugin
    expect(cssPlugin).toBeTruthy()

    const cssTransform = cssPlugin.transform as any
    await cssTransform?.call(cssPlugin, '.foo { color: red; }', 'App.uvue?vue&type=style&index=0')
    await cssTransform?.call(cssPlugin, '.foo { color: blue; }', 'App.uvue?vue&type=style&index=0')

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect(currentContext.styleHandler.mock.calls[0]?.[1]).toBe(currentContext.styleHandler.mock.calls[1]?.[1])
  }, TEST_TIMEOUT_MS)

  it('forces runtime refresh for every uni-app-x transform when serving', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const transformUVueMock = getTransformUVueMock()
    const runtimeSets = [
      new Set(['text-[#123456]']),
      new Set(['text-[#123456]', 'text-[#234567]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      uniAppX: { enabled: true },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const originalImplementation = transformUVueMock.getMockImplementation()
    transformUVueMock.mockImplementation((code: string, _id: string, _jsHandler?: unknown, runtimeSet?: Set<string>) => {
      let result = code
      for (const className of (runtimeSet ?? new Set<string>())) {
        result = result.replaceAll(className, replaceWxml(className))
      }
      return { code: result }
    })

    try {
      const plugins = UnifiedViteWeappTailwindcssPlugin()
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
      expect(postPlugin).toBeTruthy()
      expect(nvuePlugin).toBeTruthy()

      const config = {
        command: 'serve',
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
        root: process.cwd(),
      } as unknown as ResolvedConfig
      await (postPlugin.configResolved as any)?.call(postPlugin, config)
      await (nvuePlugin.buildStart as any)?.call(nvuePlugin)

      const hashedExisting = replaceWxml('text-[#123456]')
      const hashedNew = replaceWxml('text-[#234567]')

      const firstResult = await (nvuePlugin.transform as any)?.call(
        nvuePlugin,
        '<template><view class="text-[#123456]"/></template>',
        'Component.uvue',
      )
      expect(firstResult?.code).toContain(hashedExisting)
      expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
      expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)

      runtimeIndex = 1
      const secondResult = await (nvuePlugin.transform as any)?.call(
        nvuePlugin,
        '<template><view class="text-[#234567]"/></template>',
        'Component.uvue',
      )
      expect(secondResult?.code).toContain(hashedNew)
      expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(3)
      expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(3)
    }
    finally {
      transformUVueMock.mockImplementation(
        originalImplementation ?? ((code: string, id: string) => ({ code: `uvue:${id}:${code}` })),
      )
    }
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set during build watch transforms so new classes are hashed immediately', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const transformUVueMock = getTransformUVueMock()
    const runtimeSets = [
      new Set(['text-[#123456]']),
      new Set(['text-[#123456]', 'text-[#345678]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      uniAppX: { enabled: true },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const originalImplementation = transformUVueMock.getMockImplementation()
    transformUVueMock.mockImplementation((code: string, _id: string, _jsHandler?: unknown, runtimeSet?: Set<string>) => {
      let result = code
      for (const className of (runtimeSet ?? new Set<string>())) {
        result = result.replaceAll(className, replaceWxml(className))
      }
      return { code: result }
    })

    try {
      const plugins = UnifiedViteWeappTailwindcssPlugin()
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
      expect(postPlugin).toBeTruthy()
      expect(nvuePlugin).toBeTruthy()

      const config = {
        command: 'build',
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist', watch: {} },
        root: process.cwd(),
      } as unknown as ResolvedConfig
      await (postPlugin.configResolved as any)?.call(postPlugin, config)
      await (nvuePlugin.buildStart as any)?.call(nvuePlugin)

      const hashedExisting = replaceWxml('text-[#123456]')
      const hashedNew = replaceWxml('text-[#345678]')

      const firstResult = await (nvuePlugin.transform as any)?.call(
        nvuePlugin,
        '<template><view class="text-[#123456]"/></template>',
        'Component.uvue',
      )
      expect(firstResult?.code).toContain(hashedExisting)
      expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
      expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)

      runtimeIndex = 1
      const secondResult = await (nvuePlugin.transform as any)?.call(
        nvuePlugin,
        '<template><view class="text-[#345678]"/></template>',
        'Component.uvue',
      )
      expect(secondResult?.code).toContain(hashedNew)
      expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(3)
      expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(3)
    }
    finally {
      transformUVueMock.mockImplementation(
        originalImplementation ?? ((code: string, id: string) => ({ code: `uvue:${id}:${code}` })),
      )
    }
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set on .uvue/.nvue hot updates in serve mode', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const runtimeSets = [
      new Set(['text-[#123456]']),
      new Set(['text-[#234567]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      uniAppX: { enabled: true },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(nvuePlugin).toBeTruthy()

    const config = {
      command: 'serve',
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
      root: process.cwd(),
    } as unknown as ResolvedConfig
    await (postPlugin.configResolved as any)?.call(postPlugin, config)
    await (nvuePlugin.buildStart as any)?.call(nvuePlugin)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    runtimeIndex = 1
    await (nvuePlugin.handleHotUpdate as any)?.call(nvuePlugin, { file: '/src/pages/foo.uvue' } as HmrContext)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    runtimeIndex = 1
    await (nvuePlugin.handleHotUpdate as any)?.call(nvuePlugin, { file: '/src/pages/foo.nvue' } as HmrContext)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    await (nvuePlugin.handleHotUpdate as any)?.call(nvuePlugin, { file: '/src/pages/foo.vue' } as HmrContext)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
    expect(currentContext.twPatcher.getClassSetSync).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set on .uvue/.nvue watch changes in build watch mode', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const runtimeSets = [
      new Set(['text-[#123456]']),
      new Set(['text-[#654321]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      uniAppX: { enabled: true },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(nvuePlugin).toBeTruthy()

    const config = {
      command: 'build',
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
      root: process.cwd(),
    } as unknown as ResolvedConfig
    await (postPlugin.configResolved as any)?.call(postPlugin, config)
    await (nvuePlugin.buildStart as any)?.call(nvuePlugin)

    runtimeIndex = 1
    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    await (nvuePlugin.watchChange as any)?.call(nvuePlugin, '/src/pages/foo.uvue')
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    await (nvuePlugin.watchChange as any)?.call(nvuePlugin, '/src/pages/foo.nvue')
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    await (nvuePlugin.watchChange as any)?.call(nvuePlugin, '/src/pages/foo.vue')
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
    expect(currentContext.twPatcher.getClassSetSync).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('forces runtime refresh for uni-app-x transform even for non-watch build runs', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const transformUVueMock = getTransformUVueMock()
    const runtimeSets = [
      new Set(['text-[#aaaaaa]']),
      new Set(['text-[#aaaaaa]', 'text-[#bbbbbb]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      uniAppX: { enabled: true },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(nvuePlugin).toBeTruthy()

    const config = {
      command: 'build',
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
      root: process.cwd(),
    } as unknown as ResolvedConfig
    await (postPlugin.configResolved as any)?.call(postPlugin, config)
    await (nvuePlugin.buildStart as any)?.call(nvuePlugin)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    runtimeIndex = 1
    await (nvuePlugin.transform as any)?.call(nvuePlugin, '<template></template>', 'App.uvue')
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(transformUVueMock).toHaveBeenCalledWith('<template></template>', 'App.uvue', currentContext.jsHandler, runtimeSets[1])
  }, TEST_TIMEOUT_MS)
})
