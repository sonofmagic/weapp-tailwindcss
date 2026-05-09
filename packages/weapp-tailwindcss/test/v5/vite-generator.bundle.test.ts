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

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${rawTailwindCss}\n${userCss}`)
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
    expect(generateMock.mock.calls[0]?.[0]?.candidates.size).toBe(0)
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
        '.tw-watch-style-fixture { @apply font-bold text-center bg-[#123456] px-[12px]; }',
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
          '.tw-watch-style-fixture { @apply font-bold text-center bg-[#123456] px-[12px]; }',
        ].join('\n')),
        fileName: 'dist/app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('font-bold')).toBe(true)
    expect(candidates.has('text-center')).toBe(true)
    expect(candidates.has('bg-[#123456]')).toBe(true)
    expect(candidates.has('px-[12px]')).toBe(true)
    expect(candidates.has('tw-watch-style-fixture')).toBe(false)
    expect(createGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      base: tempDir,
      css: expect.stringContaining('.tw-watch-style-fixture { @apply font-bold text-center bg-[#123456] px-[12px]; }'),
    }))
    expect(createGeneratorMock.mock.calls[0]?.[0]?.css).toContain('@config "./tailwind.config.js";')
    expect(createGeneratorMock.mock.calls[0]?.[0]?.css).not.toContain('generator-placeholder')
  }, TEST_TIMEOUT_MS)

  it('keeps v4 source candidates across build-watch rebuilds and syncs changed source files', async () => {
    const tempDir = await path.join(os.tmpdir(), `weapp-tw-source-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    createdDirs.push(tempDir)
    await mkdir(path.join(tempDir, 'src/pages/index'), { recursive: true })
    const sourceFile = path.join(tempDir, 'src/pages/index/index.tsx')
    await writeFile(sourceFile, 'export const cls = "bg-[#112233]"', 'utf8')

    const runtimeSet = new Set<string>()
    const rawTailwindCss = '.bg-\\[\\#112233\\]{background-color:#112233}.bg-\\[\\#445566\\]{background-color:#445566}'
    const weappCss = '.bg-_b_h112233_B{background-color:#112233}.bg-_b_h445566_B{background-color:#445566}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: new Set(['bg-[#112233]', 'bg-[#445566]']),
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

    await writeFile(sourceFile, 'export const cls = "bg-[#445566]"', 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, sourceFile, { event: 'update' })

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
  }, TEST_TIMEOUT_MS)
})
