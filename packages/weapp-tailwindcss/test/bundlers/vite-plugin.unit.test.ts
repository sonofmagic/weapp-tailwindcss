import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig, TransformResult } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UnifiedViteWeappTailwindcssPlugin } from '@/bundlers/vite'
import { createCache } from '@/cache'

function createContext(overrides: Record<string, unknown> = {}) {
  const cache = createCache()
  const runtimeSet = new Set(['alpha'])

  return {
    disabled: false,
    onLoad: vi.fn(),
    onStart: vi.fn(),
    onEnd: vi.fn(),
    onUpdate: vi.fn(),
    templateHandler: vi.fn(async (code: string) => `tpl:${code}`),
    styleHandler: vi.fn(async (code: string) => ({
      css: `css:${code}`,
      map: {
        toJSON: () => ({
          version: 3,
          file: 'style.css',
          sources: ['style.css'],
          names: [],
          mappings: 'AAAA',
          sourcesContent: [code],
        }),
      },
    })),
    jsHandler: vi.fn(async (code: string) => ({ code: `js:${code}` })),
    mainCssChunkMatcher: vi.fn(() => true),
    appType: 'uni-app',
    cache,
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
    twPatcher: {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => runtimeSet),
      majorVersion: 3,
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
    },
    uniAppX: undefined as any,
    runtimeLoaderPath: undefined,
    mainChunkRegex: undefined,
    cssEntries: undefined,
    customReplaceDictionary: undefined,
    ...overrides,
  }
}

type InternalContext = ReturnType<typeof createContext>

let currentContext: InternalContext

const postcssHtmlTransformMock = vi.hoisted(() => vi.fn(() => ({ postcssPlugin: 'mocked-html-transform' })))
vi.mock('@weapp-tailwindcss/postcss/html-transform', () => ({
  default: postcssHtmlTransformMock,
}))

const transformUVueMock = vi.hoisted(() => vi.fn((code: string, id: string) => ({ code: `uvue:${id}:${code}` })))
vi.mock('@/uni-app-x', () => ({
  transformUVue: transformUVueMock,
}))

const getCompilerContextMock = vi.fn<(options?: unknown) => InternalContext>(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

function createRollupAsset(source: string): OutputAsset {
  return {
    type: 'asset',
    fileName: 'index.wxml',
    name: undefined,
    source,
    needsCodeReference: false,
    names: [] as string[],
    originalFileName: null,
    originalFileNames: [] as string[],
  } as OutputAsset
}

function createRollupChunk(code: string): OutputChunk {
  return {
    type: 'chunk',
    fileName: 'index.js',
    name: 'index',
    code,
    map: null,
    facadeModuleId: null,
    moduleIds: [],
    modules: {},
    imports: [],
    exports: [],
    dynamicImports: [],
    implicitlyLoadedBefore: [],
    importedBindings: {},
    isEntry: true,
    isDynamicEntry: false,
    referencedFiles: [],
    isImplicitEntry: false,
    sourcemapFileName: null,
    preliminaryFileName: null,
  } as unknown as OutputChunk
}

describe('bundlers/vite UnifiedViteWeappTailwindcssPlugin', () => {
  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockClear()
    postcssHtmlTransformMock.mockClear()
    transformUVueMock.mockClear()
  })

  it('generates bundle assets and leverages cache', async () => {
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeDefined()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(currentContext.onLoad).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.patch).toHaveBeenCalledTimes(1)

    const config = {
      css: {
        postcss: {
          plugins: [
            { postcssPlugin: 'postcss-html-transform' },
            { postcssPlugin: 'other' },
          ],
        },
      },
    } as unknown as ResolvedConfig

    const configResolved = postPlugin.configResolved as any
    await configResolved?.call(postPlugin, config)
    expect(postcssHtmlTransformMock).toHaveBeenCalledTimes(1)
    const postcssPlugins = (config.css?.postcss as any)?.plugins
    expect(postcssPlugins?.[0]).toEqual({ postcssPlugin: 'mocked-html-transform' })

    const html = '<view class="foo">bar</view>'
    const js = 'const demo = 1'
    const css = '.foo { color: red; }'

    const bundle = {
      'index.wxml': createRollupAsset(html),
      'index.js': createRollupChunk(js),
      'index.css': {
        ...createRollupAsset(css),
        fileName: 'index.css',
      },
    }

    const generateBundle = postPlugin.generateBundle as any
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.onStart).toHaveBeenCalledTimes(1)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()

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
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
  })

  it('returns undefined when disabled', () => {
    currentContext = createContext({ disabled: true })
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeUndefined()
    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()
  })

  it('provides uni-app-x specific transforms', async () => {
    const runtimeSet = new Set(['uvue'])
    currentContext = createContext()
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
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
    const nvueTransform = nvuePlugin.transform as any
    const nvueResult = await nvueTransform?.call(nvuePlugin, 'console.log("x")', 'App.nvue')
    expect(transformUVueMock).toHaveBeenCalledWith('console.log("x")', 'App.nvue', currentContext.jsHandler, runtimeSet)
    expect(nvueResult).toEqual({ code: 'uvue:App.nvue:console.log("x")' })

    const bundle = {
      'index.js': createRollupChunk('const answer = 42'),
      'index.asset.js': {
        type: 'asset',
        fileName: 'index.js',
        source: 'console.log("asset")',
        name: undefined,
        needsCodeReference: false,
        names: [] as string[],
        originalFileName: null,
        originalFileNames: [] as string[],
      } satisfies OutputAsset,
    }

    const generateBundle = postPlugin.generateBundle as any
    await generateBundle?.call(postPlugin, {} as any, bundle)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)

    expect(currentContext.jsHandler).toHaveBeenCalledWith(
      'const answer = 42',
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
    expect((bundle['index.js'] as OutputChunk).code).toBe('js:const answer = 42')
    expect(currentContext.jsHandler).toHaveBeenCalledWith(
      'console.log("asset")',
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
    expect((bundle['index.asset.js'] as OutputAsset).source).toBe('js:console.log("asset")')
  })

  it('propagates linked js module updates', async () => {
    const rootDir = process.cwd()
    const outDir = path.resolve(rootDir, 'dist')
    const linkedFile = path.resolve(outDir, 'chunk.js')
    currentContext = createContext({
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
    })
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

    const generateBundle = postPlugin.generateBundle as any
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['chunk.js'] as OutputChunk).code).toBe('linked:chunk')
    const chunkUpdates = currentContext.onUpdate.mock.calls.filter(([file]) => file === 'chunk.js')
    expect(chunkUpdates.length).toBeGreaterThan(0)
    expect(chunkUpdates.some(([, , updated]) => updated === 'linked:chunk')).toBe(true)

    const firstCall = currentContext.jsHandler.mock.calls[0] as unknown as [string, Set<string>, CreateJsHandlerOptions] | undefined
    const linkedOptions = firstCall?.[2]
    expect(linkedOptions?.moduleGraph?.resolve?.('./chunk.js', linkedOptions.filename ?? '')).toBe(linkedFile)
  })
})
