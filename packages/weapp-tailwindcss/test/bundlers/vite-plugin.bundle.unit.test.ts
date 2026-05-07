import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { MappingChars2String } from '@weapp-core/escape'
import prettier from 'prettier'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStyleHandler } from '../../../postcss/src/handler'
import { createJsHandler } from '@/js'
import { replaceWxml } from '@/wxml'
import { createTemplateHandler } from '@/wxml/utils'
import {
  createContext,
  createRollupAsset,
  createRollupChunk,
  getCurrentContext,
  resetVitePluginTestContext,
  setCurrentContext,
} from './vite-plugin.testkit'

const TEST_TIMEOUT_MS = 30000
const SPLIT_WHITESPACE_RE = /\s+/
const createdDirs: string[] = []
async function formatCssSnapshot(css: string) {
  return prettier.format(css, { parser: 'css' })
}

async function loadUnifiedVitePlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.UnifiedViteWeappTailwindcssPlugin
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

function normalizeGeneratorOptions(options: any) {
  if (options === false) {
    return { mode: 'off', target: 'weapp' }
  }
  if (options === true || options == null) {
    return { mode: 'auto', target: 'weapp' }
  }
  return {
    mode: options.mode ?? 'auto',
    target: options.target ?? 'weapp',
    styleOptions: options.styleOptions,
  }
}

async function loadIssue814Fixture() {
  const fixtureRoot = path.resolve(
    __dirname,
    '../fixtures/issue-814/tw4/pages/index',
  )
  const [wxml, js] = await Promise.all([
    readFile(path.join(fixtureRoot, 'index.wxml'), 'utf8'),
    readFile(path.join(fixtureRoot, 'index.js'), 'utf8'),
  ])
  return {
    js,
    wxml,
  }
}

