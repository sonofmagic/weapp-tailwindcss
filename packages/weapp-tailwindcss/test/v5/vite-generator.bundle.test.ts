import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createContext,
  createRollupAsset,
  createRollupChunk,
  getCurrentContext,
  resetVitePluginTestContext,
  setCurrentContext,
} from '../bundlers/vite-plugin.testkit'

const TEST_TIMEOUT_MS = 30000
const createdDirs: string[] = []

async function loadUnifiedVitePlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.WeappTailwindcss
}

function getGenerateBundleHandler(plugin: Plugin) {
  const hook = plugin.generateBundle as any
  return typeof hook === 'object' ? hook.handler : hook
}

function getTransformHandler(plugin: Plugin) {
  const hook = plugin.transform as any
  return typeof hook === 'object' ? hook.handler : hook
}

function getOutputOptionsHandler(plugin: Plugin) {
  const hook = plugin.outputOptions as any
  return typeof hook === 'object' ? hook.handler : hook
}

async function resolvePostPlugin() {
  const WeappTailwindcss = await loadUnifiedVitePlugin()
  const plugins = WeappTailwindcss()
  const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
  const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
  expect(sourcePlugin).toBeTruthy()
  expect(postPlugin).toBeTruthy()

  await (postPlugin.configResolved as any)?.call(postPlugin, {
    command: 'serve',
    root: process.cwd(),
    css: { postcss: { plugins: [] } },
    build: { outDir: 'dist' },
  } as ResolvedConfig)

  return {
    postPlugin,
    sourcePlugin,
  }
}