describe('bundlers/vite UnifiedViteWeappTailwindcssPlugin bundle', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doUnmock('node:fs/promises')
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

  it('generates bundle assets and leverages cache', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = createContext({
      generator: {
        mode: 'force',
        target: 'weapp',
      },
    })
    setCurrentContext(currentContext)
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeDefined()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(currentContext.onLoad).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.patch).toHaveBeenCalledTimes(1)

    const config = {
      plugins: [
        { name: '@tailwindcss/vite:scan' },
        { name: '@tailwindcss/vite:generate:build' },
        { name: 'other-vite-plugin' },
      ],
      css: {
        postcss: {
          plugins: [
            { postcssPlugin: '@tailwindcss/postcss' },
            { postcssPlugin: 'tailwindcss' },
            { postcssPlugin: 'postcss-html-transform' },
            { postcssPlugin: 'other' },
          ],
        },
      },
    } as unknown as ResolvedConfig

    const configResolved = postPlugin.configResolved as any
    await configResolved?.call(postPlugin, config)
    expect(config.plugins.map(plugin => plugin.name)).toEqual([
      'other-vite-plugin',
    ])
    const postcssPlugins = (config.css?.postcss as any)?.plugins
    expect(postcssPlugins?.[0]).toEqual({ postcssPlugin: 'mocked-html-transform' })
    expect(postcssPlugins).not.toContainEqual(expect.objectContaining({ postcssPlugin: '@tailwindcss/postcss' }))
    expect(postcssPlugins).not.toContainEqual(expect.objectContaining({ postcssPlugin: 'tailwindcss' }))

    const html = '<view class="foo">bar</view>'
    const js = 'const demo = "text-[#123456]"'
    const css = '.foo { color: red; }'

    const bundle = {
      'index.wxml': createRollupAsset(html),
      'index.js': createRollupChunk(js),
      'index.css': {
        ...createRollupAsset(css),
        fileName: 'index.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.onStart).toHaveBeenCalledTimes(1)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect((bundle['index.wxml'] as OutputAsset).source).toBe(`tpl:${html}`)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect((bundle['index.js'] as OutputChunk).code).toBe(`js:${js}`)

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect((bundle['index.css'] as OutputAsset).source).toBe(`css:${css}`)

    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)

    const bundleSecondRun = {
      'index.wxml': createRollupAsset(html),
      'index.js': createRollupChunk(js),
      'index.css': {
        ...createRollupAsset(css),
        fileName: 'index.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, bundleSecondRun)

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.onStart).toHaveBeenCalledTimes(2)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(2)
    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('inlines external postcss config without official Tailwind plugins in force generator mode', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-postcss-'))
    createdDirs.push(tempDir)
    await writeFile(
      path.join(tempDir, 'postcss.config.js'),
      [
        'export default {',
        '  plugins: [',
        '    { postcssPlugin: "@tailwindcss/postcss" },',
        '    { postcssPlugin: "autoprefixer" },',
        '  ],',
        '}',
        '',
      ].join('\n'),
      'utf8',
    )

    setCurrentContext(createContext({
      generator: {
        mode: 'force',
        target: 'weapp',
      },
    }))
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const configResult = await (postPlugin.config as any)?.call(postPlugin, {
      root: tempDir,
      plugins: [
        { name: '@tailwindcss/vite:scan' },
        { name: 'other-vite-plugin' },
      ],
    })

    expect(configResult?.resolve?.alias?.[0]?.replacement).toContain('generator-placeholder.css')
    expect(configResult?.css?.postcss?.plugins).toHaveLength(1)
    expect(configResult?.css?.postcss?.plugins[0]?.postcssPlugin).toBe('autoprefixer')
  }, TEST_TIMEOUT_MS)

  it('removes official Tailwind plugins in default generator mode', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = createContext({
      generator: {
        mode: 'auto',
        target: 'weapp',
      },
    })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 4

    const plugins = UnifiedViteWeappTailwindcssPlugin({
      generator: {
        mode: 'auto',
        target: 'weapp',
      },
    })
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const config = {
      plugins: [
        { name: '@tailwindcss/vite:scan' },
        { name: '@tailwindcss/vite:generate:build' },
      ],
      css: {
        postcss: {
          plugins: [
            { postcssPlugin: '@tailwindcss/postcss' },
            { postcssPlugin: 'tailwindcss' },
          ],
        },
      },
    } as unknown as ResolvedConfig

    await (postPlugin.configResolved as any)?.call(postPlugin, config)

    expect(config.plugins.map(plugin => plugin.name)).toEqual([])
    expect((config.css.postcss as any).plugins).toEqual([])
  }, TEST_TIMEOUT_MS)

  it('reuses snapshot hashes for unchanged js process cache checks', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const hashSpy = vi.spyOn(currentContext.cache, 'computeHash')
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = () => ({
      'index.js': createRollupChunk('const cls = "alpha"'),
    })

    await generateBundle?.call(postPlugin, {} as any, createBundle())
    await generateBundle?.call(postPlugin, {} as any, createBundle())

    expect(hashSpy).toHaveBeenCalledTimes(3)
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set on source changes so new arbitrary classes in :class strings are escaped', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const staticClass = 'rounded-[32rpx] border border-slate-100/70 bg-white/90 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]'
    const dynamicClass = 'rounded-[92rpx] border border-slate-100/70 bg-[#213435] p-9 shadow-[0_20px_45px_rgba(15,23,42,0.08)]'
    const runtimeSets = [
      new Set(staticClass.split(SPLIT_WHITESPACE_RE)),
      new Set(dynamicClass.split(SPLIT_WHITESPACE_RE)),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code),
      jsHandler: createJsHandler({
        staleClassNameFallback: false,
      }),
      staleClassNameFallback: false,
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
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'index.wxml': createRollupAsset(`<view class="${staticClass}" />`),
      'index.js': createRollupChunk(`const sss = '${staticClass}'`),
    })

    runtimeIndex = 1
    const secondBundle = {
      'index.wxml': createRollupAsset('<view :class="sss" />'),
      'index.js': createRollupChunk(`
const sss = '${dynamicClass}'
const trace = "at App.vue:4"
`),
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const transformedCode = (secondBundle['index.js'] as OutputChunk).code
    expect(transformedCode).toContain('at App.vue:4')
    expect(transformedCode).toContain(replaceWxml('rounded-[92rpx]'))
    expect(transformedCode).toContain(replaceWxml('bg-[#213435]'))
    expect(transformedCode).not.toContain('rounded-[92rpx]')
    expect(transformedCode).not.toContain('bg-[#213435]')
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('warns and falls back to full runtime set when bundle runtime set misses dynamic arbitrary candidates in wxml', async () => {
    const fallbackRuntimeSet = new Set([
      'bg-[#68c828]',
      'text-[100px]',
      'text-[#123456]',
      'w-[323px]',
      'h-[30px]',
      'h-[45px]',
    ])
    const incompleteRuntimeSet = new Set([
      'bg-[#68c828]',
      'text-[100px]',
      'text-[#123456]',
      'w-[323px]',
    ])
    const syncMock = vi.fn(async () => incompleteRuntimeSet)
    const resetMock = vi.fn(async () => undefined)
    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: syncMock,
        reset: resetMock,
      }),
    }))

    const jsHandler = createJsHandler({
      escapeMap: MappingChars2String,
      staleClassNameFallback: false,
      tailwindcssMajorVersion: 4,
    })
    const templateHandler = createTemplateHandler({
      escapeMap: MappingChars2String,
      jsHandler,
    })

    setCurrentContext(createContext({
      templateHandler,
      jsHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => fallbackRuntimeSet),
        getClassSetSync: vi.fn(() => fallbackRuntimeSet),
        extract: vi.fn(async () => ({ classSet: fallbackRuntimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const rawWxml = '<view class="bg-[#68c828] text-[100px] text-[#123456] w-[323px] {{true?\'h-[30px]\':\'h-[45px]\'}}">111</view>'
    const bundle = {
      'pages/index/index.wxml': {
        ...createRollupAsset(rawWxml),
        fileName: 'pages/index/index.wxml',
      } satisfies OutputAsset,
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(syncMock).toHaveBeenCalledTimes(1)
    const transformed = (bundle['pages/index/index.wxml'] as OutputAsset).source.toString()
    expect(transformed).toContain('h-_b30px_B')
    expect(transformed).toContain('h-_b45px_B')
    expect(transformed).not.toContain('h-[30px]')
    expect(transformed).not.toContain('h-[45px]')
  }, TEST_TIMEOUT_MS)

  it('warns again when full runtime fallback still leaves dynamic arbitrary candidates unresolved', async () => {
    const loggerModule = await import('@weapp-tailwindcss/logger')
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {})
    const runtimeSet = new Set(['h-[30px]', 'h-[45px]'])
    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => new Set<string>()),
        reset: vi.fn(async () => undefined),
      }),
    }))

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const rawWxml = '<view class="{{active?\'h-[30px]\':\'h-[45px]\'}}">111</view>'
    const bundle = {
      'pages/index/index.wxml': {
        ...createRollupAsset(rawWxml),
        fileName: 'pages/index/index.wxml',
      } satisfies OutputAsset,
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(warnSpy).toHaveBeenCalledTimes(2)
    expect(warnSpy.mock.calls[0]?.[0]).toContain('已回退到完整 runtimeSet 重试')
    expect(warnSpy.mock.calls[1]?.[0]).toContain('完整 runtimeSet 重试后仍未完成转译')
    expect((bundle['pages/index/index.wxml'] as OutputAsset).source.toString()).toBe(rawWxml)
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set when only comment-carried class candidates change', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const runtimeSets = [
      new Set(['text-[#123456]']),
      new Set(['text-[#654321]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code),
      jsHandler: createJsHandler({
        staleClassNameFallback: false,
        jsArbitraryValueFallback: false,
      }),
      staleClassNameFallback: false,
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
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, {
      'index.wxml': createRollupAsset('<view class="card"></view><!-- text-[#123456] -->'),
      'index.js': createRollupChunk('const cls = "card"\n/* text-[#123456] */'),
    })

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    currentContext.twPatcher.getClassSet.mockClear()
    runtimeIndex = 1

    await generateBundle?.call(postPlugin, {} as any, {
      'index.wxml': createRollupAsset('<view class="card"></view><!-- text-[#654321] -->'),
      'index.js': createRollupChunk('const cls = "card"\n/* text-[#654321] */'),
    })

    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSet).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('reuses css handler override objects for the same asset across incremental runs', async () => {
    setCurrentContext(createContext({
      generator: false,
    }))
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const firstBundle = {
      'pages/index/index.css': {
        ...createRollupAsset('.foo { color: red; }'),
        fileName: 'pages/index/index.css',
      },
    }

    const secondBundle = {
      'pages/index/index.css': {
        ...createRollupAsset('.foo { color: blue; }'),
        fileName: 'pages/index/index.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect(currentContext.styleHandler.mock.calls[0]?.[1]).toBe(currentContext.styleHandler.mock.calls[1]?.[1])
  }, TEST_TIMEOUT_MS)

  it('shares css transform results for identical assets with path-independent urls', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const css = '.hero { background-image: url("https://cdn.example.com/a.png"); }'
    const bundle = {
      'pages/a/index.css': {
        ...createRollupAsset(css),
        fileName: 'pages/a/index.css',
      },
      'pages/b/index.css': {
        ...createRollupAsset(css),
        fileName: 'pages/b/index.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect((bundle['pages/a/index.css'] as OutputAsset).source).toBe(`css:${css}`)
    expect((bundle['pages/b/index.css'] as OutputAsset).source).toBe(`css:${css}`)
  }, TEST_TIMEOUT_MS)

  it('uses tailwind v4 engine css for matching main css assets', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const syncMock = vi.fn(async () => runtimeSet)
    const resetMock = vi.fn(async () => undefined)
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))
    const createEngineMock = vi.fn(() => ({
      generate: generateMock,
    }))
    const resolveSourceMock = vi.fn(async () => ({
      projectRoot: process.cwd(),
      base: process.cwd(),
      baseFallbacks: [],
      css: '@import "tailwindcss";',
      dependencies: [],
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: syncMock,
        reset: resetMock,
      }),
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: createEngineMock,
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: resolveSourceMock,
    }))

    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.css': {
        ...createRollupAsset(rawTailwindCss),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(weappCss)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: runtimeSet,
    }))
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('uses force generator css for assets carrying the generator placeholder marker', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '.w-\\[100px\\]{width:100px}'
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `css:${code}` }))
    setCurrentContext(createContext({
      generator: {
        mode: 'force',
        target: 'weapp',
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

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, 'const cls = "w-[100px]"', '/project/src/pages/index.ts')

    const bundle = {
      'app.js': {
        code: 'const cls = "w-[100px]"',
        fileName: 'app.js',
        type: 'chunk',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */\n.card{color:red}'),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${weappCss}\ncss:.card{color:red}`)
    expect((bundle['app.css'] as OutputAsset).source.toString()).not.toContain('generator-placeholder')
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('w-[100px]')).toBe(true)
  }, TEST_TIMEOUT_MS)

  it('keeps appended user css when tailwind v4 engine css matches the generated prefix', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `user:${code}` }))
    setCurrentContext(createContext({
      styleHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
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

    const bundle = {
      'app.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${weappCss}\nuser:${userCss}`)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(styleHandler.mock.calls[0]?.[0]).toBe(userCss)
    expect(styleHandler.mock.calls[0]?.[1]).toMatchObject({
      isMainChunk: false,
      majorVersion: 4,
    })
  }, TEST_TIMEOUT_MS)

  it('uses source runtime candidates and filters unsupported Tailwind v4 mini-program variants in force generator mode', async () => {
    const runtimeSet = new Set([
      'w-[100px]',
      'in-[.group/name]:flex',
      'group-hover/item:visible',
    ])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const weappCss = '.w-_b100px_B{width:100px}.text-_b_h123456_B{color:#123456}'
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: new Set(['w-[100px]', 'text-[#123456]']),
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss4',
      })),
      resolveTailwindV4Source: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    setCurrentContext(createContext({
      generator: {
        mode: 'force',
        target: 'weapp',
      },
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
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
    await transform?.call(
      sourcePlugin,
      'const cls = "w-[100px] text-[#123456] in-[.group/name]:flex group-hover/item:visible"',
      '/project/src/pages/index.ts',
    )

    const bundle = {
      'app.js': {
        code: 'const cls = ""',
        fileName: 'app.js',
        type: 'chunk',
      } as OutputChunk,
      'app.css': {
        ...createRollupAsset(rawTailwindCss),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: expect.any(Set),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('text-[#123456]')).toBe(true)
    expect(candidates.has('w-[100px]')).toBe(true)
    expect(candidates.has('in-[.group/name]:flex')).toBe(false)
    expect(candidates.has('group-hover/item:visible')).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('finalizes css assets emitted after the main generateBundle pass through Rollup output plugins', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}\n@property --tw-leading{syntax:"*";inherits:false}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const writeFileMock = vi.fn(async () => {
      throw new Error('bundler css output must not call writeFile')
    })
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
    vi.doMock('node:fs/promises', async (importOriginal) => ({
      ...await importOriginal<typeof import('node:fs/promises')>(),
      writeFile: writeFileMock,
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    setCurrentContext(createContext({
      generator: {
        mode: 'force',
        target: 'weapp',
      },
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      styleHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const outputOptions = getOutputOptionsHandler(postPlugin)
    const nextOptions = outputOptions?.call(postPlugin, { plugins: [] })
    const finalizer = nextOptions?.plugins?.find((plugin: Plugin) =>
      plugin.name === 'weapp-tailwindcss:adaptor:css-finalizer')
    expect(finalizer).toBeTruthy()

    const bundle = {
      'pages-order/pages/home/home.wxss': {
        ...createRollupAsset(rawTailwindCss),
        fileName: 'pages-order/pages/home/home.wxss',
      },
      'pages-order/pages/home/plain.wxss': {
        ...createRollupAsset('.plain{color:red}'),
        fileName: 'pages-order/pages/home/plain.wxss',
      },
    }
    const generateBundle = getGenerateBundleHandler(finalizer)
    await generateBundle?.call(finalizer, {} as any, bundle)

    const css = (bundle['pages-order/pages/home/home.wxss'] as OutputAsset).source.toString()
    expect(css).toBe(weappCss)
    expect(css).not.toContain('@property')
    expect(css).not.toContain('tailwindcss v')
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(styleHandler).toHaveBeenCalledWith('.plain{color:red}', expect.objectContaining({
      postcssOptions: {
        options: {
          from: 'pages-order/pages/home/plain.wxss',
        },
      },
    }))
    expect(currentContext.onUpdate).toHaveBeenCalledWith(
      'pages-order/pages/home/home.wxss',
      rawTailwindCss,
      weappCss,
    )
    expect((bundle['pages-order/pages/home/plain.wxss'] as OutputAsset).source).toBe('legacy:.plain{color:red}')
    expect(writeFileMock).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps legacy css handling when tailwind v4 generator is disabled', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const generateMock = vi.fn(async () => ({
      css: '.w-_b100px_B{width:100px}',
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    setCurrentContext(createContext({
      generator: false,
      styleHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.css': {
        ...createRollupAsset(rawTailwindCss),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`legacy:${rawTailwindCss}`)
    expect(generateMock).not.toHaveBeenCalled()
    expect(styleHandler).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('throws instead of falling back when tailwind v4 generator is forced', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const generateMock = vi.fn(async () => {
      throw new Error('generator failed')
    })

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    setCurrentContext(createContext({
      generator: {
        mode: 'force',
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

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.css': {
        ...createRollupAsset(rawTailwindCss),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await expect(generateBundle?.call(postPlugin, {} as any, bundle)).rejects.toThrow('generator failed')
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('can keep web css from tailwind v4 generator without mini-program post processing', async () => {
    const runtimeSet = new Set(['hover:bg-blue-500'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.hover\\:bg-blue-500:hover{color:blue}'
    const userCss = '\n.card:hover{color:red}'
    const webCss = '.hover\\:bg-blue-500:hover{color:blue}'
    const generateMock = vi.fn(async () => ({
      css: webCss,
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `mini:${code}` }))
    setCurrentContext(createContext({
      generator: {
        target: 'web',
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

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${webCss}\n${userCss}`)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      target: 'web',
    }))
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('does not share css transform results for identical assets with relative urls', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const css = '.hero { background-image: url("./a.png"); }'
    const bundle = {
      'pages/a/index.css': {
        ...createRollupAsset(css),
        fileName: 'pages/a/index.css',
      },
      'pages/b/index.css': {
        ...createRollupAsset(css),
        fileName: 'pages/b/index.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect((bundle['pages/a/index.css'] as OutputAsset).source).toBe(`css:${css}`)
    expect((bundle['pages/b/index.css'] as OutputAsset).source).toBe(`css:${css}`)
  }, TEST_TIMEOUT_MS)

  it('shares css transform results for identical relative-url assets in the same output directory', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const css = '.hero { background-image: url("./a.png"); }'
    const bundle = {
      'pages/a/index.css': {
        ...createRollupAsset(css),
        fileName: 'pages/a/index.css',
      },
      'pages/a/detail.css': {
        ...createRollupAsset(css),
        fileName: 'pages/a/detail.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect((bundle['pages/a/index.css'] as OutputAsset).source).toBe(`css:${css}`)
    expect((bundle['pages/a/detail.css'] as OutputAsset).source).toBe(`css:${css}`)
  }, TEST_TIMEOUT_MS)

  it('reuses template handler options for multiple html assets in one bundle pass', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const bundle = {
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo"></view>'),
        fileName: 'pages/index/index.wxml',
      },
      'pages/home/index.wxml': {
        ...createRollupAsset('<view class="bar"></view>'),
        fileName: 'pages/home/index.wxml',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(2)
    expect(currentContext.templateHandler.mock.calls[0]?.[1]).toBe(currentContext.templateHandler.mock.calls[1]?.[1])
  }, TEST_TIMEOUT_MS)

  it('fixes issue #814 in tw4 fixture when cwd is app root (escaped runtime set entries should still hit)', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const runtimeSet = new Set(['flex', escapedGap])
    const appRoot = path.resolve(process.cwd(), 'apps/issue-814-tw4')
    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
        staleClassNameFallback: false,
      }),
      staleClassNameFallback: false,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: appRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const bundle = {
      'dist/pages/index/index.wxml': createRollupAsset(wxml),
      'dist/pages/index/index.js': createRollupChunk(js),
    }
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const transformedWxml = (bundle['dist/pages/index/index.wxml'] as OutputAsset).source.toString()
    const transformedJs = (bundle['dist/pages/index/index.js'] as OutputChunk).code

    expect(transformedWxml).toContain(escapedGap)
    expect(transformedJs).toContain(escapedGap)
    expect(transformedJs).not.toContain('gap-[20px]')
  }, TEST_TIMEOUT_MS)

  it('fixes issue #814 in tw4 fixture when cwd is workspace root and build root points to app root', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const workspaceRoot = path.resolve(process.cwd())
    const appRoot = path.resolve(workspaceRoot, 'apps/issue-814-tw4')
    const emptySet = new Set<string>()
    const issueSet = new Set(['flex', 'gap-[20px]'])

    const initialPatcher = {
      patch: vi.fn(async () => {}),
      getClassSet: vi.fn(async () => emptySet),
      getClassSetSync: vi.fn(() => emptySet),
      extract: vi.fn(async () => ({ classSet: emptySet })),
      majorVersion: 4,
    }
    const refreshedPatcher = {
      patch: vi.fn(async () => {}),
      getClassSet: vi.fn(async () => issueSet),
      getClassSetSync: vi.fn(() => issueSet),
      extract: vi.fn(async () => ({ classSet: issueSet })),
      majorVersion: 4,
    }
    const refreshTailwindcssPatcher = vi.fn(async () => refreshedPatcher)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssPatcher,
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
        jsArbitraryValueFallback: false,
        staleClassNameFallback: false,
      }),
      staleClassNameFallback: false,
      twPatcher: initialPatcher,
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: appRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const bundle = {
      'dist/pages/index/index.wxml': createRollupAsset(wxml),
      'dist/pages/index/index.js': createRollupChunk(js),
    }
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const transformedWxml = (bundle['dist/pages/index/index.wxml'] as OutputAsset).source.toString()
    const transformedJs = (bundle['dist/pages/index/index.js'] as OutputChunk).code

    expect(refreshTailwindcssPatcher).toHaveBeenCalled()
    expect(transformedWxml).toContain(escapedGap)
    expect(transformedJs).toContain(escapedGap)
    expect(transformedJs).not.toContain('gap-[20px]')
  }, TEST_TIMEOUT_MS)

  it('captures issue #814 fault mode when jsPreserveClass keeps gap candidate untouched', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const runtimeSet = new Set(['flex', 'gap-[20px]'])
    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
        jsPreserveClass: keyword => keyword === 'gap-[20px]',
        staleClassNameFallback: false,
      }),
      staleClassNameFallback: false,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: path.resolve(process.cwd(), 'apps/issue-814-tw4'),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const bundle = {
      'dist/pages/index/index.wxml': createRollupAsset(wxml),
      'dist/pages/index/index.js': createRollupChunk(js),
    }
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const transformedJs = (bundle['dist/pages/index/index.js'] as OutputChunk).code
    expect(transformedJs).toContain('gap-[20px]')
    expect(transformedJs).not.toContain(escapedGap)
  }, TEST_TIMEOUT_MS)

  it('aligns implicit tailwindcss basedir to vite root before bundle processing', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const workspaceRoot = path.resolve(process.cwd())
    const appRoot = path.resolve(workspaceRoot, 'apps/issue-814-tw4')
    const runtimeSet = new Set(['flex', 'gap-[20px]'])
    const refreshedPatcher = {
      patch: vi.fn(async () => {}),
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 4,
    }
    const refreshTailwindcssPatcher = vi.fn(async () => refreshedPatcher)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssPatcher,
      twPatcher: {
        patch: vi.fn(async () => {}),
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: appRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(getCurrentContext().tailwindcssBasedir).toBe(appRoot)
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('prefers the nearest tailwind config root when vite root points to a source subdirectory', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const workspaceRoot = path.resolve(__dirname, '../../..')
    const fixtureRoot = path.resolve(__dirname, '../fixtures/vite')
    const viteRoot = path.join(fixtureRoot, 'src')
    const refreshTailwindcssPatcher = vi.fn(async () => getCurrentContext().twPatcher)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssPatcher,
      twPatcher: {
        patch: vi.fn(async () => {}),
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 3,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: viteRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(getCurrentContext().tailwindcssBasedir).toBe(fixtureRoot)
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('keeps explicit tailwindcss basedir unchanged on configResolved', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const workspaceRoot = path.resolve(process.cwd())
    const appRoot = path.resolve(workspaceRoot, 'apps/issue-814-tw4')
    const refreshTailwindcssPatcher = vi.fn(async () => getCurrentContext().twPatcher)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssPatcher,
      twPatcher: {
        patch: vi.fn(async () => {}),
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin({
      tailwindcssBasedir: workspaceRoot,
    })
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: appRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(getCurrentContext().tailwindcssBasedir).toBe(workspaceRoot)
    expect(refreshTailwindcssPatcher).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps non-set business literals unchanged in serve mode while preserving classNameSet-only strategy', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const runtimeSet = new Set(['text-red-500'])
    setCurrentContext(createContext({
      jsPreserveClass: (keyword: string) => keyword.startsWith('biz-token'),
      jsHandler: createJsHandler({
        jsPreserveClass: (keyword: string) => keyword.startsWith('biz-token'),
      }),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const bundle = {
      'index.js': createRollupChunk(`
const safe = "biz-token-[alpha]"
const trace = "at App.vue:4"
const cls = "rounded-[92rpx]"
`),
    }
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const transformedCode = (bundle['index.js'] as OutputChunk).code
    expect(transformedCode).toContain('biz-token-[alpha]')
    expect(transformedCode).toContain('at App.vue:4')
    expect(transformedCode).toContain('rounded-[92rpx]')
    expect(transformedCode).not.toContain(replaceWxml('rounded-[92rpx]'))
  }, TEST_TIMEOUT_MS)

  it('keeps source-location tokens unchanged in build mode with classNameSet-only strategy', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const runtimeSet = new Set(['text-red-500'])
    setCurrentContext(createContext({
      jsHandler: createJsHandler({}),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const bundle = {
      'index.js': createRollupChunk(`
const trace = "at App.vue:4"
const cls = "w-[1.5px]"
`),
    }
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const transformedCode = (bundle['index.js'] as OutputChunk).code
    expect(transformedCode).toContain('at App.vue:4')
    expect(transformedCode).toContain('w-[1.5px]')
    expect(transformedCode).not.toContain(replaceWxml('w-[1.5px]'))
  }, TEST_TIMEOUT_MS)

  it('only transforms dirty js entry and affected linked entries on incremental runs', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const rootDir = process.cwd()
    const outDir = path.resolve(rootDir, 'dist')
    const linkedFile = path.resolve(outDir, 'chunk.js')

    setCurrentContext(createContext({
      jsHandler: vi.fn((code: string, _runtimeSet: Set<string>, options?: { filename?: string }) => {
        if (options?.filename?.endsWith('index.js')) {
          return {
            code: `js:${code}`,
            linked: {
              [linkedFile]: { code: 'linked:chunk' },
            },
          }
        }
        return { code: `js:${code}` }
      }),
    }))

    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const config = {
      root: rootDir,
      build: { outDir: 'dist' },
      css: { postcss: { plugins: [] } },
    } as unknown as ResolvedConfig
    await (postPlugin.configResolved as any)?.call(postPlugin, config)

    const generateBundle = getGenerateBundleHandler(postPlugin)

    const firstBundle = {
      'index.js': createRollupChunk('import "./chunk.js";\nconsole.log("text-[#111111]")'),
      'chunk.js': createRollupChunk('export const foo = "text-[#121212]";'),
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(2)

    const secondBundle = {
      'index.js': createRollupChunk('import "./chunk.js";\nconsole.log("text-[#222222]")'),
      'chunk.js': createRollupChunk('export const foo = "text-[#121212]";'),
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(3)

    const thirdBundle = {
      'index.js': createRollupChunk('import "./chunk.js";\nconsole.log("text-[#222222]")'),
      'chunk.js': createRollupChunk('export const foo = "text-[#232323]";'),
    }
    await generateBundle?.call(postPlugin, {} as any, thirdBundle)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(5)
  }, TEST_TIMEOUT_MS)

  it('falls back to transforming clean js chunks when replay cache is missing', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      jsHandler: vi.fn((code: string) => ({ code: `js:${code}` })),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = () => ({
      'index.js': createRollupChunk('console.log("text-[#111111]")'),
    })

    await generateBundle?.call(postPlugin, {} as any, createBundle())
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)

    currentContext.cache.instance.delete('index.js')
    currentContext.jsHandler.mockClear()
    const replayBundle = createBundle()
    await generateBundle?.call(postPlugin, {} as any, replayBundle)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect((replayBundle['index.js'] as OutputChunk).code).toBe('js:console.log("text-[#111111]")')
  }, TEST_TIMEOUT_MS)

  it('does not keep linked dirty bookkeeping across build mode runs', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const rootDir = process.cwd()
    const outDir = path.resolve(rootDir, 'dist')
    const linkedFile = path.resolve(outDir, 'chunk.js')

    setCurrentContext(createContext({
      jsHandler: vi.fn((code: string, _runtimeSet: Set<string>, options?: { filename?: string }) => {
        if (options?.filename?.endsWith('index.js')) {
          return {
            code: `js:${code}`,
            linked: {
              [linkedFile]: { code: 'linked:chunk' },
            },
          }
        }
        return { code: `js:${code}` }
      }),
    }))

    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const config = {
      command: 'build',
      root: rootDir,
      build: { outDir: 'dist' },
      css: { postcss: { plugins: [] } },
    } as unknown as ResolvedConfig
    await (postPlugin.configResolved as any)?.call(postPlugin, config)

    const generateBundle = getGenerateBundleHandler(postPlugin)

    const firstBundle = {
      'index.js': createRollupChunk('import "./chunk.js";\nconsole.log("text-[#111111]")'),
      'chunk.js': createRollupChunk('export const foo = "text-[#121212]";'),
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(2)

    const secondBundle = {
      'index.js': createRollupChunk('import "./chunk.js";\nconsole.log("text-[#111111]")'),
      'chunk.js': createRollupChunk('export const foo = "text-[#232323]";'),
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(3)
  }, TEST_TIMEOUT_MS)

  it('keeps dirty state stable when bundle temporarily omits js entries', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const generateBundle = getGenerateBundleHandler(postPlugin)

    const firstFullBundle = {
      'index.wxml': createRollupAsset('<view class="foo">a</view>'),
      'index.js': createRollupChunk('console.log("foo")'),
      'index.css': {
        ...createRollupAsset('.foo { color: red; }'),
        fileName: 'index.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, firstFullBundle)

    currentContext.templateHandler.mockClear()
    currentContext.jsHandler.mockClear()
    currentContext.styleHandler.mockClear()
    currentContext.onUpdate.mockClear()

    const secondCssOnlyBundle = {
      'index.css': {
        ...createRollupAsset('.foo { color: red; }'),
        fileName: 'index.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, secondCssOnlyBundle)

    expect(currentContext.templateHandler).not.toHaveBeenCalled()
    expect(currentContext.jsHandler).not.toHaveBeenCalled()
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
    expect(currentContext.onUpdate).not.toHaveBeenCalled()

    const thirdFullBundle = {
      'index.wxml': createRollupAsset('<view class="foo">a</view>'),
      'index.js': createRollupChunk('console.log("foo")'),
      'index.css': {
        ...createRollupAsset('.foo { color: red; }'),
        fileName: 'index.css',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, thirdFullBundle)

    expect(currentContext.templateHandler).not.toHaveBeenCalled()
    expect(currentContext.jsHandler).not.toHaveBeenCalled()
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
    expect(currentContext.onUpdate).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('reapplies cached css transform when js changes but css source stays the same', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: code
          .replace('*,::before,::after', 'view,text,::before,::after')
          .replaceAll('border-emerald-200\\/70', '_f70'),
      })),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const rawCss = [
      '*,::before,::after { --tw-content: ""; }',
      '.border-emerald-200\\/70 { border-color: rgb(167 243 208 / 0.7); }',
    ].join('\n')

    const firstBundle = {
      'index.js': createRollupChunk('const sss = "border-emerald-200/70"'),
      'index.css': {
        ...createRollupAsset(rawCss),
        fileName: 'index.css',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstCss = (firstBundle['index.css'] as OutputAsset).source.toString()
    expect(firstCss).toContain('view,text,::before,::after')
    expect(firstCss).toContain('._f70')
    expect(firstCss).not.toContain('*,::before,::after')
    expect(firstCss).not.toContain('border-emerald-200\\/70')

    const secondBundle = {
      'index.js': createRollupChunk('const sss = "border-emerald-300/70"'),
      'index.css': {
        ...createRollupAsset(rawCss),
        fileName: 'index.css',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const secondCss = (secondBundle['index.css'] as OutputAsset).source.toString()
    expect(secondCss).toContain('view,text,::before,::after')
    expect(secondCss).toContain('._f70')
    expect(secondCss).not.toContain('*,::before,::after')
    expect(secondCss).not.toContain('border-emerald-200\\/70')
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('reapplies cached css transform when css formatting changes only', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: code
          .replace('*,::before,::after', 'view,text,::before,::after')
          .replaceAll('border-emerald-200\\/70', '_f70'),
      })),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const firstCss = [
      '*,::before,::after { --tw-content: ""; }',
      '.border-emerald-200\\/70 { border-color: rgb(167 243 208 / 0.7); }',
    ].join('\n')
    const secondCss = [
      '*, ::before, ::after { --tw-content: ""; }',
      '/* note */',
      '.border-emerald-200\\/70 { border-color: rgb(167 243 208 / 0.7); }',
    ].join('\n')

    const firstBundle = {
      'index.js': createRollupChunk('const sss = "border-emerald-200/70"'),
      'index.css': {
        ...createRollupAsset(firstCss),
        fileName: 'index.css',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    const secondBundle = {
      'index.js': createRollupChunk('const sss = "border-emerald-200/70"'),
      'index.css': {
        ...createRollupAsset(secondCss),
        fileName: 'index.css',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const transformedCss = (secondBundle['index.css'] as OutputAsset).source.toString()
    expect(transformedCss).toContain('view,text,::before,::after')
    expect(transformedCss).toContain('._f70')
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('shares non-main css transform results for identical assets in the same bundle round', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: `shared:${code}`,
      })),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      cssMatcher: (file: string) => file.endsWith('.wxss'),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const duplicatedCss = '.card{color:red}'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset('.root{color:blue}'),
        fileName: 'app.wxss',
      },
      'pages/a.wxss': {
        ...createRollupAsset(duplicatedCss),
        fileName: 'pages/a.wxss',
      },
      'pages/b.wxss': {
        ...createRollupAsset(duplicatedCss),
        fileName: 'pages/b.wxss',
      },
    }

    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['pages/a.wxss'] as OutputAsset).source.toString()).toBe(`shared:${duplicatedCss}`)
    expect((bundle['pages/b.wxss'] as OutputAsset).source.toString()).toBe(`shared:${duplicatedCss}`)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('logs css diffs when vite css diff debugging is enabled', async () => {
    const previousDebugCssDiff = process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF
    process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF = '1'
    try {
      const debug = vi.fn()
      vi.doMock('@/debug', () => ({
        createDebug: () => debug,
      }))
      const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
      setCurrentContext(createContext({
        styleHandler: vi.fn(async () => ({
          css: '.card{color:blue}',
        })),
      }))
      const plugins = UnifiedViteWeappTailwindcssPlugin({ debug })
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      expect(postPlugin).toBeTruthy()

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'serve',
        root: process.cwd(),
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as ResolvedConfig)

      const bundle = {
        'index.css': {
          ...createRollupAsset('.card{color:red}'),
          fileName: 'index.css',
        },
      }
      const generateBundle = getGenerateBundleHandler(postPlugin)
      await generateBundle?.call(postPlugin, {} as any, bundle)

      expect(debug).toHaveBeenCalledWith(
        'css diff %s: %s',
        'index.css',
        expect.stringContaining('changed@'),
      )
    }
    finally {
      if (previousDebugCssDiff === undefined) {
        delete process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF
      }
      else {
        process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF = previousDebugCssDiff
      }
    }
  }, TEST_TIMEOUT_MS)

  it('infers appType from vite root before generateBundle runs', async () => {
    const loggerModule = await import('@weapp-tailwindcss/logger')
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-root-'))
    createdDirs.push(projectRoot)
    await writeFile(path.join(projectRoot, 'package.json'), JSON.stringify({
      dependencies: {
        '@tarojs/runtime': '^4.0.0',
      },
    }, null, 2))

    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      appType: undefined,
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      mainCssChunkMatcher: vi.fn(() => true),
      cssMatcher: (file: string) => file.endsWith('.wxss'),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()
    const loggerInfoSpy = vi.spyOn(loggerModule.logger, 'info').mockImplementation(() => {})

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: projectRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(currentContext.appType).toBe('taro')
    expect(loggerInfoSpy).toHaveBeenCalledWith('根据 Vite 项目根目录自动推断 appType -> %s', 'taro')

    const bundle = {
      'app.wxss': {
        ...createRollupAsset('.root{color:red}'),
        fileName: 'app.wxss',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.mainCssChunkMatcher).toHaveBeenCalledWith('app.wxss', 'taro')
  })

  it('fixes issue #834 by emitting taro app-origin wxss without layer or specificity placeholders', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const rawCss = await readFile(
      path.resolve(__dirname, '../fixtures/css/taro-vite-tailwindcss-v4-app-origin.raw.css'),
      'utf8',
    )
    const realStyleHandler = createStyleHandler({ isMainChunk: true })
    const styleHandler = vi.fn((code: string, options?: Record<string, unknown>) => {
      return realStyleHandler(code, options as any)
    })

    setCurrentContext(createContext({
      appType: 'taro',
      cssMatcher: (file: string) => file.endsWith('.wxss') || file.endsWith('.css'),
      mainCssChunkMatcher: vi.fn((file: string) => file.startsWith('app')),
      styleHandler,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.wxss': {
        ...createRollupAsset('@import "app-origin.wxss";'),
        fileName: 'app.wxss',
      },
      'app-origin.wxss': {
        ...createRollupAsset(rawCss),
        fileName: 'app-origin.wxss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const appOriginCall = styleHandler.mock.calls.find(([, options]) =>
      (options as any)?.postcssOptions?.options?.from === 'app-origin.wxss')
    expect(appOriginCall).toBeTruthy()

    const rawInput = await formatCssSnapshot(appOriginCall?.[0] as string)
    const processedOutput = await formatCssSnapshot((bundle['app-origin.wxss'] as OutputAsset).source.toString())

    expect(rawInput).toMatchSnapshot('taro-app-origin-raw-input')
    expect(processedOutput).toMatchSnapshot('taro-app-origin-processed-output')
    expect(rawInput).toContain(':not(#\\#)')
    expect(processedOutput).not.toContain('@layer')
    expect(processedOutput).not.toContain(':not(#n)')
    expect(processedOutput).not.toContain(':not(#\\#)')
  }, 8000)

  it('keeps template transform stable on script-only incremental updates', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'dist/pages/index/index.wxml'
    const jsFile = 'dist/pages/index/index.js'
    const cssFile = 'app.wxss'
    const escapedAfterContent = replaceWxml('after:content-[\'A\']')
    const escapedHeight = replaceWxml('h-[20px]')
    const escapedColorA = replaceWxml('bg-[#fafa00]')
    const escapedColorB = replaceWxml('bg-[#0000]')
    const replaceKnownClasses = (code: string) =>
      code
        .replaceAll('after:content-[\'A\']', escapedAfterContent)
        .replaceAll('h-[20px]', escapedHeight)
        .replaceAll('bg-[#fafa00]', escapedColorA)
        .replaceAll('bg-[#0000]', escapedColorB)

    setCurrentContext(createContext({
      generator: false,
      cssMatcher: (file: string) => file.endsWith('.css') || file.endsWith('.wxss'),
      templateHandler: vi.fn(async (code: string) => replaceKnownClasses(code)),
      jsHandler: vi.fn((code: string) => ({ code: replaceKnownClasses(code) })),
      styleHandler: vi.fn(async (code: string) => ({ css: replaceKnownClasses(code) })),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const wxmlSource = `<view class="after:content-['A'] h-[20px]">{{ cardsColor }}</view>`
    const wxssSource = [
      '.a { @apply after:content-[\'A\'] h-[20px]; }',
      '.b { @apply bg-[#fafa00] bg-[#0000]; }',
    ].join('\n')
    const assertStableOutputs = (
      bundle: Record<string, OutputAsset | OutputChunk>,
      expectedEscapedColor: string,
      unexpectedRawColor: string,
    ) => {
      const wxml = (bundle[htmlFile] as OutputAsset).source.toString()
      expect(wxml).toContain(escapedAfterContent)
      expect(wxml).toContain(escapedHeight)
      expect(wxml).not.toContain('after:content-[\'A\']')
      expect(wxml).not.toContain('h-[20px]')

      const js = (bundle[jsFile] as OutputChunk).code
      expect(js).toContain(expectedEscapedColor)
      expect(js).not.toContain(unexpectedRawColor)

      const wxss = (bundle[cssFile] as OutputAsset).source.toString()
      expect(wxss).toContain(escapedAfterContent)
      expect(wxss).toContain(escapedHeight)
      expect(wxss).toContain(escapedColorA)
      expect(wxss).toContain(escapedColorB)
      expect(wxss).not.toContain('after:content-[\'A\']')
      expect(wxss).not.toContain('h-[20px]')
      expect(wxss).not.toContain('bg-[#fafa00]')
      expect(wxss).not.toContain('bg-[#0000]')
    }

    const firstBundle = {
      [htmlFile]: {
        ...createRollupAsset(wxmlSource),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const cardsColor = "bg-[#fafa00]"'),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset(wxssSource),
        fileName: cssFile,
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    assertStableOutputs(firstBundle, escapedColorA, 'bg-[#fafa00]')

    const secondBundle = {
      [htmlFile]: {
        ...createRollupAsset(wxmlSource),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const cardsColor = "bg-[#0000]"'),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset(wxssSource),
        fileName: cssFile,
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    assertStableOutputs(secondBundle, escapedColorB, 'bg-[#0000]')

    const thirdBundle = {
      [htmlFile]: {
        ...createRollupAsset(wxmlSource),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const cardsColor = "bg-[#fafa00]"'),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset(wxssSource),
        fileName: cssFile,
      },
    }
    await generateBundle?.call(postPlugin, {} as any, thirdBundle)
    assertStableOutputs(thirdBundle, escapedColorA, 'bg-[#fafa00]')

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(3)
  }, TEST_TIMEOUT_MS)

  it('transforms inlined tailwind-merge output within bundle stage', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const runtimeSet = new Set(['bg-[#434332]', 'bg-[#123324]', 'px-[32px]', 'px-[35px]'])
    const realJsHandler = createJsHandler({
      ignoreCallExpressionIdentifiers: [],
    })
    const jsHandlerMock = vi.fn((code: string, classNameSet?: Set<string>, options?: CreateJsHandlerOptions) =>
      realJsHandler(code, classNameSet, options),
    )
    const patchMock = vi.fn(async () => {})
    const getClassSetMock = vi.fn(async () => runtimeSet)
    const getClassSetSyncMock = vi.fn(() => runtimeSet)
    const extractMock = vi.fn(async () => ({ classSet: runtimeSet }))

    const currentContext = getCurrentContext()
    currentContext.jsHandler = jsHandlerMock as any
    currentContext.twPatcher = {
      patch: patchMock,
      getClassSet: getClassSetMock,
      getClassSetSync: getClassSetSyncMock,
      extract: extractMock,
      majorVersion: 4,
    }

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const bundle = {
      'index.js': createRollupChunk(`
const merged = "bg-[#123324] px-[35px]"
const fallback = "bg-[#434332] px-[32px]"
`),
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(patchMock).toHaveBeenCalledTimes(1)
    expect(extractMock).toHaveBeenCalledTimes(1)
    expect(getClassSetSyncMock).toHaveBeenCalledTimes(1)
    expect(getClassSetMock).not.toHaveBeenCalled()
    expect(jsHandlerMock).toHaveBeenCalledTimes(1)

    const code = (bundle['index.js'] as OutputChunk).code
    expect(code).toContain('bg-_b_h123324_B px-_b35px_B')
    expect(code).toContain('bg-_b_h434332_B px-_b32px_B')
    expect(code).not.toContain('bg-[#123324]')
    expect(code).not.toContain('bg-[#434332]')
  }, TEST_TIMEOUT_MS)

  it('propagates linked js module updates', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const rootDir = process.cwd()
    const outDir = path.resolve(rootDir, 'dist')
    const linkedFile = path.resolve(outDir, 'chunk.js')
    setCurrentContext(createContext({
      jsHandler: vi.fn(async (code: string, _runtimeSet: Set<string>, options?: { filename?: string }) => {
        if (options?.filename?.endsWith('index.js')) {
          return {
            code: `js:${code}`,
            linked: {
              [linkedFile]: { code: 'linked:chunk' },
            },
          }
        }
        return { code }
      }),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const config = {
      root: rootDir,
      build: { outDir: 'dist' },
      css: { postcss: { plugins: [] } },
    } as unknown as ResolvedConfig
    await (postPlugin.configResolved as any)?.call(postPlugin, config)

    const bundle = {
      'index.js': createRollupChunk('import "./chunk.js";'),
      'chunk.js': createRollupChunk('export const foo = 1;'),
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['chunk.js'] as OutputChunk).code).toBe('linked:chunk')
    const chunkUpdates = currentContext.onUpdate.mock.calls.filter(([file]) => file === 'chunk.js')
    expect(chunkUpdates.length).toBeGreaterThan(0)
    expect(chunkUpdates.some(([, , updated]) => updated === 'linked:chunk')).toBe(true)

    const firstCall = currentContext.jsHandler.mock.calls[0] as unknown as [string, Set<string>, CreateJsHandlerOptions] | undefined
    const linkedOptions = firstCall?.[2]
    expect(linkedOptions?.moduleGraph?.resolve?.('./chunk.js', linkedOptions.filename ?? '')).toBe(linkedFile)
  }, TEST_TIMEOUT_MS)

  it('propagates linked js updates to asset entries', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const rootDir = process.cwd()
    const outDir = path.resolve(rootDir, 'dist')
    const linkedFile = path.resolve(outDir, 'asset.js')
    setCurrentContext(createContext({
      jsHandler: vi.fn(async (code: string, _runtimeSet: Set<string>, options?: { filename?: string }) => {
        if (options?.filename?.endsWith('index.js')) {
          return {
            code: `js:${code}`,
            linked: {
              [linkedFile]: { code: 'linked:asset' },
            },
          }
        }
        return { code }
      }),
    }))
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      root: rootDir,
      build: { outDir: 'dist' },
      css: { postcss: { plugins: [] } },
    } as unknown as ResolvedConfig)

    const bundle = {
      'index.js': createRollupChunk('import "./asset.js";'),
      'asset.js': {
        ...createRollupAsset('export const foo = 1;'),
        fileName: 'asset.js',
      } satisfies OutputAsset,
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['asset.js'] as OutputAsset).source).toBe('linked:asset')
    const assetUpdates = currentContext.onUpdate.mock.calls.filter(([file]) => file === 'asset.js')
    expect(assetUpdates.some(([, , updated]) => updated === 'linked:asset')).toBe(true)
  }, TEST_TIMEOUT_MS)
})