describe('v5 vite generator bundle', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doUnmock('@/bundlers/vite/incremental-runtime-class-set')
    vi.doUnmock('@/generator')
    resetVitePluginTestContext()
    vi.restoreAllMocks()
  })

  afterEach(async () => {
    await Promise.all(
      createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
    )
  })

  it('can force generator output for tailwind v4 main css without relying on the tailwind banner', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '.w-\\[100px\\]{width:100px}'
    const userCss = '\n.card:hover{color:red}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    const styleHandler = vi.fn(async (code: string) => ({ css: `user:${code}` }))
    setCurrentContext(createContext({
      generator: {
        target: 'weapp',
        styleOptions: {
          cssChildCombinatorReplaceValue: 'view',
        },
      },
      styleHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const { postPlugin, sourcePlugin } = await resolvePostPlugin()
    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, 'export const cls = "w-[100px]"', '/project/src/pages/index.tsx')
    const bundle = {
      'app.js': {
        code: 'const cls = "w-[100px]"',
        fileName: 'app.js',
        type: 'chunk',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${weappCss}\nuser:${userCss}`)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
      target: 'weapp',
      styleOptions: expect.objectContaining({
        cssChildCombinatorReplaceValue: 'view',
        isMainChunk: true,
      }),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('w-[100px]')).toBe(true)
    const userCssCall = styleHandler.mock.calls.find(([code]) => code === userCss)
    expect(userCssCall).toBeTruthy()
    expect(userCssCall?.[1]).toMatchObject({
      isMainChunk: false,
      majorVersion: 4,
    })
  }, TEST_TIMEOUT_MS)

  it('uses generator css as the source of truth when forced output does not match vite css prefix', async () => {
    const runtimeSet = new Set(['w-[100px]', 'text-red-500'])
    const viteCss = '.w-\\[100px\\]{width:100px}'
    const rawTailwindCss = `${viteCss}.text-red-500{color:red}`
    const weappCss = '.w-_b100px_B{width:100px}.text-red-500{color:red}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const { postPlugin, sourcePlugin } = await resolvePostPlugin()
    const currentContext = getCurrentContext()
    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, 'export const cls = "w-[100px] text-red-500"', '/project/src/pages/index.tsx')
    const bundle = {
      'app.js': {
        code: 'const cls = "w-[100px] text-red-500"',
        fileName: 'app.js',
        type: 'chunk',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset(viteCss),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(weappCss)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
      target: 'weapp',
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('w-[100px]')).toBe(true)
    expect(candidates.has('text-red-500')).toBe(true)
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('can emit web css without mini-program post processing for multi-target apps', async () => {
    const runtimeSet = new Set(['hover:bg-blue-500'])
    const rawTailwindCss = '.hover\\:bg-blue-500:hover{color:blue}'
    const userCss = '\n.card:hover{color:red}'
    const generateMock = vi.fn(async () => ({
      css: rawTailwindCss,
      rawCss: rawTailwindCss,
      target: 'web',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const { postPlugin } = await resolvePostPlugin()
    const currentContext = getCurrentContext()
    const bundle = {
      'app.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${rawTailwindCss}${userCss}`)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      target: 'web',
    }))
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('uses generator mode for tailwind v3 main css without changing existing registration', async () => {
    const runtimeSet = new Set(['w-[300.31rpx]', 'hover:bg-blue-500'])
    const rawTailwindCss = '.w-\\[300\\.31rpx\\]{width:300.31rpx}.hover\\:bg-blue-500:hover{color:blue}'
    const userCss = '\n.card:hover{color:red}'
    const weappCss = '.w-_b300_d31rpx_B{width:300.31rpx}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    const resolveV3SourceMock = vi.fn(async () => ({
      version: 3,
      projectRoot: process.cwd(),
      cwd: process.cwd(),
      base: process.cwd(),
      css: '@tailwind utilities;',
      dependencies: [],
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
    }))
    const resolveV4SourceMock = vi.fn()

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV3SourceFromPatcher: resolveV3SourceMock,
        resolveTailwindV4SourceFromPatcher: resolveV4SourceMock,
      }
    })

    const styleHandler = vi.fn(async (code: string) => ({ css: `user:${code}` }))
    setCurrentContext(createContext({
      generator: {
      },
      styleHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 3,
      },
    }))

    const { postPlugin } = await resolvePostPlugin()
    const bundle = {
      'app.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${weappCss}\nuser:${userCss}\nuser:.hover\\:bg-blue-500:hover{color:blue}${userCss}`)
    expect(resolveV3SourceMock).toHaveBeenCalled()
    expect(resolveV4SourceMock).not.toHaveBeenCalled()
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
      target: 'weapp',
      styleOptions: expect.objectContaining({
        isMainChunk: true,
        majorVersion: 3,
      }),
    }))
    expect(generateMock.mock.calls[0]?.[0]?.candidates).toEqual(runtimeSet)
    const userCssCall = styleHandler.mock.calls.find(([code]) => code === userCss)
    expect(userCssCall).toBeTruthy()
    expect(userCssCall?.[1]).toMatchObject({
      isMainChunk: false,
      majorVersion: 3,
    })
  }, TEST_TIMEOUT_MS)

  it('collects v4 generator candidates from source modules instead of bundle products or sourcemaps', async () => {
    const runtimeSet = new Set(['text-red-500'])
    const rawTailwindCss = '.bg-\\[\\#112233\\]{background-color:#112233}.text-red-500{color:red}'
    const weappCss = '.bg-_b_h112233_B{background-color:#112233}.text-red-500{color:red}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: new Set(['bg-[#112233]', 'text-red-500']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set(['bg-[#445566]', 'text-red-500'])),
        getClassSetSync: vi.fn(() => new Set(['bg-[#445566]', 'text-red-500'])),
        extract: vi.fn(async () => ({ classSet: new Set(['bg-[#445566]', 'text-red-500']) })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, 'export const cls = "bg-[#112233] text-red-500"', '/project/src/pages/index.tsx')

    const bundle = {
      'app.js': {
        ...createRollupChunk('const bundled = "bg-[#445566]"'),
        map: {
          version: 3,
          sources: ['../src/pages/index.tsx'],
          sourcesContent: ['export const cls = "bg-[#778899]"'],
          names: [],
          mappings: '',
        },
        fileName: 'app.js',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(generateMock).toHaveBeenCalled()
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('bg-[#112233]')).toBe(true)
    expect(candidates.has('text-red-500')).toBe(true)
    expect(candidates.has('bg-[#445566]')).toBe(false)
    expect(candidates.has('bg-[#778899]')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('regenerates v4 force css when source candidates change but css asset content stays unchanged', async () => {
    const runtimeSet = new Set<string>()
    const generatedCssByCandidate: Record<string, string> = {
      'bg-[#112233]': '.bg-_b_h112233_B{background-color:#112233}',
      'bg-[#445566]': '.bg-_b_h445566_B{background-color:#445566}',
    }
    const generateMock = vi.fn(async ({ candidates }: { candidates: Set<string> }) => {
      const css = [...candidates]
        .map(candidate => generatedCssByCandidate[candidate])
        .filter((item): item is string => Boolean(item))
        .join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: candidates,
        dependencies: [],
        sources: [],
        root: null,
      }
    })

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = () => ({
      'app.js': {
        ...createRollupChunk('const bundled = ""'),
        fileName: 'app.js',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    await transform?.call(sourcePlugin, 'export const cls = "bg-[#112233]"', '/project/src/pages/index.tsx')
    const firstBundle = createBundle()
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle['app.css'] as OutputAsset).source).toBe('.bg-_b_h112233_B{background-color:#112233}')

    await transform?.call(sourcePlugin, 'export const cls = "bg-[#445566]"', '/project/src/pages/index.tsx')
    const secondBundle = createBundle()
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    expect((secondBundle['app.css'] as OutputAsset).source).toBe('.bg-_b_h445566_B{background-color:#445566}')
    expect(generateMock).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('keeps v4 main css source order when build finalizer reprocesses a generated main asset', async () => {
    const runtimeSet = new Set(['flex'])
    const userCss = '.reset-button{padding:0}'
    const rawTailwindCss = '.flex{display:flex}'
    const generateMock = vi.fn(async () => ({
      css: '.flex{display:flex}',
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      mainCssChunkMatcher: vi.fn(file => file === 'app.css'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.css': {
        ...createRollupAsset(`${userCss}\n/*! weapp-tailwindcss generator-placeholder */`),
        fileName: 'app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)
    expect((bundle['app.css'] as OutputAsset).source).toBe(`${userCss}\n.flex{display:flex}`)

    const outputOptions = getOutputOptionsHandler(postPlugin)
    const nextOptions = outputOptions?.call(postPlugin, { plugins: [] })
    const finalizer = nextOptions?.plugins?.find((plugin: Plugin) =>
      plugin.name === 'weapp-tailwindcss:adaptor:css-finalizer')
    expect(finalizer).toBeTruthy()

    const finalizerGenerateBundle = getGenerateBundleHandler(finalizer as Plugin)
    await finalizerGenerateBundle?.call(finalizer, {} as any, bundle)
    expect((bundle['app.css'] as OutputAsset).source).toBe(`${userCss}\n.flex{display:flex}`)
    expect(generateMock).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('replays v4 main css when watch rebuild only rewrites non-runtime js output', async () => {
    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.bg-_b_h112233_B{background-color:#112233}',
      rawCss: '.bg-\\[\\#112233\\]{background-color:#112233}',
      target: 'weapp',
      classSet: new Set(['bg-[#112233]']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      mainCssChunkMatcher: vi.fn(file => file === 'app.css'),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, 'export const cls = "bg-[#112233]"', '/project/src/pages/index.tsx')
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = (jsCode: string) => ({
      'app.js': {
        ...createRollupChunk(jsCode),
        fileName: 'app.js',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const firstBundle = createBundle('const cls = "bg-[#112233]"; const stamp = 1')
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle['app.css'] as OutputAsset).source).toBe('.bg-_b_h112233_B{background-color:#112233}')

    const secondBundle = createBundle('const cls = "bg-[#112233]"; const stamp = 2')
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    expect((secondBundle['app.css'] as OutputAsset).source).toBe('.bg-_b_h112233_B{background-color:#112233}')
    expect(generateMock).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('regenerates v4 main css when template candidates change but the css asset source is stable', async () => {
    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async ({ candidates }: { candidates: Set<string> }) => ({
      css: [...candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      rawCss: [...candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(candidates),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      mainCssChunkMatcher: vi.fn(file => file === 'app.css'),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = (wxml: string) => ({
      'pages/index/index.wxml': {
        ...createRollupAsset(wxml),
        fileName: 'pages/index/index.wxml',
      },
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    await transform?.call(sourcePlugin, '<view class="bg-[#112233]"></view>', '/project/src/pages/index/index.vue')
    const firstBundle = createBundle('<view class="bg-[#112233]"></view>')
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle['app.css'] as OutputAsset).source).toBe('.bg-[#112233]{}')

    await transform?.call(sourcePlugin, '<view class="bg-[#445566]"></view>', '/project/src/pages/index/index.vue')
    const secondBundle = createBundle('<view class="bg-[#445566]"></view>')
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    expect((secondBundle['app.css'] as OutputAsset).source).toBe('.bg-[#445566]{}')
    expect(generateMock).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('scans project source files for generator candidates without reading dist products or sourcemaps', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-source-scan-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    await mkdir(path.join(tempDir, 'pages/index'), { recursive: true })
    await mkdir(path.join(tempDir, 'dist/pages/index'), { recursive: true })
    await writeFile(path.join(tempDir, 'pages/index/index.ts'), 'export const cls = "bg-[#112233]"', 'utf8')
    await writeFile(path.join(tempDir, 'pages/index/index.wxml'), '<view class="text-[#223344]"></view>', 'utf8')
    await writeFile(path.join(tempDir, 'dist/pages/index/index.js'), 'const bundled = "bg-[#445566]"', 'utf8')
    await writeFile(
      path.join(tempDir, 'dist/pages/index/index.js.map'),
      JSON.stringify({
        version: 3,
        sources: ['../../pages/index/index.ts'],
        sourcesContent: ['export const cls = "bg-[#778899]"'],
        mappings: '',
      }),
      'utf8',
    )

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.ok{}',
      rawCss: '.ok{}',
      target: 'weapp',
      classSet: new Set<string>(),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const bundle = {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('bg-[#112233]')).toBe(true)
    expect(candidates.has('text-[#223344]')).toBe(true)
    expect(candidates.has('bg-[#445566]')).toBe(false)
    expect(candidates.has('bg-[#778899]')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('collects generator candidates from source css @apply without scanning css selectors', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-source-apply-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    await mkdir(tempDir, { recursive: true })
    await writeFile(
      path.join(tempDir, 'app.css'),
      [
        '@import "tailwindcss";',
        '@config "./tailwind.config.js";',
        '.tw-watch-style-fixture { @apply font-bold text-center min-w-0 bg-[#123456] px-[12px]; }',
      ].join('\n'),
      'utf8',
    )

    const runtimeSet = new Set<string>()
    const createGeneratorMock = vi.fn(() => ({
      generate: generateMock,
    }))
    const generateMock = vi.fn(async () => ({
      css: '.ok{}',
      rawCss: '.ok{}',
      target: 'weapp',
      classSet: new Set<string>(),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: createGeneratorMock,
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
        options: {
          projectRoot: tempDir,
          tailwindcss: {
            cwd: tempDir,
            v4: {
              cssEntries: [path.join(tempDir, 'app.css')],
            },
          },
        },
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const bundle = {
      'dist/app.css': {
        ...createRollupAsset([
          '/*! weapp-tailwindcss generator-placeholder */',
          '@config "./tailwind.config.js";',
          '.tw-watch-style-fixture { @apply font-bold text-center min-w-0 bg-[#123456] px-[12px]; }',
        ].join('\n')),
        fileName: 'dist/app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('font-bold')).toBe(true)
    expect(candidates.has('text-center')).toBe(true)
    expect(candidates.has('min-w-0')).toBe(true)
    expect(candidates.has('bg-[#123456]')).toBe(true)
    expect(candidates.has('px-[12px]')).toBe(true)
    expect(candidates.has('tw-watch-style-fixture')).toBe(false)
    expect(createGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      base: tempDir,
      css: expect.stringContaining('.tw-watch-style-fixture { @apply font-bold text-center min-w-0 bg-[#123456] px-[12px]; }'),
    }))
    expect(createGeneratorMock.mock.calls[0]?.[0]?.css).toContain('@config "./tailwind.config.js";')
    expect(createGeneratorMock.mock.calls[0]?.[0]?.css).not.toContain('generator-placeholder')
  }, TEST_TIMEOUT_MS)

  it('keeps v4 source candidates across build-watch rebuilds and syncs changed source files', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-source-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    await mkdir(path.join(tempDir, 'src/pages/index'), { recursive: true })
    await mkdir(path.join(tempDir, 'src/components'), { recursive: true })
    const sourceFile = path.join(tempDir, 'src/pages/index/index.tsx')
    const unrelatedFile = path.join(tempDir, 'src/components/card.tsx')
    await writeFile(sourceFile, 'export const cls = "bg-[#112233]"', 'utf8')
    await writeFile(unrelatedFile, 'export const cls = "text-[#111111]"', 'utf8')

    const runtimeSet = new Set<string>()
    const rawTailwindCss = [
      '.bg-\\[\\#112233\\]{background-color:#112233}',
      '.bg-\\[\\#445566\\]{background-color:#445566}',
      '.text-\\[\\#111111\\]{color:#111111}',
      '.text-\\[\\#999999\\]{color:#999999}',
    ].join('')
    const weappCss = [
      '.bg-_b_h112233_B{background-color:#112233}',
      '.bg-_b_h445566_B{background-color:#445566}',
      '.text-_b_h111111_B{color:#111111}',
      '.text-_b_h999999_B{color:#999999}',
    ].join('')
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: new Set(['bg-[#112233]', 'bg-[#445566]', 'text-[#111111]', 'text-[#999999]']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          css: '@import "tailwindcss";',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await transform?.call(sourcePlugin, await readFile(sourceFile, 'utf8'), sourceFile)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    await writeFile(unrelatedFile, 'export const cls = "text-[#999999]"', 'utf8')
    await writeFile(sourceFile, 'export const cls = "bg-[#445566]"', 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, sourceFile, { event: 'update' })
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const bundle = {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, bundle)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('bg-[#112233]')).toBe(false)
    expect(candidates.has('bg-[#445566]')).toBe(true)
    expect(candidates.has('text-[#111111]')).toBe(true)
    expect(candidates.has('text-[#999999]')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('keeps changed v4 source candidates when generator css narrows candidates by @source entries', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-source-watch-entry-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    await mkdir(path.join(tempDir, 'src/pages/index'), { recursive: true })
    const sourceFile = path.join(tempDir, 'src/pages/index/index.vue')
    const cssFile = path.join(tempDir, 'src/main.css')
    const cssSource = [
      '@import "tailwindcss" source(none);',
      '@source "../src/**/*.{vue,js,ts,jsx,tsx,html}";',
    ].join('\n')
    await writeFile(cssFile, cssSource, 'utf8')
    await writeFile(sourceFile, '<view class="bg-[#112233]"></view>', 'utf8')

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async ({ candidates }: { candidates: Set<string> }) => {
      const css = [...candidates].map(candidate => `.${candidate}{}`).join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set(candidates),
        dependencies: [],
        sources: [],
        root: null,
      }
    })

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4Source: vi.fn(async (options: any) => ({
          projectRoot: tempDir,
          base: options.base ?? tempDir,
          baseFallbacks: [],
          css: options.css ?? (options.cssEntries?.[0] === cssFile ? cssSource : ''),
          dependencies: options.cssEntries ?? [],
        })),
        resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          cssEntries: [cssFile],
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
        options: {
          projectRoot: tempDir,
          tailwindcss: {
            cwd: tempDir,
            v4: {
              cssEntries: [cssFile],
            },
          },
        },
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    await writeFile(sourceFile, '<view class="bg-[#445566] text-[23.000053px]"></view>', 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, sourceFile, { event: 'update' })
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const bundle = {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('bg-[#445566]')).toBe(true)
    expect(candidates.has('text-[23.000053px]')).toBe(true)
    expect(candidates.has('bg-[#112233]')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('honors Tailwind v3 content negation when scanning vite source candidates', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v3-not-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const pageFile = path.join(tempDir, 'src/pages/index.tsx')
    const ignoredFile = path.join(tempDir, 'src/apis/client.ts')
    const configFile = path.join(tempDir, 'tailwind.config.js')
    await mkdir(path.dirname(pageFile), { recursive: true })
    await mkdir(path.dirname(ignoredFile), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{ts,tsx}", "!./src/apis/**"] }', 'utf8')
    await writeFile(pageFile, 'export const cls = "bg-[#112233]"', 'utf8')
    await writeFile(ignoredFile, 'export const cls = "text-[77rpx]"', 'utf8')

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.bg-_b_h112233_B{background-color:#112233}',
      rawCss: '.bg-\\[\\#112233\\]{background-color:#112233}',
      target: 'weapp',
      classSet: new Set(['bg-[#112233]']),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
          validateCandidates: vi.fn(async (candidates: Set<string>) => candidates),
        })),
        resolveTailwindV3SourceFromPatcher: vi.fn(async () => ({
          version: 3,
          projectRoot: tempDir,
          cwd: tempDir,
          base: tempDir,
          css: '@tailwind utilities;',
          config: configFile,
          configObject: {
            content: ['./src/**/*.{ts,tsx}', '!./src/apis/**'],
          },
          dependencies: [configFile],
          packageName: 'tailwindcss',
          postcssPlugin: 'tailwindcss',
        })),
      }
    })

    setCurrentContext(createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 3,
        options: {
          projectRoot: tempDir,
          tailwindcss: {
            cwd: tempDir,
            config: configFile,
          },
        },
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, await readFile(ignoredFile, 'utf8'), ignoredFile)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('bg-[#112233]')).toBe(true)
    expect(candidates.has('text-[77rpx]')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('honors Tailwind v4 @source not when scanning vite source candidates', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v4-not-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const cssEntry = path.join(tempDir, 'src/app.css')
    const pageFile = path.join(tempDir, 'src/pages/index.tsx')
    const ignoredFile = path.join(tempDir, 'src/apis/client.ts')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await mkdir(path.dirname(pageFile), { recursive: true })
    await mkdir(path.dirname(ignoredFile), { recursive: true })
    await writeFile(cssEntry, [
      '@import "tailwindcss" source("../src");',
      '@source not "./apis/**";',
    ].join('\n'), 'utf8')
    await writeFile(pageFile, 'export const cls = "bg-[#112233]"', 'utf8')
    await writeFile(ignoredFile, 'export const cls = "text-[77rpx]"', 'utf8')

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.bg-_b_h112233_B{background-color:#112233}',
      rawCss: '.bg-\\[\\#112233\\]{background-color:#112233}',
      target: 'weapp',
      classSet: new Set(['bg-[#112233]']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          cssEntries: [cssEntry],
          packageName: 'tailwindcss4',
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: path.dirname(cssEntry),
          baseFallbacks: [],
          css: await readFile(cssEntry, 'utf8'),
          dependencies: [cssEntry],
        })),
      }
    })

    setCurrentContext(createContext({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, await readFile(ignoredFile, 'utf8'), ignoredFile)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('bg-[#112233]')).toBe(true)
    expect(candidates.has('text-[77rpx]')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('adds Tailwind v4 @source inline candidates to vite generator source candidates', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v4-inline-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const cssEntry = path.join(tempDir, 'src/app.css')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await writeFile(cssEntry, [
      '@import "tailwindcss" source(none);',
      '@source inline("underline w-{1..2}");',
      '@source not inline("w-2");',
    ].join('\n'), 'utf8')

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.ok{}',
      rawCss: '.ok{}',
      target: 'weapp',
      classSet: new Set(['underline', 'w-1']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          cssEntries: [cssEntry],
          packageName: 'tailwindcss4',
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: path.dirname(cssEntry),
          baseFallbacks: [],
          css: await readFile(cssEntry, 'utf8'),
          dependencies: [cssEntry],
        })),
      }
    })

    setCurrentContext(createContext({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('underline')).toBe(true)
    expect(candidates.has('w-1')).toBe(true)
    expect(candidates.has('w-2')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('does not scan the Vite root when Tailwind v4 css explicitly uses source(none)', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v4-source-none-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const cssEntry = path.join(tempDir, 'src/app.css')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await writeFile(cssEntry, '@import "tailwindcss" source(none);', 'utf8')

    const scannedRoots: string[] = []
    vi.doMock('@/bundlers/vite/source-candidates', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-candidates')>()
      const collector = actual.createSourceCandidateCollector()
      return {
        ...actual,
        createSourceCandidateCollector: vi.fn(() => ({
          ...collector,
          scanRoot: vi.fn(async (options) => {
            scannedRoots.push(options.root)
            await collector.scanRoot(options)
          }),
        })),
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          cssEntries: [cssEntry],
          packageName: 'tailwindcss4',
        })),
      }
    })

    setCurrentContext(createContext({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    expect(scannedRoots).toHaveLength(0)
  }, TEST_TIMEOUT_MS)

  it('rescans v4 source candidates in build-watch when @source inline changes', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v4-inline-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const cssEntry = path.join(tempDir, 'src/app.css')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await writeFile(cssEntry, [
      '@import "tailwindcss" source(none);',
      '@source inline("w-1");',
    ].join('\n'), 'utf8')

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.ok{}',
      rawCss: '.ok{}',
      target: 'weapp',
      classSet: new Set(['w-1', 'w-2']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          cssEntries: [cssEntry],
          packageName: 'tailwindcss4',
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: path.dirname(cssEntry),
          baseFallbacks: [],
          css: await readFile(cssEntry, 'utf8'),
          dependencies: [cssEntry],
        })),
      }
    })

    setCurrentContext(createContext({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    await writeFile(cssEntry, [
      '@import "tailwindcss" source(none);',
      '@source inline("w-2");',
    ].join('\n'), 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, cssEntry, { event: 'update' })
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('w-1')).toBe(false)
    expect(candidates.has('w-2')).toBe(true)
  }, TEST_TIMEOUT_MS)

  it('reuses v4 source candidate scan on unchanged build-watch css roots', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v4-watch-reuse-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const cssEntry = path.join(tempDir, 'src/app.css')
    const pageFile = path.join(tempDir, 'src/pages/index.tsx')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(cssEntry, [
      '@import "tailwindcss" source(none);',
      '@source "./pages/**/*.{ts,tsx}";',
    ].join('\n'), 'utf8')
    await writeFile(pageFile, 'export const cls = "w-1"', 'utf8')

    const scannedRoots: string[] = []
    const scannedEntries: Array<Array<{ base: string, negated: boolean, pattern: string }> | undefined> = []
    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.ok{}',
      rawCss: '.ok{}',
      target: 'weapp',
      classSet: new Set(['w-1', 'w-2']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/bundlers/vite/source-candidates', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-candidates')>()
      const collector = actual.createSourceCandidateCollector()
      return {
        ...actual,
        createSourceCandidateCollector: vi.fn(() => ({
          ...collector,
          scanRoot: vi.fn(async (options) => {
            scannedRoots.push(options.root)
            scannedEntries.push(options.entries)
            await collector.scanRoot(options)
          }),
        })),
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      const cssSource = [
        '@import "tailwindcss" source(none);',
        '@source "./pages/**/*.{ts,tsx}";',
      ].join('\n')
      const resolveSourceOptionsMock = vi.fn(() => ({
        projectRoot: tempDir,
        base: tempDir,
        baseFallbacks: [],
        cssSources: [{
          file: cssEntry,
          css: cssSource,
          base: path.dirname(cssEntry),
        }],
        packageName: 'tailwindcss4',
      }))
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceOptionsFromPatcher: resolveSourceOptionsMock,
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => {
          return {
            projectRoot: tempDir,
            base: tempDir,
            baseFallbacks: [],
            css: cssSource,
            dependencies: [cssEntry],
          }
        }),
      }
    })

    setCurrentContext(createContext({
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const createPlugins = () => WeappTailwindcss({
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
      },
    })
    const plugins = createPlugins()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)
    await getTransformHandler(rewritePlugin)?.call(rewritePlugin, await readFile(cssEntry, 'utf8'), cssEntry)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)
    expect(scannedRoots).toHaveLength(1)
    expect(scannedRoots[0]).toBe(tempDir)
    expect(scannedEntries[0]).toEqual([
      {
        base: path.join(path.dirname(cssEntry), 'pages'),
        negated: false,
        pattern: '**/*.{ts,tsx}',
      },
    ])

    const generatorModule = await import('@/generator')
    const resolveSourceOptionsCalls = vi.mocked(generatorModule.resolveTailwindV4SourceOptionsFromPatcher).mock.calls.length
    await getTransformHandler(sourcePlugin)?.call(sourcePlugin, await readFile(cssEntry, 'utf8'), cssEntry)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)
    expect(generatorModule.resolveTailwindV4SourceOptionsFromPatcher).toHaveBeenCalledTimes(resolveSourceOptionsCalls)
    expect(scannedRoots).toHaveLength(1)

    await writeFile(pageFile, 'export const cls = "w-2"', 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, pageFile, { event: 'update' })
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)
    expect(scannedRoots).toHaveLength(1)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('w-1')).toBe(false)
    expect(candidates.has('w-2')).toBe(true)

    const secondPlugins = createPlugins()
    const secondSourcePlugin = secondPlugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const secondPostPlugin = secondPlugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (secondPostPlugin.configResolved as any)?.call(secondPostPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)
    await (secondSourcePlugin.buildStart as any)?.call(secondSourcePlugin)
    expect(scannedRoots).toHaveLength(1)
  }, TEST_TIMEOUT_MS)

  it('lets Tailwind v4 @source not inline remove vite candidates discovered from files', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-vite-v4-inline-not-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    const cssEntry = path.join(tempDir, 'src/app.css')
    const pageFile = path.join(tempDir, 'src/pages/index.tsx')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(cssEntry, [
      '@import "tailwindcss" source("../src");',
      '@source not inline("underline");',
    ].join('\n'), 'utf8')
    await writeFile(pageFile, 'export const cls = "underline w-1"', 'utf8')

    const runtimeSet = new Set<string>()
    const generateMock = vi.fn(async () => ({
      css: '.ok{}',
      rawCss: '.ok{}',
      target: 'weapp',
      classSet: new Set(['w-1']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
          projectRoot: tempDir,
          base: tempDir,
          baseFallbacks: [],
          cssEntries: [cssEntry],
          packageName: 'tailwindcss4',
        })),
        resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
          projectRoot: tempDir,
          base: path.dirname(cssEntry),
          baseFallbacks: [],
          css: await readFile(cssEntry, 'utf8'),
          dependencies: [cssEntry],
        })),
      }
    })

    setCurrentContext(createContext({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
      tailwindcss: {
        version: 4,
        packageName: 'tailwindcss4',
        v4: {
          cssEntries: [cssEntry],
        },
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: tempDir,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    })

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('underline')).toBe(false)
    expect(candidates.has('w-1')).toBe(true)
  }, TEST_TIMEOUT_MS)
})
