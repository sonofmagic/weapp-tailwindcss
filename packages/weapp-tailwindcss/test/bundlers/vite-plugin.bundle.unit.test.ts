import type { OutputAsset, OutputChunk } from 'rollup'
import type { HmrContext, ModuleNode, Plugin, ResolvedConfig } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { MappingChars2String } from '@weapp-core/escape'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createJsHandler } from '@/js'
import { replaceWxml } from '@/wxml'
import { createTemplateHandler } from '@/wxml/utils'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
import { clearTailwindV4IncrementalGenerateCacheForTest } from '@/tailwindcss/v4-engine'
import {
  createContext,
  createRollupAsset,
  createRollupChunk,
  getCurrentContext,
  resetVitePluginTestContext,
  setCurrentContext,
} from './vite-plugin.testkit'
import { classifyBundleEntry } from '@/bundlers/vite/bundle-state'
import { createGenerateBundleHook, normalizeBundleFileNameKeysForTest, resolveMiniProgramStyleOutputExtension, resolveRememberedCssSourceForTest, resolveReplayCssOutputFile, resolveReplayCssOutputFileFromSourceRoot, resolveViteCssPipelineOutputFile, resolveViteCssPipelineOutputFileFromSourceFile } from '@/bundlers/vite/generate-bundle'
import { collectRememberedCssReplayGroups } from '@/bundlers/vite/generate-bundle/remembered-css'
import { createSubpackageSourceCandidateScope } from '@/bundlers/vite/generate-bundle/source-candidate-scope'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets } from '@/bundlers/vite/processed-css-assets'
import { collectConfiguredTailwindV4CssSourceEntries } from '@/bundlers/vite/generate-bundle/configured-css-sources'
import { resolveSfcStyleSourceFromOutputFile, resolveSourceStyleSourceFromOutputFile } from '@/bundlers/vite/generate-bundle/sfc-style-source'
import { isFileMatchedByTailwindSourceEntries } from '@/tailwindcss/source-scan'
import { createViteCssMemory } from '@/bundlers/vite/css-memory'

const TEST_TIMEOUT_MS = 30000
const SPLIT_WHITESPACE_RE = /\s+/
const VITE_UNIT_CASES = [
  { major: 4, specifier: 'vite4' },
  { major: 5, specifier: 'vite5' },
  { major: 7, specifier: 'vite7' },
  { major: 8, specifier: 'vite8' },
] as const
const MINIMAL_TAILWIND_V4_CSS = `
@theme default {
  --spacing: 0.25rem;
}
@tailwind utilities;
`
const createdDirs: string[] = []

async function loadWeappTailwindcssPlugin() {
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

function normalizeGeneratorOptions(options: any) {
  if (options == null) {
    return { importFallback: false, target: 'weapp' }
  }
  return {
    importFallback: options.importFallback ?? false,
    target: options.target ?? 'weapp',
    styleOptions: options.styleOptions,
  }
}

function mockTailwindV4GeneratorCss(css = '/* generated */') {
  vi.doMock('@/generator', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/generator')>()
    const resolveMockTailwindV4Source = vi.fn(async () => ({
      version: 4,
      projectRoot: process.cwd(),
      base: process.cwd(),
      baseFallbacks: [],
      css: '@import "tailwindcss" source(none);',
      dependencies: [],
    }))
    return {
      ...actual,
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: vi.fn(async (options: { candidates: Set<string> }) => ({
          css,
          rawCss: css,
          target: 'weapp',
          classSet: new Set(options.candidates),
          dependencies: [],
          sources: [],
          root: null,
          version: 4,
        })),
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4Source: resolveMockTailwindV4Source,
      resolveTailwindV4SourceFromRuntime: resolveMockTailwindV4Source,
    }
  })
}

function createMockGeneratorCssResult(css: string, version = 3) {
  return {
    css,
    rawCss: css,
    target: 'weapp',
    classSet: new Set<string>(),
    rawCandidates: new Set<string>(),
    dependencies: [],
    sources: [],
    root: null,
    version,
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

describe('bundlers/vite WeappTailwindcss bundle', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doUnmock('node:fs/promises')
    vi.doUnmock('@/bundlers/vite/incremental-runtime-class-set')
    vi.doUnmock('@/bundlers/vite/source-scan')
    vi.doUnmock('@/bundlers/shared/generator-css')
    vi.doUnmock('@/generator')
    clearTailwindV4IncrementalGenerateCacheForTest()
    resetVitePluginTestContext()
    vi.restoreAllMocks()
  })

  afterEach(async () => {
    await Promise.all(
      createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
    )
  })

  it('generates bundle assets and leverages cache', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = createContext({
    })
    setCurrentContext(currentContext)
    const plugins = WeappTailwindcss()
    expect(plugins).toBeDefined()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(currentContext.onLoad).toHaveBeenCalledTimes(1)

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
    expect(postcssPlugins).toContainEqual({ postcssPlugin: 'postcss-html-transform' })
    expect(postcssPlugins).not.toContainEqual({ postcssPlugin: 'mocked-html-transform' })
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
    expect(currentContext.tailwindRuntime.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.tailwindRuntime.getClassSetSync).toHaveBeenCalledTimes(1)

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
    expect(currentContext.tailwindRuntime.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.tailwindRuntime.getClassSetSync).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('limits incremental vite css bundle tasks to avoid HMR memory spikes', async () => {
    const previousConcurrency = process.env['WEAPP_TW_VITE_CSS_CONCURRENCY']
    delete process.env['WEAPP_TW_VITE_CSS_CONCURRENCY']

    try {
      let active = 0
      let maxActive = 0
      const context = createContext({
        styleHandler: vi.fn(async (code: string) => {
          active += 1
          maxActive = Math.max(maxActive, active)
          await new Promise(resolve => setTimeout(resolve, 5))
          active -= 1
          return { css: `css:${code}` }
        }),
      })
      const generateBundle = createGenerateBundleHook({
        opts: context as any,
        runtimeState: {
          tailwindRuntime: context.tailwindRuntime as any,
          readyPromise: Promise.resolve(),
        },
        ensureRuntimeClassSet: vi.fn(async () => new Set(['alpha'])),
        ensureBundleRuntimeClassSet: vi.fn(async () => new Set(['alpha'])),
        debug: vi.fn(),
        getResolvedConfig: vi.fn(() => ({
          command: 'build',
          root: process.cwd(),
          build: {
            outDir: process.cwd(),
            watch: {},
          },
          css: { postcss: { plugins: [] } },
        } as any)),
      })
      const bundle = {
        'a.css': { ...createRollupAsset('.a{color:red}'), fileName: 'a.css' },
        'b.css': { ...createRollupAsset('.b{color:red}'), fileName: 'b.css' },
        'c.css': { ...createRollupAsset('.c{color:red}'), fileName: 'c.css' },
      }

      await generateBundle.call({ addWatchFile: vi.fn() }, {} as any, bundle)
      active = 0
      maxActive = 0
      context.styleHandler.mockClear()

      const incrementalBundle = {
        'a.css': { ...createRollupAsset('.a{color:blue}'), fileName: 'a.css' },
        'b.css': { ...createRollupAsset('.b{color:blue}'), fileName: 'b.css' },
        'c.css': { ...createRollupAsset('.c{color:blue}'), fileName: 'c.css' },
      }

      await generateBundle.call({ addWatchFile: vi.fn() }, {} as any, incrementalBundle)

      expect(context.styleHandler).toHaveBeenCalledTimes(3)
      expect(maxActive).toBe(1)
    }
    finally {
      if (previousConcurrency === undefined) {
        delete process.env['WEAPP_TW_VITE_CSS_CONCURRENCY']
      }
      else {
        process.env['WEAPP_TW_VITE_CSS_CONCURRENCY'] = previousConcurrency
      }
    }
  }, TEST_TIMEOUT_MS)

  it('normalizes generated bundle keys to their Rollup fileName before downstream asset hooks', () => {
    const movedAsset = {
      ...createRollupAsset('.button{color:red}'),
      fileName: 'components/button.acss',
    }
    const bundle = {
      'src/components/button.css': movedAsset,
      'pages/index.js': {
        ...createRollupChunk('console.log("index")'),
        fileName: 'pages/index.js',
      },
    }

    normalizeBundleFileNameKeysForTest(bundle)

    expect(bundle['src/components/button.css']).toBeUndefined()
    expect(bundle['components/button.acss']).toBe(movedAsset)

    const assets: Record<string, { source: () => string }> = {}
    for (const name in bundle) {
      const chunk = bundle[name]
      const source = chunk.type === 'asset' ? chunk.source : chunk.code
      assets[chunk.fileName] = {
        source: () => String(source),
      }
    }
    const assetsProxy = new Proxy(assets, {
      set(target, p, newValue: { source: () => string }) {
        if (typeof p !== 'string') {
          return false
        }
        target[p] = newValue
        const chunk = bundle[p]
        if (chunk.type === 'asset') {
          chunk.source = newValue.source()
        }
        else {
          chunk.code = newValue.source()
        }
        return true
      },
    })

    assetsProxy['components/button.acss'] = {
      source: () => '.button{color:blue}',
    }

    expect((bundle['components/button.acss'] as OutputAsset).source).toBe('.button{color:blue}')
  })

  it('uses oxide source candidates as the default Tailwind v4 runtime input in Vite generator mode', async () => {
    const validateCandidatesMock = vi.fn(async (candidates: Set<string>) => {
      return new Set([...candidates].filter(candidate => candidate === 'bg-[red]'))
    })
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: '.bg-_red_ { background-color: red; }',
      rawCss: '.bg-\\[red\\] { background-color: red; }',
      target: 'weapp',
      classSet: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    const resolveMockTailwindV4Source = vi.fn(async () => ({
      version: 4,
      projectRoot: process.cwd(),
      base: process.cwd(),
      baseFallbacks: [],
      css: '@import "tailwindcss" source(none);',
      dependencies: [],
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
        validateCandidates: validateCandidatesMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4Source: resolveMockTailwindV4Source,
      resolveTailwindV4SourceFromRuntime: resolveMockTailwindV4Source,
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        version: 4,
        projectRoot: process.cwd(),
        baseFallbacks: [],
      })),
    }))

    const runtimeSet = new Set(['from-runtime'])
    const currentContext = createContext({
      templateHandler: vi.fn(async () => '<view></view>'),
      jsHandler: vi.fn((code: string) => ({ code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    })
    setCurrentContext(currentContext)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    await getTransformHandler(sourcePlugin)?.call(
      sourcePlugin,
      '<view class="bg-[red] not-a-tailwind-class">Hello world!</view>',
      path.join(process.cwd(), 'src/pages/index/index.vue'),
    )

    const bundle = {
      'app.css': {
        ...createRollupAsset('@tailwind utilities;'),
        fileName: 'app.css',
      },
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="bg-[red]"></view>'),
        fileName: 'pages/index/index.wxml',
      },
      'pages/index/index.js': {
        ...createRollupChunk('const vnode = "bg-[red] world!"'),
        fileName: 'pages/index/index.js',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.tailwindRuntime.extract).toHaveBeenCalledWith({ write: false })
    expect(currentContext.tailwindRuntime.getClassSet).not.toHaveBeenCalled()
    expect(currentContext.tailwindRuntime.getClassSetSync).not.toHaveBeenCalled()
    expect(validateCandidatesMock).toHaveBeenCalledTimes(1)
    expect([...(validateCandidatesMock.mock.calls[0]?.[0] as Set<string>)]).toEqual(
      expect.arrayContaining(['bg-[red]', 'not-a-tailwind-class']),
    )
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(generateMock.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      incrementalCache: true,
    }))
    expect([...(generateMock.mock.calls[0]?.[0].candidates as Set<string>)]).toEqual(
      expect.arrayContaining(['bg-[red]']),
    )
    expect([...(currentContext.jsHandler.mock.calls[0]?.[1] as Set<string>)]).toEqual(expect.arrayContaining(['bg-[red]']))
    expect((bundle['app.css'] as OutputAsset).source).toContain('background-color: red')
  }, TEST_TIMEOUT_MS)

  it('inlines external postcss config without official Tailwind plugins in force generator mode', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
    }))
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = createContext({
      generator: {
        target: 'weapp',
      },
    })
    setCurrentContext(currentContext)
    currentContext.tailwindRuntime.majorVersion = 4

    const plugins = WeappTailwindcss({
      generator: {
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

  it('detects tailwindcss v4 css sources from vite css transforms when omitted', async () => {
    mockTailwindV4GeneratorCss()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-auto-entry-'))
    createdDirs.push(root)
    const entry = path.join(root, 'subpackage', 'entry.css')
    const configFile = path.join(root, 'subpackage', 'tailwind.config.js')
    const css = '@import "tailwindcss" source(none);\n@config "./tailwind.config.js";'
    await mkdir(path.dirname(entry), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./**/*.wxml"] }\n', 'utf8')
    const refreshTailwindcssRuntime = vi.fn()
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
      },
      refreshTailwindcssRuntime,
    })
    refreshTailwindcssRuntime.mockImplementation(async () => context.tailwindRuntime)
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const servePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const transform = getTransformHandler(servePlugin)

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const result = await transform?.call(
      servePlugin,
      css,
      entry,
    )
    const normalizedCss = `@import "tailwindcss" source(none);\n@config "${configFile.replaceAll('\\', '/')}";`

    expect(context.cssEntries).toBeUndefined()
    expect(context.tailwindcss?.v4?.cssSources).toEqual([
      {
        file: entry,
        base: path.dirname(entry),
        css: normalizedCss,
        dependencies: [configFile],
      },
    ])
    expect(refreshTailwindcssRuntime).toHaveBeenCalledTimes(2)
    expect(String((result as any)?.code)).toContain('/* generated */')
  })

  it('normalizes relative @config directives for css assets that lost their source directory in generateBundle', async () => {
    const generatedCss = '/* generated from normalized asset config */'
    mockTailwindV4GeneratorCss(generatedCss)
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-asset-config-'))
    createdDirs.push(root)
    await mkdir(path.join(root, 'src'), { recursive: true })
    const configFile = path.join(root, 'tailwind.config.js')
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{wxml,ts}"] }\n', 'utf8')

    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.css'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              cssEntries: [],
              cssSources: [],
            },
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.css': {
        ...createRollupAsset('@import "tailwindcss" source(none);\n@config "../tailwind.config.js";'),
        fileName: 'app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)

    await generateBundle?.call({ addWatchFile: vi.fn() }, {} as any, bundle)

    expect(bundle['app.css'].source).toBe(generatedCss)
  })

  it('normalizes relative @config directives for renamed mini-program css assets from source style files', async () => {
    const generatedCss = '/* generated from renamed asset config */'
    const generateMock = vi.fn(async () => ({
      css: generatedCss,
      rawCss: generatedCss,
      target: 'weapp',
      classSet: new Set(['w-4']),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    const resolveTailwindV4Source = vi.fn(async (options: any = {}) => ({
      version: 4,
      projectRoot: process.cwd(),
      base: process.cwd(),
      baseFallbacks: [],
      css: options.css ?? '@import "tailwindcss" source(none);',
      dependencies: [],
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4Source,
        resolveTailwindV4SourceFromRuntime: vi.fn(async (runtime: { options?: { projectRoot?: string } }) => ({
          version: 4,
          projectRoot: runtime.options?.projectRoot ?? process.cwd(),
          base: runtime.options?.projectRoot ?? process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
        resolveTailwindV4SourceOptionsFromRuntime: vi.fn((runtime: { options?: { projectRoot?: string } }) => ({
          version: 4,
          projectRoot: runtime.options?.projectRoot ?? process.cwd(),
          baseFallbacks: [],
        })),
      }
    })

    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-renamed-config-'))
    createdDirs.push(root)
    await mkdir(path.join(root, 'src'), { recursive: true })
    const sourceFile = path.join(root, 'src/app.css')
    const configFile = path.join(root, 'tailwind.config.js')
    await writeFile(sourceFile, '@import "tailwindcss" source(none);\n@config "../tailwind.config.js";\n', 'utf8')
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{wxml,ts}"] }\n', 'utf8')

    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: (_file: string) => true,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              cssEntries: [],
              cssSources: [],
            },
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'app.wxss': {
        ...createRollupAsset('@import "tailwindcss" source(none);\n@config "../tailwind.config.js";'),
        fileName: 'app.wxss',
        originalFileNames: [sourceFile],
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)

    await generateBundle?.call({ addWatchFile: vi.fn() }, {} as any, bundle)

    expect(bundle['app.wxss'].source).toBe(generatedCss)
    expect(resolveTailwindV4Source).toHaveBeenCalledWith(expect.objectContaining({
      css: expect.stringContaining(configFile.replaceAll('\\', '/')),
    }))
  })

  it('generates Tailwind v4 css in vite serve after sass imports are inlined', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-css-hmr-'))
    createdDirs.push(root)
    const configFile = path.join(root, 'tailwind.config.js')
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{vue,ts}"] }\n', 'utf8')
    const generatedCss = '.flex{display:flex}.bg-\\[\\#123456\\]{background-color:#123456}'
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: vi.fn(async (options: { candidates: Set<string> }) => ({
            css: generatedCss,
            rawCss: generatedCss,
            target: 'weapp',
            classSet: new Set(options.candidates),
            dependencies: [],
            sources: [],
            root: null,
            version: 3,
          })),
          validateCandidates: vi.fn(async (candidates: Set<string>) => candidates),
        })),
      }
    })

    const runtimeSet = new Set(['flex', 'bg-[#123456]'])
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            config: configFile,
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const cssHmrPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve-hmr') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(cssHmrPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const css = [
      '@config "../tailwind.config.js";',
      '@tailwind utilities;',
      '.fixture { @apply flex bg-[#123456]; }',
    ].join('\n')
    const code = [
      'import {updateStyle as __vite__updateStyle} from "/@vite/client"',
      'const __vite__id = "/src/App.vue?vue&type=style&index=0&lang.scss"',
      `const __vite__css = ${JSON.stringify(css)}`,
      '__vite__updateStyle(__vite__id, __vite__css)',
    ].join('\n')

    const transform = getTransformHandler(cssHmrPlugin)
    const result = await transform?.call(
      cssHmrPlugin,
      code,
      '/src/App.vue?vue&type=style&index=0&lang.scss&direct',
    )
    const resultCode = String((result as any)?.code)

    expect(resultCode).toContain('weapp-tailwindcss vite-generated-css')
    expect(resultCode).toContain('.flex{display:flex}')
    expect(resultCode).not.toContain('@tailwind utilities')
    expect(resultCode).not.toContain('@apply flex')
  }, TEST_TIMEOUT_MS)

  it.each([
    ['web', 'weapp-tw-vitepress-config-'],
    ['weapp', 'weapp-tw-miniprogram-config-'],
  ] as const)('normalizes Tailwind v4 css source @config paths for %s target relative to the vite css module file', async (target, prefix) => {
    const root = await mkdtemp(path.join(os.tmpdir(), prefix))
    createdDirs.push(root)
    const cssFile = path.join(root, 'src/styles/theme/index.css')
    const configFile = path.join(root, 'tailwind.config.js')
    const css = '@import "tailwindcss";\n@config "../../../tailwind.config.js";'
    await mkdir(path.dirname(cssFile), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./**/*.{md,wxml}"] }\n', 'utf8')

    const createdSources: Array<{ css: string, base: string }> = []
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string, base: string }) => {
          createdSources.push(source)
          return {
            generate: vi.fn(async (options: { candidates: Set<string> }) => ({
              css: '.font-bold{font-weight:700}',
              rawCss: '.font-bold{font-weight:700}',
              target,
              classSet: new Set(options.candidates),
              dependencies: [],
              sources: [],
              root: null,
              version: 4,
            })),
          }
        }),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    const context = createContext({
      generator: {
        target,
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['font-bold'])),
        getClassSetSync: vi.fn(() => new Set(['font-bold'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['font-bold']) })),
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              cssSources: [
                {
                  file: cssFile,
                  base: path.dirname(cssFile),
                  css,
                  dependencies: [configFile],
                },
              ],
            },
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      generator: {
        target,
      },
    })
    const servePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const transform = getTransformHandler(servePlugin)

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const result = await transform?.call(servePlugin, css, cssFile)

    expect(String((result as any)?.code)).toContain('.font-bold{font-weight:700}')
    expect(createdSources[0]?.base).toBe(root)
    expect(createdSources[0]?.css).toContain(`@config "${configFile.replaceAll('\\', '/')}";`)
    expect(createdSources[0]?.css).not.toContain('../../../tailwind.config.js')
  }, TEST_TIMEOUT_MS)

  it('returns recorded Tailwind root css modules during vue-only hot updates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-hmr-root-css-'))
    createdDirs.push(root)
    const pageFile = path.join(root, 'src/pages/index/index.vue')
    const styleId = '/src/App.vue?vue&type=style&index=0&lang.scss&direct'
    const generatedCss = '.bg-\\[\\#134543\\]{background-color:#134543}'
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: vi.fn(async (options: { candidates: Set<string> }) => ({
            css: generatedCss,
            rawCss: generatedCss,
            target: 'web',
            classSet: new Set(options.candidates),
            dependencies: [],
            sources: [],
            root: null,
            version: 3,
          })),
          validateCandidates: vi.fn(async (candidates: Set<string>) => candidates),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      styleHandler: vi.fn(async () => {
        throw new Error('web target should not use mini-program styleHandler')
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['bg-[#134543]'])),
        getClassSetSync: vi.fn(() => new Set(['bg-[#134543]'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['bg-[#134543]']) })),
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      generator: {
        target: 'web',
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const cssHmrPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve-hmr') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(cssHmrPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(cssHmrPlugin)
    await transform?.call(
      cssHmrPlugin,
      [
        'import {updateStyle as __vite__updateStyle} from "/@vite/client"',
        `const __vite__id = ${JSON.stringify(styleId)}`,
        'const __vite__css = "@tailwind utilities;"',
        '__vite__updateStyle(__vite__id, __vite__css)',
      ].join('\n'),
      styleId,
    )

    const vueModule = {
      id: pageFile,
      isSelfAccepting: true,
      url: '/src/pages/index/index.vue',
    } as ModuleNode
    const cssModule = {
      id: styleId,
      url: styleId,
    } as ModuleNode
    const invalidateModule = vi.fn()
    const wsSend = vi.fn()
    const handleHotUpdate = sourcePlugin.handleHotUpdate as any
    const result = await handleHotUpdate.call(sourcePlugin, {
      file: pageFile,
      modules: [vueModule],
      timestamp: 123456,
      server: {
        ws: {
          send: wsSend,
        },
        moduleGraph: {
          getModuleById: vi.fn(id => id === styleId ? cssModule : undefined),
          getModulesByFile: vi.fn(() => undefined),
          invalidateModule,
        },
      },
    } as HmrContext)

    expect(result).toEqual([vueModule, cssModule])
    expect(invalidateModule).toHaveBeenCalledWith(cssModule)
    await Promise.resolve()
    expect(wsSend).toHaveBeenCalledWith({
      type: 'update',
      updates: [
        {
          acceptedPath: styleId,
          explicitImportRequired: false,
          isWithinCircularImport: false,
          path: styleId,
          timestamp: 123456,
          type: 'js-update',
        },
      ],
    })
  }, TEST_TIMEOUT_MS)

  it('regenerates serve css hmr from updated wxml expression candidates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-wxml-expression-hmr-'))
    createdDirs.push(root)
    const pageFile = path.join(root, 'pages/index/index.wxml')
    const appStyleFile = path.join(root, 'app.scss')
    const cssModuleId = `${appStyleFile}?direct`
    const seenCandidates: string[][] = []

    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(
      pageFile,
      `<view class="min-h-screen {{ mode === 'light'?'bg-[#111111] text-slate-800':'bg-gray-900 text-slate-200' }} transition-colors duration-500"></view>`,
      'utf8',
    )
    await writeFile(
      appStyleFile,
      [
        '@import "tailwindcss";',
        '@source "./pages/**/*.wxml";',
      ].join('\n'),
      'utf8',
    )

    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: vi.fn(async (options: { candidates: Set<string> }) => {
            const candidates = [...options.candidates].sort()
            seenCandidates.push(candidates)
            const css = candidates
              .filter(candidate => candidate.startsWith('bg-[#'))
              .map(candidate => `.${replaceWxml(candidate)}{background-color:${candidate.slice(4, -1)}}`)
              .join('\n')
            return {
              css,
              rawCss: css,
              target: 'weapp',
              classSet: new Set(options.candidates),
              dependencies: [],
              sources: [],
              root: null,
              version: 4,
            }
          }),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          version: 4,
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      tailwindcssBasedir: root,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        options: {
          tailwindcss: {
            cwd: root,
            v4: {
              base: root,
              cssEntries: [appStyleFile],
            },
          },
        },
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      tailwindcssBasedir: root,
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const cssHmrPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve-hmr') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(cssHmrPlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const transform = getTransformHandler(cssHmrPlugin)
    const createCssHmrModule = () => [
      'import {updateStyle as __vite__updateStyle} from "/@vite/client"',
      `const __vite__id = ${JSON.stringify(cssModuleId)}`,
      `const __vite__css = ${JSON.stringify([
        '@import "tailwindcss";',
        '@source "./pages/**/*.wxml";',
      ].join('\n'))}`,
      '__vite__updateStyle(__vite__id, __vite__css)',
    ].join('\n')

    await transform?.call(cssHmrPlugin, createCssHmrModule(), cssModuleId)
    expect(seenCandidates.at(-1)).toContain('bg-[#111111]')

    await writeFile(
      pageFile,
      `<view class="min-h-screen {{ mode === 'light'?'bg-[#f40909] text-slate-800':'bg-gray-900 text-slate-200' }} transition-colors duration-500"></view>`,
      'utf8',
    )

    const cssModule = {
      id: cssModuleId,
      url: cssModuleId,
    } as ModuleNode
    await (sourcePlugin.handleHotUpdate as any)?.call(sourcePlugin, {
      file: pageFile,
      modules: [],
      timestamp: 123456,
      server: {
        ws: {
          send: vi.fn(),
        },
        moduleGraph: {
          getModuleById: vi.fn(id => id === cssModuleId ? cssModule : undefined),
          getModulesByFile: vi.fn(() => undefined),
          invalidateModule: vi.fn(),
        },
      },
    } as HmrContext)

    const result = await transform?.call(cssHmrPlugin, createCssHmrModule(), cssModuleId)
    const resultCode = String((result as any)?.code)
    expect(seenCandidates.at(-1)).toContain('bg-[#f40909]')
    expect(seenCandidates.at(-1)).not.toContain('bg-[#111111]')
    expect(resultCode).toContain(replaceWxml('bg-[#f40909]'))
    expect(resultCode).not.toContain(replaceWxml('bg-[#111111]'))
  }, TEST_TIMEOUT_MS)

  it('regenerates watch bundle css from updated wxml expression candidates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-wxml-expression-bundle-'))
    createdDirs.push(root)
    const sourceRoot = path.join(root, 'project')
    const pageFile = path.join(sourceRoot, 'pages/index/index.wxml')
    const appStyleFile = path.join(sourceRoot, 'app.css')
    const seenCandidates: string[][] = []
    const runtimeSet = new Set<string>([
      'min-h-screen',
      'bg-[#111111]',
      'text-slate-800',
      'bg-gray-900',
      'text-slate-200',
      'transition-colors',
      'duration-500',
    ])

    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(
      pageFile,
      `<view class="min-h-screen {{ mode === 'light'?'bg-[#111111] text-slate-800':'bg-gray-900 text-slate-200' }} transition-colors duration-500"></view>`,
      'utf8',
    )
    await writeFile(
      appStyleFile,
      [
        '@import "tailwindcss";',
        '@source "./pages/**/*.{wxml,js,ts}";',
      ].join('\n'),
      'utf8',
    )

    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: vi.fn(async (options: { candidates: Set<string> }) => {
            const candidates = [...options.candidates].sort()
            seenCandidates.push(candidates)
            const css = candidates
              .filter(candidate => candidate.startsWith('bg-[#'))
              .map(candidate => `.${replaceWxml(candidate)}{background-color:${candidate.slice(4, -1)}}`)
              .join('\n')
            return {
              css,
              rawCss: css,
              target: 'weapp',
              classSet: new Set(options.candidates),
              dependencies: [],
              sources: [],
              root: null,
              version: 4,
            }
          }),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          version: 4,
          projectRoot: sourceRoot,
          base: sourceRoot,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
          packageName: 'tailwindcss',
        })),
        resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
          projectRoot: sourceRoot,
          base: sourceRoot,
          baseFallbacks: [],
          cssEntries: [appStyleFile],
          packageName: 'tailwindcss',
        })),
      }
    })
    const jsHandler = createJsHandler({
      escapeMap: MappingChars2String,
      jsArbitraryValueFallback: false,
      tailwindcssMajorVersion: 4,
    })
    const templateHandler = createTemplateHandler({
      escapeMap: MappingChars2String,
      jsHandler,
    })

    setCurrentContext(createContext({
      cssEntries: [appStyleFile],
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss' || file === 'src/tailwind.wxss'),
      tailwindcssBasedir: sourceRoot,
      templateHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
        options: {
          projectRoot: sourceRoot,
          tailwindcss: {
            cwd: sourceRoot,
            v4: {
              base: sourceRoot,
              cssEntries: [appStyleFile],
            },
          },
        },
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [appStyleFile],
      tailwindcssBasedir: sourceRoot,
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'project/dist', watch: {} },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = () => ({
      'pages/index/index.wxml': {
        ...createRollupAsset(''),
        fileName: 'pages/index/index.wxml',
        source: '<view class="min-h-screen {{ mode === \'light\'?\'bg-[#111111] text-slate-800\':\'bg-gray-900 text-slate-200\' }} transition-colors duration-500"></view>',
      },
      'app.wxss': {
        ...createRollupAsset([
          '@import "tailwindcss";',
          '@source "../pages/**/*.{wxml,js,ts}";',
        ].join('\n')),
        fileName: 'app.wxss',
        originalFileNames: [appStyleFile],
      },
    })

    const firstBundle = createBundle()
    await generateBundle?.call({ addWatchFile: vi.fn() }, {} as any, firstBundle)
    const firstCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()
    const firstWxml = (firstBundle['pages/index/index.wxml'] as OutputAsset).source.toString()
    expect(seenCandidates.at(-1)).toContain('bg-[#111111]')
    expect(firstCss).toContain(replaceWxml('bg-[#111111]'))
    expect(firstWxml).toContain(replaceWxml('bg-[#111111]'))

    await writeFile(
      pageFile,
      `<view class="min-h-screen {{ mode === 'light'?'bg-[#f40909] text-slate-800':'bg-gray-900 text-slate-200' }} transition-colors duration-500"></view>`,
      'utf8',
    )
    runtimeSet.delete('bg-[#111111]')
    runtimeSet.add('bg-[#f40909]')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, pageFile, { event: 'update' })

    const secondBundle = createBundle()
    secondBundle['pages/index/index.wxml'].source = '<view class="min-h-screen {{ mode === \'light\'?\'bg-[#f40909] text-slate-800\':\'bg-gray-900 text-slate-200\' }} transition-colors duration-500"></view>'
    await generateBundle?.call({ addWatchFile: vi.fn() }, {} as any, secondBundle)
    const secondCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()
    const secondWxml = (secondBundle['pages/index/index.wxml'] as OutputAsset).source.toString()

    expect(seenCandidates.at(-1)).toContain('bg-[#f40909]')
    expect(seenCandidates.at(-1)).not.toContain('bg-[#111111]')
    expect(secondCss).toContain(replaceWxml('bg-[#f40909]'))
    expect(secondCss).not.toContain(replaceWxml('bg-[#111111]'))
    expect(secondWxml).toContain(replaceWxml('bg-[#f40909]'))
    expect(secondWxml).not.toContain(replaceWxml('bg-[#111111]'))

    await writeFile(
      pageFile,
      `<view class="min-h-screen {{ mode === 'light'?'bg-[#111111] text-slate-800':'bg-gray-900 text-slate-200' }} transition-colors duration-500"></view>`,
      'utf8',
    )
    runtimeSet.delete('bg-[#f40909]')
    runtimeSet.add('bg-[#111111]')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, pageFile, { event: 'update' })
    await (sourcePlugin.transform as any)?.call(
      sourcePlugin,
      `<view class="min-h-screen {{ mode === 'light'?'bg-[#f40909] text-slate-800':'bg-gray-900 text-slate-200' }} transition-colors duration-500"></view>`,
      'pages/index/index.wxml',
    )

    const rollbackBundle = createBundle()
    rollbackBundle['pages/index/index.wxml'].source = '<view class="min-h-screen {{ mode === \'light\'?\'bg-[#f40909] text-slate-800\':\'bg-gray-900 text-slate-200\' }} transition-colors duration-500"></view>'
    await generateBundle?.call({ addWatchFile: vi.fn() }, {} as any, rollbackBundle)
    const rollbackCss = (rollbackBundle['app.wxss'] as OutputAsset).source.toString()
    const rollbackWxml = (rollbackBundle['pages/index/index.wxml'] as OutputAsset).source.toString()

    expect(seenCandidates.at(-1)).toContain('bg-[#111111]')
    expect(seenCandidates.at(-1)).not.toContain('bg-[#f40909]')
    expect(rollbackCss).toContain(replaceWxml('bg-[#111111]'))
    expect(rollbackWxml).toContain(replaceWxml('bg-[#111111]'))
    expect(rollbackWxml).not.toContain(replaceWxml('bg-[#f40909]'))
  }, TEST_TIMEOUT_MS)

  it('reloads uni vue source hot updates that only produce css hmr updates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-hmr-empty-modules-'))
    createdDirs.push(root)
    const pageFile = path.join(root, 'src/pages/index/index.vue')
    const styleId = '/src/App.vue?vue&type=style&index=0&lang.scss&direct'
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: vi.fn(async () => ({
            css: '.text-\\[\\#00ff00\\]{color:#00ff00}',
            rawCss: '.text-\\[\\#00ff00\\]{color:#00ff00}',
            target: 'web',
            classSet: new Set(['text-[#00ff00]']),
            dependencies: [],
            sources: [],
            root: null,
            version: 3,
          })),
          validateCandidates: vi.fn(async (candidates: Set<string>) => candidates),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['text-[#00ff00]'])),
        getClassSetSync: vi.fn(() => new Set(['text-[#00ff00]'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['text-[#00ff00]']) })),
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      generator: {
        target: 'web',
      },
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const cssHmrPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve-hmr') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      plugins: [{ name: 'uni:app' }],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    await getTransformHandler(cssHmrPlugin)?.call(
      cssHmrPlugin,
      [
        'import {updateStyle as __vite__updateStyle} from "/@vite/client"',
        `const __vite__id = ${JSON.stringify(styleId)}`,
        'const __vite__css = "@tailwind utilities;"',
        '__vite__updateStyle(__vite__id, __vite__css)',
      ].join('\n'),
      styleId,
    )

    const cssModule = {
      id: styleId,
      url: styleId,
    } as ModuleNode
    const vueModule = {
      id: pageFile,
      isSelfAccepting: true,
      url: '/src/pages/index/index.vue',
    } as ModuleNode
    const invalidateModule = vi.fn()
    const wsSend = vi.fn()
    const result = await (sourcePlugin.handleHotUpdate as any)?.call(sourcePlugin, {
      file: pageFile,
      modules: [vueModule, cssModule],
      timestamp: 123456,
      server: {
        ws: {
          send: wsSend,
        },
        moduleGraph: {
          getModuleById: vi.fn(id => id === styleId ? cssModule : undefined),
          getModulesByFile: vi.fn(() => undefined),
          invalidateModule,
        },
      },
    } as HmrContext)

    expect(wsSend).toHaveBeenCalledWith({
      type: 'full-reload',
      path: '*',
      triggeredBy: pageFile,
    })
    expect(result).toEqual([])
    expect(invalidateModule).toHaveBeenCalledWith(cssModule)
    await Promise.resolve()
    expect(wsSend).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('generates Tailwind v4 css in vite serve before Vite wraps css hmr modules', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-serve-css-root-'))
    createdDirs.push(root)
    const configFile = path.join(root, 'tailwind.config.js')
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{vue,ts}"] }\n', 'utf8')
    const generatedCss = '.flex{display:flex}.bg-midnight{background-color:#121063}'
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: vi.fn(async (options: { candidates: Set<string> }) => ({
            css: generatedCss,
            rawCss: generatedCss,
            target: 'weapp',
            classSet: new Set(options.candidates),
            dependencies: [configFile],
            sources: [],
            root: null,
            version: 4,
          })),
          validateCandidates: vi.fn(async (candidates: Set<string>) => candidates),
        })),
      }
    })

    const runtimeSet = new Set(['flex', 'bg-midnight'])
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            config: configFile,
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const servePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(servePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const addWatchFile = vi.fn()
    const transform = getTransformHandler(servePlugin)
    const result = await transform?.call(
      { ...servePlugin, addWatchFile },
      [
        '@import "tailwindcss" source(none);',
        '@config "./tailwind.config.js";',
        '@source "./src/**/*.{vue,ts}";',
      ].join('\n'),
      path.join(root, 'src/main.css?direct'),
    )
    const resultCode = String((result as any)?.code)

    expect(resultCode).toContain('weapp-tailwindcss vite-generated-css')
    expect(resultCode).toContain('.flex{display:flex}')
    expect(resultCode).toContain('.bg-midnight')
    expect(resultCode).not.toContain('@import "tailwindcss"')
    expect(addWatchFile).toHaveBeenCalledWith(configFile)
  }, TEST_TIMEOUT_MS)

  it('discovers omitted Tailwind v4 css sources before vite buildStart scans candidates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-auto-discover-'))
    createdDirs.push(root)
    const appCss = path.join(root, 'src', 'app.css')
    const appPage = path.join(root, 'src', 'pages', 'index', 'index.tsx')
    const subCss = path.join(root, 'src', 'sub-independent', 'pages', 'index.css')
    const subConfig = path.join(root, 'src', 'sub-independent', 'pages', 'tailwind.config.js')
    const subPage = path.join(root, 'src', 'sub-independent', 'pages', 'index.tsx')
    await mkdir(path.dirname(appPage), { recursive: true })
    await mkdir(path.dirname(subPage), { recursive: true })
    await writeFile(appCss, '@import "tailwindcss" source(none);\n@source "../src/**/*.{ts,tsx}";\n', 'utf8')
    await writeFile(appPage, 'export default () => <View className="bg-[#010203]" />\n', 'utf8')
    await writeFile(subCss, '@import "tailwindcss" source(none);\n@config "./tailwind.config.js";\n', 'utf8')
    await writeFile(subConfig, 'module.exports = { content: ["./**/*.{ts,tsx}"] }\n', 'utf8')
    await writeFile(subPage, 'export default () => <View className="text-[37px]" />\n', 'utf8')

    const refreshTailwindcssRuntime = vi.fn()
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set()),
        getClassSetSync: vi.fn(() => new Set()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set() })),
        options: {
          tailwindcss: {
            v4: {
              projectRoot: root,
            },
          },
        },
      },
      refreshTailwindcssRuntime,
    })
    refreshTailwindcssRuntime.mockImplementation(async () => context.tailwindRuntime)
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)
    refreshTailwindcssRuntime.mockClear()
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    expect(context.tailwindcss?.v4?.cssSources).toEqual([
      expect.objectContaining({
        file: appCss,
        base: path.dirname(appCss),
        css: '@import "tailwindcss" source(none);\n@source "../src/**/*.{ts,tsx}";\n',
        dependencies: [],
      }),
      expect.objectContaining({
        file: subCss,
        base: path.dirname(subCss),
        css: `@import "tailwindcss" source(none);\n@config "${subConfig.replace(/\\/g, '/')}";\n`,
        dependencies: [subConfig],
      }),
    ])
    expect(refreshTailwindcssRuntime).toHaveBeenCalledTimes(1)

    const bundle = {
      'app.css': {
        ...createRollupAsset(MINIMAL_TAILWIND_V4_CSS),
        fileName: 'app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call({ addWatchFile: vi.fn() }, {}, bundle, false)

    expect(String(bundle['app.css'].source)).toContain('.bg-_b_h010203_B')
    expect(String(bundle['app.css'].source)).toContain('.text-_b37px_B')
  }, TEST_TIMEOUT_MS)

  it('skips single-entry Tailwind v4 candidate validation when multiple css entries own independent configs', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v3-multi-entry-'))
    createdDirs.push(root)
    const appCss = path.join(root, 'src/app.css')
    const appConfig = path.join(root, 'src/tailwind.config.js')
    const appPage = path.join(root, 'src/pages/index/index.wxml')
    const subCss = path.join(root, 'src/subpackages/normal/pages/entry/index.css')
    const subConfig = path.join(root, 'src/subpackages/normal/tailwind.config.js')
    const subPage = path.join(root, 'src/subpackages/normal/pages/entry/index.wxml')
    await mkdir(path.dirname(subCss), { recursive: true })
    await mkdir(path.dirname(appPage), { recursive: true })
    await writeFile(appCss, '@config "./tailwind.config.js";\n@tailwind utilities;\n', 'utf8')
    await writeFile(subCss, '@config "../../tailwind.config.js";\n@tailwind utilities;\n', 'utf8')
    await writeFile(appConfig, 'module.exports = { content: ["./pages/**/*.{wxml,js,ts}"] }\n', 'utf8')
    await writeFile(subConfig, 'module.exports = { content: ["./**/*.{wxml,js,ts}"] }\n', 'utf8')
    await writeFile(appPage, '<view class="bg-main"></view>\n', 'utf8')
    await writeFile(subPage, '<view class="bg-normal"></view>\n', 'utf8')

    const validateCandidates = vi.fn(async (candidates: Set<string>) => new Set(candidates))
    const generateMock = vi.fn(async (options: { candidates: Set<string> }, source?: { config?: string }) => {
      const candidates = source?.config === subConfig
        ? ['bg-normal']
        : [...options.candidates]
      return {
        css: candidates.map(candidate => `.${candidate}{}`).join('\n'),
        rawCss: candidates.map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
        classSet: new Set(candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
      }
    })

    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { config?: string }) => ({
          generate(options: { candidates: Set<string> }) {
            return generateMock(options, source)
          },
          validateCandidates,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    const runtimeSet = new Set(['bg-main', 'bg-normal'])
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcssBasedir: root,
          tailwindcss: {
            config: appConfig,
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [appCss, subCss],
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await sourcePlugin.buildStart?.call(sourcePlugin as any, {} as any)

    const bundle = {
      'app.css': {
        ...createRollupAsset('@config "./tailwind.config.js";\n@tailwind utilities;'),
        fileName: 'app.css',
        originalFileNames: [appCss],
      },
      'subpackages/normal/pages/entry/index.css': {
        ...createRollupAsset('@config "../../tailwind.config.js";\n@tailwind utilities;'),
        fileName: 'subpackages/normal/pages/entry/index.css',
        originalFileNames: [subCss],
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call({ addWatchFile: vi.fn() }, {}, bundle, false)

    expect(validateCandidates).not.toHaveBeenCalled()
    expect(generateMock.mock.calls.some(call => call[0].candidates instanceof Set)).toBe(true)
    const generatedCandidateSets = generateMock.mock.calls.map(call => [...call[0].candidates])
    expect(generatedCandidateSets).toContainEqual(['bg-main'])
    expect(String(bundle['app.css'].source)).toContain('.bg-main{}')
    expect(String(bundle['app.css'].source)).not.toContain('.bg-normal{}')
    expect(String(bundle['subpackages/normal/pages/entry/index.css'].source)).toContain('.bg-normal{}')
    expect(String(bundle['subpackages/normal/pages/entry/index.css'].source)).not.toContain('.bg-main{}')
  }, TEST_TIMEOUT_MS)

  it('scans Tailwind v4 @config content for vite source candidates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-config-content-'))
    createdDirs.push(root)
    const cssEntry = path.join(root, 'sub-independent', 'pages', 'index.css')
    const configFile = path.join(root, 'sub-independent', 'tailwind.config.cjs')
    const pageFile = path.join(root, 'sub-independent', 'pages', 'index.wxml')
    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./pages/**/*.{wxml,ts}"] }\n', 'utf8')
    await writeFile(pageFile, '<view class="bg-[#010721] text-[35px] h-[29px]">ok</view>\n', 'utf8')
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].map(candidate => `.${replaceWxml(candidate)}{}`).join(''),
      rawCss: [...options.candidates].map(candidate => `.${candidate}{}`).join(''),
      target: 'weapp',
      classSet: new Set(options.candidates),
      dependencies: [cssEntry, configFile],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          version: 4,
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })

    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set()),
        getClassSetSync: vi.fn(() => new Set()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set() })),
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await writeFile(cssEntry, '@import "tailwindcss" source(none);\n@config "../tailwind.config.cjs";\n', 'utf8')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const bundle = {
      'app.css': {
        ...createRollupAsset(MINIMAL_TAILWIND_V4_CSS),
        fileName: 'app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call({ addWatchFile: vi.fn() }, {}, bundle, false)

    expect(String(bundle['app.css'].source)).toContain('.bg-_b_h010721_B')
    expect(String(bundle['app.css'].source)).toContain('.text-_b35px_B')
    expect(String(bundle['app.css'].source)).toContain('.h-_b29px_B')
  })

  it('generates Tailwind v4 css entries from their own @config content in main-package directories', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v3-main-multi-config-'))
    createdDirs.push(root)
    const featureACss = path.join(root, 'src/features/a/index.css')
    const featureBCss = path.join(root, 'src/features/b/index.css')
    const featureAConfig = path.join(root, 'src/features/a/tailwind.config.cjs')
    const featureBConfig = path.join(root, 'src/features/b/tailwind.config.cjs')
    const featureAPage = path.join(root, 'src/features/a/index.wxml')
    const featureBPage = path.join(root, 'src/features/b/index.wxml')
    await mkdir(path.dirname(featureAPage), { recursive: true })
    await mkdir(path.dirname(featureBPage), { recursive: true })
    await writeFile(featureAConfig, 'module.exports = { content: ["./**/*.{wxml,js,ts}"] }\n', 'utf8')
    await writeFile(featureBConfig, 'module.exports = { content: ["./**/*.{wxml,js,ts}"] }\n', 'utf8')
    await writeFile(featureAPage, '<view class="bg-feature-a"></view>\n', 'utf8')
    await writeFile(featureBPage, '<view class="bg-feature-b"></view>\n', 'utf8')
    await writeFile(featureACss, '@config "./tailwind.config.cjs";\n@tailwind utilities;\n', 'utf8')
    await writeFile(featureBCss, '@config "./tailwind.config.cjs";\n@tailwind utilities;\n', 'utf8')

    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join(''),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join(''),
      target: 'weapp',
      classSet: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    const runtimeSet = new Set(['bg-feature-a', 'bg-feature-b', 'bg-global'])
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcssBasedir: root,
          tailwindcss: {
            config: featureAConfig,
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [featureACss, featureBCss],
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await sourcePlugin.buildStart?.call(sourcePlugin as any, {} as any)

    const bundle = {
      'src/features/a/index.css': {
        ...createRollupAsset('@config "./tailwind.config.cjs";\n@tailwind utilities;'),
        fileName: 'src/features/a/index.css',
        originalFileNames: [featureACss],
      },
      'src/features/b/index.css': {
        ...createRollupAsset('@config "./tailwind.config.cjs";\n@tailwind utilities;'),
        fileName: 'src/features/b/index.css',
        originalFileNames: [featureBCss],
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call({ addWatchFile: vi.fn() }, {}, bundle, false)

    const featureAOutput = String(bundle['src/features/a/index.css'].source)
    const featureBOutput = String(bundle['src/features/b/index.css'].source)
    expect(featureAOutput).toContain('.bg-feature-a{}')
    expect(featureAOutput).not.toContain('.bg-feature-b{}')
    expect(featureAOutput).not.toContain('.bg-global{}')
    expect(featureBOutput).toContain('.bg-feature-b{}')
    expect(featureBOutput).not.toContain('.bg-feature-a{}')
    expect(featureBOutput).not.toContain('.bg-global{}')
  }, TEST_TIMEOUT_MS)

  it('generates Tailwind v4 css entries from their own @source and @config content in main-package directories', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v4-main-multi-source-'))
    createdDirs.push(root)
    const featureACss = path.join(root, 'src/features/a/index.css')
    const featureBCss = path.join(root, 'src/features/b/index.css')
    const featureBConfig = path.join(root, 'src/features/b/tailwind.config.cjs')
    const featureAPage = path.join(root, 'src/features/a/index.wxml')
    const featureBPage = path.join(root, 'src/features/b/index.wxml')
    await mkdir(path.dirname(featureAPage), { recursive: true })
    await mkdir(path.dirname(featureBPage), { recursive: true })
    await writeFile(featureAPage, '<view class="bg-feature-a"></view>\n', 'utf8')
    await writeFile(featureBConfig, 'module.exports = { content: ["./**/*.{wxml,js,ts}"] }\n', 'utf8')
    await writeFile(featureBPage, '<view class="bg-feature-b"></view>\n', 'utf8')
    await writeFile(featureACss, '@import "tailwindcss" source(none);\n@source "./**/*.{wxml,js,ts}";\n', 'utf8')
    await writeFile(featureBCss, '@import "tailwindcss" source(none);\n@config "./tailwind.config.cjs";\n', 'utf8')

    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join(''),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join(''),
      target: 'weapp',
      classSet: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          version: 4,
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
          packageName: 'tailwindcss',
        })),
        resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
          version: 4,
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          packageName: 'tailwindcss',
        })),
        resolveTailwindV4Source: vi.fn(async (options: { base?: string, css?: string } = {}) => ({
          version: 4,
          projectRoot: root,
          base: options.base ?? root,
          baseFallbacks: [],
          css: options.css ?? '@import "tailwindcss" source(none);',
          dependencies: [],
          packageName: 'tailwindcss',
        })),
      }
    })

    const runtimeSet = new Set(['bg-feature-a', 'bg-feature-b', 'bg-global'])
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          tailwindcss: {
            v4: {
              projectRoot: root,
            },
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [featureACss, featureBCss],
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await sourcePlugin.buildStart?.call(sourcePlugin as any, {} as any)

    const bundle = {
      'src/features/a/index.css': {
        ...createRollupAsset('@import "tailwindcss" source(none);\n@source "./**/*.{wxml,js,ts}";'),
        fileName: 'src/features/a/index.css',
        originalFileNames: [featureACss],
      },
      'src/features/b/index.css': {
        ...createRollupAsset('@import "tailwindcss" source(none);\n@config "./tailwind.config.cjs";'),
        fileName: 'src/features/b/index.css',
        originalFileNames: [featureBCss],
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call({ addWatchFile: vi.fn() }, {}, bundle, false)

    const featureAOutput = String(bundle['src/features/a/index.css'].source)
    const featureBOutput = String(bundle['src/features/b/index.css'].source)
    expect(featureAOutput).toContain('.bg-feature-a{}')
    expect(featureAOutput).not.toContain('.bg-feature-b{}')
    expect(featureAOutput).not.toContain('.bg-global{}')
    expect(featureBOutput).toContain('.bg-feature-b{}')
    expect(featureBOutput).not.toContain('.bg-feature-a{}')
    expect(featureBOutput).not.toContain('.bg-global{}')
  }, TEST_TIMEOUT_MS)

  it('keeps explicit Tailwind v4 @config with empty content from falling back to global candidates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v3-empty-config-'))
    createdDirs.push(root)
    const cssEntry = path.join(root, 'src/empty/index.css')
    const configFile = path.join(root, 'src/empty/tailwind.config.cjs')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: [] }\n', 'utf8')
    await writeFile(cssEntry, '@config "./tailwind.config.cjs";\n@tailwind utilities;\n', 'utf8')

    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join(''),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join(''),
      target: 'weapp',
      classSet: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    const runtimeSet = new Set(['bg-global'])
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcssBasedir: root,
          tailwindcss: {
            config: configFile,
          },
        },
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)
    await sourcePlugin.buildStart?.call(sourcePlugin as any, {} as any)

    const bundle = {
      'src/empty/index.css': {
        ...createRollupAsset('@config "./tailwind.config.cjs";\n@tailwind utilities;'),
        fileName: 'src/empty/index.css',
        originalFileNames: [cssEntry],
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call({ addWatchFile: vi.fn() }, {}, bundle, false)

    expect(generateMock).toHaveBeenCalled()
    expect([...generateMock.mock.calls.at(-1)![0].candidates]).toEqual([])
    expect(String(bundle['src/empty/index.css'].source)).not.toContain('.bg-global{}')
  }, TEST_TIMEOUT_MS)

  it('updates auto tailwindcss v4 css source content on repeated vite css transforms', async () => {
    mockTailwindV4GeneratorCss()
    const entry = path.join(os.tmpdir(), 'weapp-tw-vite-auto-entry-update.css')
    const refreshTailwindcssRuntime = vi.fn()
    const context = createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
      },
      refreshTailwindcssRuntime,
    })
    refreshTailwindcssRuntime.mockImplementation(async () => context.tailwindRuntime)
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const transform = getTransformHandler(rewritePlugin)

    await transform?.call(rewritePlugin, '@import "tailwindcss";\n@source inline("w-4");', entry)
    await transform?.call(rewritePlugin, '@import "tailwindcss";\n@source inline("h-4");', entry)

    expect(context.tailwindcss?.v4?.cssSources).toEqual([
      {
        file: entry,
        base: path.dirname(entry),
        css: '@import "tailwindcss";\n@source inline("h-4");',
        dependencies: [],
      },
    ])
    expect(refreshTailwindcssRuntime).toHaveBeenCalledTimes(2)
  })

  it('normalizes replayed vite css asset output file names', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-replay-'))
    createdDirs.push(root)
    expect(resolveReplayCssOutputFile(root, path.join(root, 'sub-independent', 'pages', 'index.css'))).toBe('sub-independent/pages/index.css')
    expect(resolveReplayCssOutputFile(root, '/private/tmp/elsewhere/index.css')).toBe('index.css')
    expect(resolveReplayCssOutputFileFromSourceRoot(root, path.join(root, 'miniprogram/app.scss'), 'miniprogram')).toBe('app.scss')
    expect(resolveReplayCssOutputFileFromSourceRoot(root, 'miniprogram/sub-independent/pages/index.scss', './miniprogram')).toBe('sub-independent/pages/index.scss')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'miniprogram/sub-independent/pages/index.scss'),
      createContext() as any,
      root,
      false,
      false,
      'miniprogram',
      '.wxss',
    )).toBe('sub-independent/pages/index.wxss')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'miniprogram/pages/index.scss'),
      createContext() as any,
      root,
      false,
      false,
      'miniprogram',
      '.acss',
    )).toBe('pages/index.acss')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'miniprogram/pages/index.scss'),
      createContext() as any,
      root,
      false,
      false,
      'miniprogram',
      '.ttss',
    )).toBe('pages/index.ttss')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'miniprogram/pages/index.scss'),
      createContext() as any,
      root,
      false,
      false,
      'miniprogram',
    )).toBe('pages/index.css')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'miniprogram/sub-independent/pages/index.css'),
      createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
      }) as any,
      root,
      false,
      false,
      'miniprogram',
      undefined,
      [
        'sub-independent/pages/index.wxss',
        'sub-normal/pages/index.wxss',
      ],
    )).toBe('sub-independent/pages/index.wxss')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'miniprogram/sub-normal/pages/index.css'),
      createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
      }) as any,
      root,
      false,
      false,
      'miniprogram',
      undefined,
      [
        'sub-independent/pages/index.wxss',
        'sub-normal/pages/index.wxss',
      ],
    )).toBe('sub-normal/pages/index.wxss')
    expect(resolveViteCssPipelineOutputFileFromSourceFile(
      path.join(root, 'src/sub-independent/pages/index.css'),
      createContext({
        cssMatcher: (file: string) => file.endsWith('.acss'),
      }) as any,
      root,
      false,
      false,
      undefined,
      '.css',
      [
        'sub-independent/pages/index.acss',
        'sub-independent/pages/index.css',
        'sub-normal/pages/index.acss',
        'sub-normal/pages/index.css',
      ],
    )).toBe('sub-independent/pages/index.acss')
    expect(resolveMiniProgramStyleOutputExtension({
      cssMatcher: file => file.endsWith('.acss') || file.endsWith('.ttss') || file.endsWith('.mss'),
      files: ['app.acss', 'pages/index/index.acss'],
    })).toBe('.acss')
    expect(resolveMiniProgramStyleOutputExtension({
      cssMatcher: file => file.endsWith('.acss') || file.endsWith('.ttss') || file.endsWith('.mss'),
      files: ['app.acss', 'pages/index/index.ttss'],
      stem: 'pages/index/index',
    })).toBe('.ttss')
    expect(resolveMiniProgramStyleOutputExtension({
      cssMatcher: file => file.endsWith('.acss') || file.endsWith('.ttss') || file.endsWith('.mss'),
      files: ['app.mss', 'pages/index/index.mss'],
    })).toBe('.mss')
    expect(resolveMiniProgramStyleOutputExtension({
      cssMatcher: file => file.endsWith('.acss') || file.endsWith('.ttss') || file.endsWith('.mss'),
      files: ['app.acss', 'pages/index/index.ttss'],
    })).toBe('.css')
  }, TEST_TIMEOUT_MS)

  it('keeps css extension for uni-app x native app vite css pipeline output', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-app-css-output-'))
    createdDirs.push(root)

    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'unpackage/dist/dev/.uvue/app-android/main.css'),
      createContext() as any,
      root,
      false,
      true,
    )).toBe('unpackage/dist/dev/.uvue/app-android/main.css')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'unpackage/dist/dev/mp-weixin/main.css'),
      createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
      }) as any,
      root,
      false,
      false,
    )).toBe('unpackage/dist/dev/mp-weixin/main.css')
    expect(resolveViteCssPipelineOutputFile(
      path.join(root, 'unpackage/dist/dev/mp-weixin/main.css'),
      createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
      }) as any,
      root,
      false,
      false,
      undefined,
      undefined,
      ['unpackage/dist/dev/mp-weixin/main.wxss'],
    )).toBe('unpackage/dist/dev/mp-weixin/main.wxss')
  }, TEST_TIMEOUT_MS)

  it('matches remembered same-name subpackage css sources by the most specific path', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-remembered-css-'))
    createdDirs.push(root)
    const sources = new Map([
      ['sub-independent/pages/index.wxss', {
        outputFile: 'sub-independent/pages/index.wxss',
        rawSource: 'independent',
        sourceFile: path.join(root, 'src/sub-independent/pages/index.scss'),
      }],
      ['sub-normal/pages/index.wxss', {
        outputFile: 'sub-normal/pages/index.wxss',
        rawSource: 'normal',
        sourceFile: path.join(root, 'src/sub-normal/pages/index.scss'),
      }],
    ])

    const normal = resolveRememberedCssSourceForTest(
      sources,
      'sub-normal/pages/index.wxss',
      'sub-normal/pages/index.wxss',
      createRollupAsset('') as OutputAsset,
      path.join(root, 'dist/build/mp-weixin'),
      root,
    )
    const independent = resolveRememberedCssSourceForTest(
      sources,
      'sub-independent/pages/index.wxss',
      'sub-independent/pages/index.wxss',
      createRollupAsset('') as OutputAsset,
      path.join(root, 'dist/build/mp-weixin'),
      root,
    )

    expect(normal?.rawSource).toBe('normal')
    expect(independent?.rawSource).toBe('independent')
  }, TEST_TIMEOUT_MS)

  it('normalizes remembered css replay groups to existing mini-program style outputs', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-remembered-replay-'))
    createdDirs.push(root)
    const groups = collectRememberedCssReplayGroups(
      new Map([
        ['app.css', {
          outputFile: 'app.css',
          rawSource: '@tailwind utilities;',
          sourceFile: path.join(root, 'src/app.css'),
        }],
        ['sub-independent/pages/index.css', {
          outputFile: 'sub-independent/pages/index.css',
          rawSource: '@tailwind utilities;',
          sourceFile: path.join(root, 'src/sub-independent/pages/index.css'),
        }],
      ]),
      createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
      }) as any,
      root,
      false,
      false,
      'src',
      undefined,
      [
        'app.wxss',
        'sub-independent/pages/index.wxss',
      ],
    )

    expect([...groups.keys()].sort()).toEqual([
      'app.wxss',
      'sub-independent/pages/index.wxss',
    ])
    expect([...groups.keys()].some(file => file.endsWith('.css'))).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('matches empty emitted style assets back to remembered Tailwind css sources', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-remembered-tailwind-css-'))
    createdDirs.push(root)
    const sources = new Map([
      ['sub-independent/pages/index.wxss', {
        outputFile: 'sub-independent/pages/index.wxss',
        rawSource: '@import "tailwindcss" source(none);\n@config "../../tailwind.config.sub-independent.js";',
        sourceFile: path.join(root, 'sub-independent/pages/index.css'),
      }],
      ['sub-normal/pages/index.wxss', {
        outputFile: 'sub-normal/pages/index.wxss',
        rawSource: '@import "tailwindcss" source(none);\n@config "../../tailwind.config.sub-normal.js";',
        sourceFile: path.join(root, 'sub-normal/pages/index.css'),
      }],
    ])

    const independent = resolveRememberedCssSourceForTest(
      sources,
      'sub-independent/pages/index.wxss',
      'sub-independent/pages/index.wxss',
      createRollupAsset('') as OutputAsset,
      path.join(root, 'dist'),
      root,
    )

    expect(independent?.rawSource).toContain('tailwind.config.sub-independent.js')
    expect(independent?.rawSource).not.toContain('tailwind.config.sub-normal.js')
  }, TEST_TIMEOUT_MS)

  it('intersects broad Tailwind v4 config entries with subpackage output scope', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-subpackage-scope-'))
    createdDirs.push(root)
    const sourceRoot = path.join(root, 'miniprogram')
    const broadEntries = [{
      base: root,
      negated: false,
      pattern: './miniprogram/**/*.{wxml,ts}',
    }]
    const getSourceCandidatesForEntries = vi.fn((entries) => {
      const pattern = entries?.[0]?.pattern
      if (pattern === 'sub-independent/**/*') {
        return new Set(['bg-independent-subpackage-marker'])
      }
      return new Set([
        'text-red-500',
        'bg-normal-subpackage-marker',
        'bg-independent-subpackage-marker',
      ])
    })
    const getSourceCandidateSourcesForEntries = vi.fn((entries) => {
      const candidates = getSourceCandidatesForEntries(entries)
      return new Map([...candidates].map(candidate => [candidate, new Set([candidate])]))
    })
    const scope = createSubpackageSourceCandidateScope({
      getSourceCandidatesForEntries,
      getSourceCandidateSourcesForEntries,
      rootDir: root,
      snapshot: { entries: [] } as any,
      sourceRoot,
      subpackageRoots: new Set(['sub-independent']),
      useIncrementalMode: false,
    })

    const scopedGetter = scope.createScopedSourceCandidateGetter('sub-independent/pages/index.wxss', { isMainChunk: false })
    const scopedSourceGetter = scope.createScopedSourceCandidateSourceGetter('sub-independent/pages/index.wxss', { isMainChunk: false })

    expect(scopedGetter?.(broadEntries)).toEqual(new Set(['bg-independent-subpackage-marker']))
    expect([...(scopedSourceGetter?.(broadEntries).keys() ?? [])]).toEqual(['bg-independent-subpackage-marker'])
  }, TEST_TIMEOUT_MS)

  it('infers subpackage source scope from configured Tailwind v4 css source files', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-subpackage-css-source-scope-'))
    createdDirs.push(root)
    const sourceRoot = path.join(root, 'src')
    const normalCssFile = path.join(sourceRoot, 'sub-normal/pages/index.css')
    const independentCssFile = path.join(sourceRoot, 'sub-independent/pages/index.css')
    const broadEntries = [{
      base: path.join(sourceRoot, 'sub-independent'),
      negated: false,
      pattern: '**/*.{css,ts,tsx,jsx,js,html}',
    }]
    const candidatesByFile = new Map([
      [path.join(sourceRoot, 'sub-normal/pages/index.tsx'), new Set(['bg-normal-subpackage-marker'])],
      [path.join(sourceRoot, 'sub-independent/pages/index.tsx'), new Set(['bg-independent-subpackage-marker'])],
    ])
    const getSourceCandidateSourcesForEntries = vi.fn((entries) => {
      const sources = new Map<string, Set<string>>()
      for (const [file, candidates] of candidatesByFile) {
        const matched = entries === undefined
          || entries.length === 0
          || isFileMatchedByTailwindSourceEntries(file, entries)
        if (!matched) {
          continue
        }
        for (const candidate of candidates) {
          sources.set(candidate, new Set([file]))
        }
      }
      return sources
    })
    const getSourceCandidatesForEntries = vi.fn((entries) => new Set(getSourceCandidateSourcesForEntries(entries).keys()))
    const scope = createSubpackageSourceCandidateScope({
      cssSourceFiles: [normalCssFile, independentCssFile],
      getSourceCandidatesForEntries,
      getSourceCandidateSourcesForEntries,
      rootDir: root,
      snapshot: { entries: [] } as any,
      subpackageRoots: new Set(['sub-normal', 'sub-independent']),
      useIncrementalMode: false,
    })

    const scopedGetter = scope.createScopedSourceCandidateGetter('sub-independent/pages/index.acss', { isMainChunk: false })
    const scopedSourceGetter = scope.createScopedSourceCandidateSourceGetter('sub-independent/pages/index.acss', { isMainChunk: false })

    expect(scopedGetter?.(broadEntries)).toEqual(new Set(['bg-independent-subpackage-marker']))
    expect([...(scopedSourceGetter?.(broadEntries).keys() ?? [])]).toEqual(['bg-independent-subpackage-marker'])
  }, TEST_TIMEOUT_MS)

  it('matches empty emitted style assets back to configured Tailwind v4 css sources', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-configured-tailwind-css-'))
    createdDirs.push(root)
    const entries = collectConfiguredTailwindV4CssSourceEntries(createContext({
      tailwindcss: {
        v4: {
          cssSources: [
            {
              file: path.join(root, 'src/sub-independent/pages/index.css'),
              css: '@import "tailwindcss" source(none);\n@config "../../tailwind.config.sub-independent.js";',
            },
            {
              file: path.join(root, 'src/sub-normal/pages/index.css'),
              css: '@import "tailwindcss" source(none);\n@config "../../tailwind.config.sub-normal.js";',
            },
          ],
        },
      },
    }) as any, root)
    const independent = resolveSourceStyleSourceFromOutputFile(
      'sub-independent/pages/index.wxss',
      { entries: [] } as any,
      path.join(root, 'dist'),
      root,
      undefined,
      undefined,
      entries.map(entry => [entry.file, entry.source] as [string, string]),
      () => {},
    )

    expect(independent?.rawSource).toContain('tailwind.config.sub-independent.js')
    expect(independent?.rawSource).not.toContain('tailwind.config.sub-normal.js')
  }, TEST_TIMEOUT_MS)

  it('does not infer Tailwind v4 root css from Vue SFC style blocks', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-sfc-root-css-'))
    createdDirs.push(root)
    const sourceFile = path.join(root, 'src/pages/index/index.vue')
    const outputRoot = path.join(root, 'dist')
    const snapshot = {
      entries: [
        {
          type: 'js',
          file: 'pages/index/index.js',
          output: {
            ...createRollupChunk(''),
            fileName: 'pages/index/index.js',
            facadeModuleId: sourceFile,
            moduleIds: [sourceFile],
          },
        },
      ],
    } as any

    const matched = await resolveSfcStyleSourceFromOutputFile(
      'pages/index/index.wxss',
      snapshot,
      outputRoot,
      path.join(root, 'src'),
      file => file.endsWith('.wxss'),
      file => file === sourceFile
        ? '<template><view class="text-red-500" /></template><style>@import "tailwindcss";</style>'
        : undefined,
      () => {},
    )

    expect(matched).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('does not infer Tailwind v4 root css from preprocessor source styles', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-scss-root-css-'))
    createdDirs.push(root)
    const sourceFile = path.join(root, 'src/app.scss')

    const matched = resolveSourceStyleSourceFromOutputFile(
      'app.wxss',
      { entries: [] } as any,
      path.join(root, 'dist'),
      path.join(root, 'src'),
      file => file === sourceFile ? '$color: red;\n@import "tailwindcss";\n.app { color: $color; }' : undefined,
      () => [[sourceFile, '$color: red;\n@import "tailwindcss";\n.app { color: $color; }']],
      undefined,
      () => {},
    )

    expect(matched).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('does not match basename-only remembered subpackage css sources to root page css', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-remembered-css-root-page-'))
    createdDirs.push(root)
    const sources = new Map([
      ['src/sub-normal/pages/index.wxss', {
        outputFile: 'src/sub-normal/pages/index.wxss',
        rawSource: 'subpackage',
        sourceFile: path.join(root, 'src/sub-normal/pages/index.scss'),
      }],
    ])

    const matched = resolveRememberedCssSourceForTest(
      sources,
      'pages/index/index.wxss',
      'pages/index/index.wxss',
      createRollupAsset('') as OutputAsset,
      path.join(root, 'dist/dev/mp-weixin'),
      root,
    )

    expect(matched).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('does not match app-origin remembered css source to app main css', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-remembered-app-origin-'))
    createdDirs.push(root)
    const sources = new Map([
      ['app-origin.wxss', {
        outputFile: 'app-origin.wxss',
        rawSource: 'app-origin',
        sourceFile: path.join(root, 'src/app.css'),
      }],
    ])

    const matched = resolveRememberedCssSourceForTest(
      sources,
      'app.wxss',
      'app.wxss',
      createRollupAsset('') as OutputAsset,
      path.join(root, 'dist'),
      root,
    )

    expect(matched).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('injects vite postcss-processed generated css assets into the main mini-program css asset', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
	    setCurrentContext(createContext({
	      cssMatcher: (file: string) => file.endsWith('.wxss'),
	      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss' || file === 'src/main.css'),
	      tailwindRuntime: {
	        majorVersion: 4,
	      },
	      styleHandler: vi.fn(async (code: string) => ({
	        css: code,
        map: {
          toJSON: () => ({
            version: 3,
            file: 'style.css',
            sources: ['style.css'],
            names: [],
            mappings: '',
            sourcesContent: [code],
          }),
        },
      })),
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const processedCss = [
      '.flex{display:-webkit-flex;display:flex}',
      '.bg-clip-text{-webkit-background-clip:text;background-clip:text}',
    ].join('\n')
    const bundle = {
      'app.wxss': {
        ...createRollupAsset('.app{color:red}'),
        fileName: 'app.wxss',
      },
      'src/main.css': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.resolve(process.cwd(), 'src/main.css'))}\n${processedCss}`),
        fileName: 'src/main.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['src/main.css'] as OutputAsset).source).toBe('')
    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain('view,text,::after,::before')
    expect(appCss).toContain('.app{color:red}')
    expect(appCss).toContain(processedCss)
  }, TEST_TIMEOUT_MS)

  it('normalizes source-root prefixed vite css pipeline assets from bundle graph modules', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-source-root-graph-'))
    createdDirs.push(root)
    await mkdir(path.join(root, 'src/pages/index'), { recursive: true })
    await writeFile(path.join(root, 'src/pages/index/index.tsx'), 'export default {}', 'utf8')
    await writeFile(path.join(root, 'src/app.css'), '@import "tailwindcss";', 'utf8')

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
	    setCurrentContext(createContext({
	      cssMatcher: (file: string) => file.endsWith('.wxss'),
	      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
	      tailwindRuntime: {
	        majorVersion: 4,
	      },
	      styleHandler: vi.fn(async (code: string) => ({ css: code })),
	    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const processedCss = '.graph-source-root{}'
    const bundle = {
      'pages/index/index.js': {
        ...createRollupChunk(''),
        fileName: 'pages/index/index.js',
        moduleIds: [path.join(root, 'src/pages/index/index.tsx')],
      },
      'src/app.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'src/app.css'))}\n${processedCss}`),
        fileName: 'src/app.wxss',
        originalFileNames: [path.join(root, 'src/app.css')],
      },
      'app.wxss': {
        ...createRollupAsset('.app{}'),
        fileName: 'app.wxss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain('view,text,::after,::before')
    expect(appCss).toContain('.app{}')
    expect(appCss).toContain(processedCss)
  }, TEST_TIMEOUT_MS)

  it('keeps uni-app x native app vite css pipeline output as main.css during bundle processing', async () => {
    const previousUtsPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-android'
    try {
      mockTailwindV4GeneratorCss('.bg-_b_h102938_B{background-color:#102938}')
      const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-app-android-css-'))
      createdDirs.push(root)
      const cssFile = path.join(root, 'main.css')
      const rawCss = '@import "tailwindcss" source(none);\n@source "./pages/**/*.{uts,uvue}";'
      await writeFile(cssFile, rawCss, 'utf8')
      const runtimeSet = new Set(['bg-[#102938]'])
      setCurrentContext(createContext({
        appType: 'uni-app-x',
        cssMatcher: (file: string) => file.endsWith('.css'),
        generator: {
          target: 'weapp',
        },
        mainCssChunkMatcher: vi.fn((file: string) => file === 'main.css'),
        styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
        tailwindcss: {
          v4: {
            cssEntries: [cssFile],
          },
        },
        tailwindRuntime: {
          getClassSet: vi.fn(async () => runtimeSet),
          getClassSetSync: vi.fn(() => runtimeSet),
          majorVersion: 4,
          extract: vi.fn(async () => ({ classSet: runtimeSet })),
        },
        uniAppX: false,
      }))

      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()
      const servePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      expect(servePlugin).toBeTruthy()
      expect(postPlugin).toBeTruthy()

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'serve',
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'unpackage/dist/dev/.uvue/app-android' },
      } as ResolvedConfig)

      const outputFile = 'main.css'
      const transform = getTransformHandler(servePlugin)
      const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
      const transformed = await transform?.call({
        ...servePlugin,
        addWatchFile: vi.fn(),
        emitFile(file: { type: 'asset', fileName: string, source: string }) {
          emitted.push(file)
          return file.fileName
        },
      }, rawCss, cssFile)
      const transformedCss = typeof transformed === 'object' && transformed != null && 'code' in transformed
        ? transformed.code
        : String(transformed ?? rawCss)
      const bundle = {
        [outputFile]: {
          ...createRollupAsset(transformedCss),
          fileName: outputFile,
        },
      }
      const generateBundle = getGenerateBundleHandler(postPlugin)
      await generateBundle?.call({ ...postPlugin, addWatchFile: vi.fn() }, {} as any, bundle)

      expect(bundle['main.wxss']).toBeUndefined()
      expect(bundle[outputFile]).toBeDefined()
      expect((bundle[outputFile] as OutputAsset).fileName).toBe(outputFile)
      expect(emitted.find(file => file.fileName === outputFile)?.source).toContain('.bg-_b_h102938_B')
    }
    finally {
      if (previousUtsPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = previousUtsPlatform
      }
    }
  }, TEST_TIMEOUT_MS)

  it('injects harmony page chunk styles from HBuilderX app-harmony main.css bundle output', async () => {
    const previousUtsPlatform = process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_UTS_PLATFORM
    try {
      const generateMock = vi.fn(async (_options: { candidates: Set<string> }, source: { css: string }) => {
        const isHarmonyApplySource = source.css.includes('.wtu-1k0qd6d-4')
        const css = isHarmonyApplySource
          ? [
              '.bg-_b_h102938_B { background-color: rgba(16,41,56,1); }',
              '.text-_b_hf7fbff_B { color: rgba(247,251,255,1); }',
              '.w-_b173px_B { width: 173px; }',
              '.wtu-1k0qd6d-4 { background-color: rgba(16,41,56,1); }',
              '.wtu-e9q3ep-5 { color: rgba(247,251,255,1); }',
              '.wtu-hufz3g-6 { width: 173px; }',
            ].join('\n')
          : [
              '.flex { display: flex; }',
              '.text-white { --tw-text-opacity: 1; color: rgba(255,255,255,1); }',
            ].join('\n')
        return {
          css,
          rawCss: css,
          target: 'weapp',
          classSet: new Set(_options.candidates),
          dependencies: [],
          sources: [],
          root: null,
          version: 4,
        }
      })
      vi.doMock('@/generator', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/generator')>()
        return {
          ...actual,
          createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
            generate: vi.fn((options: { candidates: Set<string> }) => generateMock(options, source)),
          })),
          normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
          resolveTailwindV4Source: vi.fn(async (options: any) => ({
            version: 4,
            projectRoot: process.cwd(),
            base: process.cwd(),
            baseFallbacks: [],
            css: options.css,
            dependencies: [],
          })),
          resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
            version: 4,
            projectRoot: process.cwd(),
            base: process.cwd(),
            baseFallbacks: [],
            css: '@import "tailwindcss" source(none);',
            dependencies: [],
          })),
          resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
            version: 4,
            projectRoot: process.cwd(),
            base: process.cwd(),
            baseFallbacks: [],
          })),
        }
      })
      const runtimeSet = new Set(['flex', 'text-white', 'bg-[#102938]', 'text-[#f7fbff]', 'w-[173px]'])
      setCurrentContext(createContext({
        appType: 'uni-app-x',
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        generator: {
          target: 'weapp',
        },
        jsHandler: vi.fn((code: string) => ({ code })),
        mainCssChunkMatcher: vi.fn((file: string) => file === 'main.css'),
        styleHandler: vi.fn(async (code: string) => ({
          css: code,
          map: {
            toJSON: () => ({
              version: 3,
              file: '',
              sources: [],
              sourcesContent: [],
              names: [],
              mappings: '',
            }),
          },
        })),
        tailwindRuntime: {
          getClassSet: vi.fn(async () => runtimeSet),
          getClassSetSync: vi.fn(() => runtimeSet),
          majorVersion: 4,
          extract: vi.fn(async () => ({ classSet: runtimeSet })),
        },
        uniAppX: true,
      }))

      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()
      const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      expect(sourcePlugin).toBeTruthy()
      expect(postPlugin).toBeTruthy()

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'build',
        root: process.cwd(),
        css: { postcss: { plugins: [] } },
        build: { outDir: 'unpackage/dist/dev/.app-harmony' },
      } as ResolvedConfig)

      const bundle = {
        'assets/App.js': {
          ...createRollupChunk('const _style_0 = {};'),
          fileName: 'assets/App.js',
        },
        'assets/pages/index/index.js': {
          ...createRollupChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "flex text-white wtu-1k0qd6d-4 wtu-e9q3ep-5 wtu-hufz3g-6" }, "hbuilderx-app-dynamic-v4-harmony")}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
          fileName: 'assets/pages/index/index.js',
        },
        'assets/pages/index/index.js.map': {
          ...createRollupAsset(JSON.stringify({
            sourcesContent: [
              '<template><view class="wtu-1k0qd6d-4 wtu-e9q3ep-5 wtu-hufz3g-6" /></template>\n<style scoped>\n.wtu-1k0qd6d-4 {\n  @apply bg-[#102938];\n}\n.wtu-e9q3ep-5 {\n  @apply text-[#f7fbff];\n}\n.wtu-hufz3g-6 {\n  @apply w-[173px];\n}\n</style>',
            ],
          })),
          fileName: 'assets/pages/index/index.js.map',
        },
        'import/app-service.ets': {
          ...createRollupAsset(''),
          fileName: 'import/app-service.ets',
        },
        'main.css': {
          ...createRollupAsset('export default {"container":{"":{"width":"100%"}}}'),
          fileName: 'main.css',
        },
        'app.wxss': {
          ...createRollupAsset([
            '.flex { display: flex; }',
            '.text-white { --tw-text-opacity: 1; color: rgba(255,255,255,1); }',
          ].join('\n')),
          fileName: 'app.wxss',
        },
        'uni_modules/oh-package.json5': {
          ...createRollupAsset('{}'),
          fileName: 'uni_modules/oh-package.json5',
        },
      }
      const generateBundle = getGenerateBundleHandler(postPlugin)
      await generateBundle?.call({ ...postPlugin, addWatchFile: vi.fn() }, {} as any, bundle)

      const pageCode = (bundle['assets/pages/index/index.js'] as OutputChunk).code
      expect(bundle['main.wxss']).toBeUndefined()
      expect((bundle['main.css'] as OutputAsset).source.toString()).toContain('.flex')
      expect(pageCode).toContain('"flex":{"":{"display":"flex"}}')
      expect(pageCode).toContain('"text-white":{"":{"-TwTextOpacity":"1"')
      expect(pageCode).toContain('"wtu-1k0qd6d-4":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
      expect(pageCode).toContain('"wtu-e9q3ep-5":{"":{"color":"rgba(247,251,255,1)"}}')
      expect(pageCode).toContain('"wtu-hufz3g-6":{"":{"width":173}}')
    }
    finally {
      if (previousUtsPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = previousUtsPlatform
      }
    }
  }, TEST_TIMEOUT_MS)

  it('generates uni-app x harmony inline apply styles during transform', async () => {
    const previousUtsPlatform = process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_UTS_PLATFORM
    try {
      const generateMock = vi.fn(async () => {
        const css = '.wtu-a { background-color: rgba(16,41,56,1); }'
        return {
          css,
          rawCss: css,
          target: 'weapp',
          classSet: new Set(['bg-[#102938]']),
          dependencies: [],
          sources: [],
          root: null,
          version: 4,
        }
      })
      vi.doMock('@/generator', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/generator')>()
        return {
          ...actual,
          createWeappTailwindcssGenerator: vi.fn(() => ({
            generate: generateMock,
          })),
          normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
          resolveTailwindV4Source: vi.fn(async (options: any) => ({
            version: 4,
            projectRoot: process.cwd(),
            base: options.base ?? process.cwd(),
            baseFallbacks: [],
            css: options.css,
            dependencies: [],
          })),
          resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
            version: 4,
            projectRoot: process.cwd(),
            base: process.cwd(),
            baseFallbacks: [],
            css: '@import "tailwindcss" source(none);',
            dependencies: [],
          })),
          resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
            version: 4,
            projectRoot: process.cwd(),
            base: process.cwd(),
            baseFallbacks: [],
          })),
        }
      })
      const runtimeSet = new Set(['bg-[#102938]'])
      setCurrentContext(createContext({
        appType: 'uni-app-x',
        cssMatcher: (file: string) => file.endsWith('.css'),
        generator: {
          target: 'weapp',
        },
        mainCssChunkMatcher: vi.fn((file: string) => file === 'main.css'),
        styleHandler: vi.fn(async (code: string) => ({
          css: code,
          map: {
            toJSON: () => ({
              version: 3,
              file: '',
              sources: [],
              sourcesContent: [],
              names: [],
              mappings: '',
            }),
          },
        })),
        tailwindRuntime: {
          getClassSet: vi.fn(async () => runtimeSet),
          getClassSetSync: vi.fn(() => runtimeSet),
          majorVersion: 4,
          extract: vi.fn(async () => ({ classSet: runtimeSet })),
        },
        uniAppX: true,
      }))

      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()
      const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      const uniAppXCssPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css') as Plugin
      expect(sourcePlugin).toBeTruthy()
      expect(postPlugin).toBeTruthy()
      expect(uniAppXCssPlugin).toBeTruthy()

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'build',
        root: process.cwd(),
        css: { postcss: { plugins: [] } },
        build: { outDir: 'unpackage/dist/dev/.app-harmony' },
      } as ResolvedConfig)
      await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

      const result = await getTransformHandler(uniAppXCssPlugin)?.call(
        { addWatchFile: vi.fn() },
        '.wtu-a { @apply bg-[#102938]; }',
        '/project/pages/index/index.uvue?vue&type=style&index=1&inline&lang.css',
      )

      expect(result?.code).toContain('.wtu-a')
      expect(result?.code).toContain('background-color: rgba(16,41,56,1)')
      expect(generateMock).toHaveBeenCalled()
    }
    finally {
      if (previousUtsPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = previousUtsPlatform
      }
    }
  }, TEST_TIMEOUT_MS)

  it('replays remembered uni-app x native app main.css through bundle assets on initial app builds', async () => {
    const previousUtsPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-android'
    try {
      mockTailwindV4GeneratorCss('.bg-_b_h102938_B{background-color:#102938}')
      const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-app-android-replay-css-'))
      createdDirs.push(root)
      const cssFile = path.join(root, 'main.css')
      const rawCss = '@import "tailwindcss" source(none);\n@source "./pages/**/*.{uts,uvue}";'
      await writeFile(cssFile, rawCss, 'utf8')
      const runtimeSet = new Set(['bg-[#102938]'])
      setCurrentContext(createContext({
        appType: 'uni-app-x',
        cssMatcher: (file: string) => file.endsWith('.css'),
        generator: {
          target: 'weapp',
        },
        mainCssChunkMatcher: vi.fn((file: string) => file === 'main.css'),
        styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
        tailwindcss: {
          v4: {
            cssEntries: [cssFile],
          },
        },
        tailwindRuntime: {
          getClassSet: vi.fn(async () => runtimeSet),
          getClassSetSync: vi.fn(() => runtimeSet),
          majorVersion: 4,
          extract: vi.fn(async () => ({ classSet: runtimeSet })),
        },
        uniAppX: false,
      }))

      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()
      const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      expect(sourcePlugin).toBeTruthy()
      expect(postPlugin).toBeTruthy()

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'build',
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'unpackage/dist/dev/.uvue/app-android' },
      } as ResolvedConfig)
      await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

      const outputFile = 'main.css'
      const generateBundle = getGenerateBundleHandler(postPlugin)
      const firstBundle = {
        'main.css': {
          ...createRollupAsset(rawCss),
          fileName: 'main.css',
          originalFileNames: [cssFile],
        },
        'main.uts': {
          ...createRollupChunk('import "./main.css";'),
          fileName: 'main.uts',
        },
      }
      await generateBundle?.call({ ...postPlugin, addWatchFile: vi.fn() }, {} as any, firstBundle)

      const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
      const bundle = {
        'main.uts': {
          ...createRollupChunk('import "./main.css";'),
          fileName: 'main.uts',
        },
      }
      await generateBundle?.call({
        ...postPlugin,
        addWatchFile: vi.fn(),
        emitFile(file: { type: 'asset', fileName: string, source: string }) {
          emitted.push(file)
          return file.fileName
        },
      }, {} as any, bundle)

      expect(bundle['main.wxss']).toBeUndefined()
      expect(bundle[outputFile]).toBeUndefined()
      expect(emitted.find(file => file.fileName === outputFile)?.source).toContain('.bg-_b_h102938_B')
    }
    finally {
      if (previousUtsPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = previousUtsPlatform
      }
    }
  }, TEST_TIMEOUT_MS)

  it('does not regenerate collected vite-processed css assets in the same bundle pass', async () => {
    const generateMock = vi.fn(async () => ({
      css: '.unexpected{}',
      rawCss: '.unexpected{}',
      target: 'weapp',
      classSet: new Set(['unexpected']),
      dependencies: [],
      sources: [],
      root: null,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file.endsWith('index.wxss')),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['unexpected'])),
        getClassSetSync: vi.fn(() => new Set(['unexpected'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['unexpected']) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const processedCss = '.independent-only{}'
    const bundle = {
      'sub-independent/pages/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.resolve(process.cwd(), 'sub-independent/pages/index.css'))}\n${processedCss}`),
        fileName: 'sub-independent/pages/index.wxss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['sub-independent/pages/index.wxss'] as OutputAsset).source).toBe(processedCss)
    expect(generateMock).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('records repeated remembered css sources without looping over touched map entries', async () => {
    const generateMock = vi.fn(async (source: { css: string }) => ({
      css: source.css,
      rawCss: source.css,
      target: 'weapp',
      classSet: new Set<string>(),
      rawCandidates: new Set<string>(),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
          generate: vi.fn(async () => generateMock(source)),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-remember-loop-'))
    createdDirs.push(root)
    const sourceFile = path.join(root, 'pages/index/index.scss')
    const sourceCss = '@tailwind utilities;\n.text-red-500{}'

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(rewritePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(rewritePlugin)
    await transform?.call(rewritePlugin, sourceCss, `${sourceFile}?direct`)
    await transform?.call(rewritePlugin, sourceCss, sourceFile)

    const bundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(sourceCss),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [sourceFile],
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(generateMock).toHaveBeenCalled()
    expect((bundle['pages/index/index.wxss'] as OutputAsset).source.toString()).toContain('.text-red-500')
  }, TEST_TIMEOUT_MS)

  it('refreshes remembered source style files from disk before bundle replay when cache is missing', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-css-memory-refresh-'))
    createdDirs.push(root)
    const sourceFile = path.join(root, 'src/tailwind.scss')
    const oldSource = '.old-style { @apply block; }'
    const currentSource = '.tw-watch-style-case { @apply font-bold; }'
    await mkdir(path.dirname(sourceFile), { recursive: true })
    await writeFile(sourceFile, oldSource, 'utf8')
    const cssMemory = createViteCssMemory({
      debug: vi.fn(),
      getSourceCandidateSource: () => undefined,
    })
    const remembered = {
      outputFile: 'app.wxss',
      rawSource: oldSource,
      sourceFile,
    }
    cssMemory.rememberCssSource(remembered)
    await writeFile(sourceFile, currentSource, 'utf8')

    const refreshed = await cssMemory.refreshRememberedCssSource(remembered)

    expect(refreshed?.rawSource).toBe(currentSource)
    expect(refreshed?.sourceFile).toBe(sourceFile)
  })

  it('does not reuse a mismatched vite-generated app css marker for page css assets', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-page-css-marker-'))
    createdDirs.push(root)
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['text-red-500'])),
        getClassSetSync: vi.fn(() => new Set(['text-red-500'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['text-red-500']) })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await mkdir(path.join(root, 'src'), { recursive: true })
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      weapp: { srcRoot: 'src' },
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/build/mp-weixin' },
    } as ResolvedConfig)

    const appSourceFile = path.join(root, 'src/tailwind.scss')
    const bundle = {
      'app.wxss': {
        ...createRollupAsset('.app-global-only{color:red}'),
        fileName: 'app.wxss',
      },
      'pages/index/peer.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', appSourceFile)}
.app-global-only{color:red}
.peer-local-only{color:blue}`),
        fileName: 'pages/index/peer.wxss',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)

    await generateBundle?.call(postPlugin, {} as any, bundle)

    const peerCss = String((bundle['pages/index/peer.wxss'] as OutputAsset).source)
    expect(peerCss).not.toContain('.app-global-only')
    expect(peerCss).toContain('.peer-local-only')
  }, TEST_TIMEOUT_MS)

  it('keeps subpackage css assets even when app.wxss contains the same rules', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-subpackage-root-covered-'))
    createdDirs.push(root)
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['module-a-marker'])),
        getClassSetSync: vi.fn(() => new Set(['module-a-marker'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['module-a-marker']) })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/build/mp-weixin' },
    } as ResolvedConfig)

    const moduleCss = '.module-a-marker{color:red}'
    const bundle = {
      'app.json': {
        ...createRollupAsset(JSON.stringify({
          pages: ['pages/index/index'],
          subPackages: [
            {
              root: 'moduleA',
              pages: ['pages/index'],
            },
          ],
        })),
        fileName: 'app.json',
      },
      'app.wxss': {
        ...createRollupAsset(moduleCss),
        fileName: 'app.wxss',
      },
      'moduleA/pages/index.wxss': {
        ...createRollupAsset(moduleCss),
        fileName: 'moduleA/pages/index.wxss',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)

    await generateBundle?.call(postPlugin, {} as any, bundle)

    const subpackageCss = String((bundle['moduleA/pages/index.wxss'] as OutputAsset).source)
    expect(subpackageCss).toContain(moduleCss)
    expect(subpackageCss).not.toHaveLength(0)
  }, TEST_TIMEOUT_MS)

  it('does not treat non-root page css as main css when matcher is broad', async () => {
    const generateMock = vi.fn(async () => ({
      css: '.unexpected-global{}',
      rawCss: '.unexpected-global{}',
      target: 'weapp',
      classSet: new Set(['unexpected-global']),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file.endsWith('.wxss')),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['unexpected-global'])),
        getClassSetSync: vi.fn(() => new Set(['unexpected-global'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['unexpected-global']) })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
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
      'app.wxss': {
        ...createRollupAsset('@tailwind utilities;'),
        fileName: 'app.wxss',
      },
      'pages/index/peer.wxss': {
        ...createRollupAsset('.peer-local-only{color:red}'),
        fileName: 'pages/index/peer.wxss',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)

    await generateBundle?.call(postPlugin, {} as any, bundle)

    const peerCss = String((bundle['pages/index/peer.wxss'] as OutputAsset).source)
    expect(peerCss).toContain('.peer-local-only')
    expect(peerCss).not.toContain('.unexpected-global')
  }, TEST_TIMEOUT_MS)

  it('merges covered preflight declarations when injecting vite-processed css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })

    const preflightSelector = 'view,text,::after,::before'
    const baseCss = `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-ease:initial}`
    const processedCss = [
      `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-content:""}`,
      '.bg-app-marker{background-color:#2563eb}',
    ].join('\n')
    const bundle = {
      'app.wxss': {
        ...createRollupAsset(baseCss),
        fileName: 'app.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      [path.resolve('/project/src/app.css'), { css: processedCss, injectIntoMain: true }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })
    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()

    expect((appCss.match(/view,text,::after,::before/g) ?? [])).toHaveLength(1)
    expect(appCss).toContain('--tw-content:""')
    expect(appCss).toContain('.bg-app-marker')
  }, TEST_TIMEOUT_MS)

  it('keeps user declarations on covered preflight rules when injecting vite-processed css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })

    const preflightSelector = 'view,text,::after,::before'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset(`${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-rotate-x:;--tw-rotate-y:;}`),
        fileName: 'app.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      [path.resolve('/project/src/app.css'), {
        css: [
          `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--weapp-tw-native-view-regression:1;--weapp-tw-native-text-regression:1}`,
          '.weapp-tw-dynamic-regression{min-width:0}',
        ].join('\n'),
        injectIntoMain: true,
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })
    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()

    expect((appCss.match(/view,text,::after,::before/g) ?? [])).toHaveLength(1)
    expect(appCss).toContain('--tw-rotate-x:')
    expect(appCss).toContain('--weapp-tw-native-view-regression:1')
    expect(appCss).toContain('--weapp-tw-native-text-regression:1')
    expect(appCss).toContain('.weapp-tw-dynamic-regression')
  }, TEST_TIMEOUT_MS)

  it('keeps user-authored native element rules when removing imported vite-processed duplicates', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })

    const preflightSelector = 'view,text,::after,::before'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset([
          '@import "app-origin.wxss";',
          `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-rotate-x:;--tw-rotate-y:;}`,
          'view{box-sizing:border-box;--weapp-tw-native-view-regression:1}',
          'text{box-sizing:border-box;--weapp-tw-native-text-regression:1}',
          '.weapp-tw-dynamic-regression{min-width:0}',
        ].join('\n')),
        fileName: 'app.wxss',
      },
      'app-origin.wxss': {
        ...createRollupAsset([
          `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-rotate-x:;--tw-rotate-y:;}`,
          '.weapp-tw-dynamic-regression{min-width:0}',
        ].join('\n')),
        fileName: 'app-origin.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>([
      [path.resolve('/project/src/app.css'), {
        css: (bundle['app.wxss'] as OutputAsset).source.toString().replace('@import "app-origin.wxss";\n', ''),
        injectIntoMain: true,
        outputFile: 'app-origin.wxss',
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })
    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()

    expect(appCss).toContain('@import "app-origin.wxss";')
    expect(appCss).not.toContain('.weapp-tw-dynamic-regression')
    expect(appCss).toContain('--weapp-tw-native-view-regression:1')
    expect(appCss).toContain('--weapp-tw-native-text-regression:1')
  }, TEST_TIMEOUT_MS)

  it('dedupes mini-program preflight when replaying vite-processed css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const preflightSelector = 'view,text,::after,::before'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset([
          `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-font-weight:initial}`,
          '.app-main{}',
        ].join('\n')),
        fileName: 'app.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      ['pages/index/index.wxss', {
        css: [
          `${preflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid;--tw-font-weight:;--tw-content:""}`,
          '.page-only{}',
        ].join('\n'),
        injectIntoMain: true,
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect((appCss.match(/view,text,::after,::before/g) ?? [])).toHaveLength(1)
    expect(appCss).toContain('--tw-font-weight:initial')
    expect(appCss).toContain('--tw-content:""')
    expect(appCss).toContain('.page-only{}')
  })

  it('normalizes mini-program preflight selectors by AST when replaying vite-processed css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const basePreflightSelector = 'view, text, ::before, ::after'
    const processedPreflightSelector = 'text,view,:after,:before'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset([
          `${basePreflightSelector}{box-sizing:border-box;margin:0;padding:0;border:0 solid}`,
          '.app-main{}',
        ].join('\n')),
        fileName: 'app.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      ['pages/index/index.wxss', {
        css: [
          `${processedPreflightSelector}{--tw-content:"";--tw-shadow:0 0 #000000}`,
          '.page-only{}',
        ].join('\n'),
        injectIntoMain: true,
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain(basePreflightSelector)
    expect(appCss).not.toContain(processedPreflightSelector)
    expect(appCss).toContain('--tw-content:""')
    expect(appCss).toContain('--tw-shadow:0 0 #000000')
    expect(appCss).toContain('.page-only{}')
  })

  it('dedupes mini-program theme scope when replaying vite-processed css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const themeSelector = ':host,page,.tw-root,wx-root-portal-content'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset([
          `${themeSelector}{--up-main-color:#fff}`,
          '.app-main{}',
        ].join('\n')),
        fileName: 'app.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      ['pages/index/index.wxss', {
        css: [
          `${themeSelector}{--primary-color-hex:#4268ea}`,
          '.page-only{}',
        ].join('\n'),
        injectIntoMain: true,
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect((appCss.match(/:host,page,\.tw-root,wx-root-portal-content/g) ?? [])).toHaveLength(1)
    expect(appCss).toContain('--up-main-color:#fff')
    expect(appCss).toContain('--primary-color-hex:#4268ea')
    expect(appCss).toContain('.page-only{}')
  })

  it('normalizes mini-program theme scope selectors by AST when replaying vite-processed css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const baseThemeSelector = 'page, .tw-root, wx-root-portal-content, :host'
    const processedThemeSelector = ':host,wx-root-portal-content,page,.tw-root'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset([
          `${baseThemeSelector}{--up-main-color:#fff}`,
          '.app-main{}',
        ].join('\n')),
        fileName: 'app.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      ['pages/index/index.wxss', {
        css: [
          `${processedThemeSelector}{--primary-color-hex:#4268ea}`,
          '.page-only{}',
        ].join('\n'),
        injectIntoMain: true,
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain(baseThemeSelector)
    expect(appCss).not.toContain(processedThemeSelector)
    expect(appCss).toContain('--up-main-color:#fff')
    expect(appCss).toContain('--primary-color-hex:#4268ea')
    expect(appCss).toContain('.page-only{}')
  })

  it('regenerates vite-processed uni-app-x @apply style assets from remembered source', async () => {
    const generatedByRawSource: string[] = []
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
    }) => {
      generatedByRawSource.push(options.rawSource)
      const css = options.rawSource.includes('@apply')
        ? '.content{display:flex}.test{background-color:rgba(49,237,216,.54)}'
        : '.flex{display:flex}'
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set(['flex']),
        dependencies: [],
        sources: [],
        root: null,
      }
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-uni-app-x-apply-replay-'))
    createdDirs.push(root)
    const runtimeSet = new Set(['flex', 'bg-[#31edd8]/[0.54]'])
    const context = createContext({
      appType: 'uni-app-x',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({
        css: code,
        map: {
          toJSON: () => ({
            version: 3,
            file: 'style.css',
            sources: ['style.css'],
            names: [],
            mappings: '',
            sourcesContent: [code],
          }),
        },
      })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
      },
      uniAppX: true,
    })
    const styleId = path.join(root, 'pages/index/index.uvue?vue&type=style&index=0&lang.scss&scoped=true')
    const applySource = '.content { @apply flex; }\n.test { @apply bg-[#31edd8]/[0.54]; }'
    const rememberedCssSources = new Map([
      ['pages/index/index.wxss', {
        outputFile: 'pages/index/index.wxss',
        rawSource: applySource,
        sourceFile: styleId,
      }],
    ])
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => true),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })

    const processedCss = '.flex{display:flex}'
    const bundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', styleId.replace(/[?#].*$/, ''))}\n${processedCss}`),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [styleId],
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const wxss = String((bundle['pages/index/index.wxss'] as OutputAsset).source)
    expect(wxss).toContain('.content{display:flex}')
    expect(wxss).toContain('.test{background-color:rgba(49,237,216,.54)}')
    expect(wxss).not.toContain('.flex{display:flex}')
    expect(generatedByRawSource.some(source => source.includes('@apply flex'))).toBe(true)
  }, TEST_TIMEOUT_MS)

  it('keeps same-name subpackage vite css marker blocks isolated by output file', async () => {
    const generateMock = vi.fn(async () => ({
      css: '.unexpected{}',
      rawCss: '.unexpected{}',
      target: 'weapp',
      classSet: new Set(['unexpected']),
      dependencies: [],
      sources: [],
      root: null,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-subpackage-css-'))
    createdDirs.push(root)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['unexpected'])),
        getClassSetSync: vi.fn(() => new Set(['unexpected'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['unexpected']) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const independentCss = '.independent-only{}'
    const normalCss = '.normal-only{}'
    const independentSource = path.join(root, 'sub-independent/pages/index.css')
    const normalSource = path.join(root, 'sub-normal/pages/index.css')
    const bundle = {
      'sub-independent/pages/index.wxss': {
        ...createRollupAsset([
          createBundlerGeneratedCssMarker('vite', independentSource),
          independentCss,
          createBundlerGeneratedCssMarker('vite', normalSource),
          normalCss,
        ].join('\n')),
        fileName: 'sub-independent/pages/index.wxss',
      },
      'sub-normal/pages/index.wxss': {
        ...createRollupAsset([
          createBundlerGeneratedCssMarker('vite', independentSource),
          independentCss,
          createBundlerGeneratedCssMarker('vite', normalSource),
          normalCss,
        ].join('\n')),
        fileName: 'sub-normal/pages/index.wxss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['sub-independent/pages/index.wxss'] as OutputAsset).source).toContain(independentCss)
    expect((bundle['sub-independent/pages/index.wxss'] as OutputAsset).source).not.toContain(normalCss)
    expect((bundle['sub-normal/pages/index.wxss'] as OutputAsset).source).toContain(normalCss)
    expect((bundle['sub-normal/pages/index.wxss'] as OutputAsset).source).not.toContain(independentCss)
    expect(generateMock).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('drops source-root-prefixed vite css assets when weapp-vite emits srcRoot-relative css', () => {
    const root = path.resolve('/project/weapp-vite-demo')
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const appCss = '.app-only{}'
    const normalCss = '.normal-only{}'
    const independentCss = '.independent-only{}'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/app.scss'))}\n${appCss}`),
        fileName: 'app.wxss',
      },
      'miniprogram/app.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/app.scss'))}\n${appCss}`),
        fileName: 'miniprogram/app.wxss',
      },
      'sub-normal/pages/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/sub-normal/pages/index.scss'))}\n${normalCss}`),
        fileName: 'sub-normal/pages/index.wxss',
      },
      'miniprogram/sub-normal/pages/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/sub-normal/pages/index.scss'))}\n${normalCss}`),
        fileName: 'miniprogram/sub-normal/pages/index.wxss',
      },
      'sub-independent/pages/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/sub-independent/pages/index.scss'))}\n${independentCss}`),
        fileName: 'sub-independent/pages/index.wxss',
      },
      'miniprogram/sub-independent/pages/index.wxss': {
        ...createRollupAsset([
          createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/app.scss')),
          appCss,
          createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/sub-normal/pages/index.scss')),
          normalCss,
          createBundlerGeneratedCssMarker('vite', path.join(root, 'miniprogram/sub-independent/pages/index.scss')),
          independentCss,
        ].join('\n')),
        fileName: 'miniprogram/sub-independent/pages/index.wxss',
      },
    }
    const recorded = new Map<string, { css: string, outputFile?: string | undefined }>()

    collectViteProcessedCssAssetResults(bundle, {
      opts: context as any,
      isViteProcessedCssAsset: () => true,
      recordViteProcessedCssAssetResult(file, css, options) {
        recorded.set(file, { css, outputFile: options?.outputFile })
      },
      resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, context as any, root, false, false, 'miniprogram'),
    })

    expect(bundle['miniprogram/app.wxss']).toBeUndefined()
    expect(bundle['miniprogram/sub-normal/pages/index.wxss']).toBeUndefined()
    expect(bundle['miniprogram/sub-independent/pages/index.wxss']).toBeUndefined()
    expect((bundle['app.wxss'] as OutputAsset).source).toBe(appCss)
    expect((bundle['sub-normal/pages/index.wxss'] as OutputAsset).source).toBe(normalCss)
    expect((bundle['sub-independent/pages/index.wxss'] as OutputAsset).source).toBe(independentCss)
    expect(recorded.get(path.join(root, 'miniprogram/sub-independent/pages/index.scss'))?.outputFile).toBe('sub-independent/pages/index.wxss')
  })

  it('preserves vite-processed Tailwind v4 subpackage css instead of regenerating it from global candidates', async () => {
    const generateMock = vi.fn(async () => ({
      css: '.global-regenerated{}',
      rawCss: '.global-regenerated{}',
      target: 'weapp',
      classSet: new Set(['global-regenerated']),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v3-subpackage-stale-'))
    createdDirs.push(root)
    const subCssFile = path.join(root, 'miniprogram/sub-normal/pages/index.css')
    const rawSubCss = '@config "../../../tailwind.config.sub-normal.js";\n@tailwind utilities;'
    const processedSubCss = '.bg-normal-subpackage-marker{}'
    await writeFile(path.join(root, 'tailwind.config.js'), 'module.exports = { content: [] }\n', 'utf8')
    const runtimeSet = new Set(['global-regenerated'])
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcssBasedir: root,
          tailwindcss: {
            config: path.join(root, 'tailwind.config.js'),
          },
        },
      },
    })
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>()
    const rememberedCssSources = new Map([
      ['sub-normal/pages/index.wxss', {
        outputFile: 'sub-normal/pages/index.wxss',
        rawSource: rawSubCss,
        sourceFile: subCssFile,
      }],
    ])
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => true),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn((file: string, css: string, options?: { injectIntoMain?: boolean | undefined }) => {
        const previous = viteProcessedCssAssetResults.get(file)
        viteProcessedCssAssetResults.set(file, {
          css,
          injectIntoMain: options?.injectIntoMain ?? previous?.injectIntoMain,
        })
      }),
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      getViteProcessedCssAssetResult: (file: string) => viteProcessedCssAssetResults.get(file),
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'sub-normal/pages/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', subCssFile)}\n${processedSubCss}`),
        fileName: 'sub-normal/pages/index.wxss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    expect((bundle['sub-normal/pages/index.wxss'] as OutputAsset).source).toBe(processedSubCss)
    expect(generateMock).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('regenerates Tailwind v4 subpackage css from external SFC style source when output asset is empty', async () => {
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => {
      const css = [...options.candidates].sort().map((candidate) => {
        if (candidate === 'bg-normal-subpackage-marker') {
          return '.bg-normal-subpackage-marker{background-color:#2563eb}'
        }
        if (candidate === 'bg-independent-subpackage-marker') {
          return '.bg-independent-subpackage-marker{background-color:#dc2626}'
        }
        if (candidate.includes('normal_subpackage')) {
          return '.before_ccontent-normal::before{--tw-content:"normal"}'
        }
        if (candidate.includes('independent_subpackage')) {
          return '.before_ccontent-independent::before{--tw-content:"independent"}'
        }
        return `.${candidate}{display:block}`
      }).join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set(options.candidates),
        rawCandidates: new Set(options.candidates),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v3-empty-subpackage-css-'))
    createdDirs.push(root)
    await mkdir(path.join(root, 'src/sub-normal/pages'), { recursive: true })
    await mkdir(path.join(root, 'src/sub-independent/pages'), { recursive: true })
    await writeFile(path.join(root, 'tailwind.config.sub-normal.js'), `
module.exports = {
  content: ['./src/sub-normal/**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
  theme: { extend: { colors: { 'normal-subpackage-marker': '#2563eb' } } },
  corePlugins: { preflight: false, container: false },
}
`, 'utf8')
    await writeFile(path.join(root, 'tailwind.config.sub-independent.js'), `
module.exports = {
  content: ['./src/sub-independent/**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
  theme: { extend: { colors: { 'independent-subpackage-marker': '#dc2626' } } },
  corePlugins: { preflight: false, container: false },
}
`, 'utf8')
    const normalVueFile = path.join(root, 'src/sub-normal/pages/index.vue')
    const independentVueFile = path.join(root, 'src/sub-independent/pages/index.vue')
    const normalScssFile = path.join(root, 'src/sub-normal/pages/index.scss')
    const independentScssFile = path.join(root, 'src/sub-independent/pages/index.scss')
    const normalScss = '@config "../../../tailwind.config.sub-normal.js";\n@import "tailwindcss/utilities";'
    const independentScss = '@config "../../../tailwind.config.sub-independent.js";\n@import "tailwindcss/utilities";'
    await writeFile(normalVueFile, '<view class="bg-normal-subpackage-marker before:content-[\'normal_subpackage_uni-app-vite-tailwindcss-v4\']"></view>', 'utf8')
    await writeFile(independentVueFile, '<view class="bg-independent-subpackage-marker before:content-[\'independent_subpackage_uni-app-vite-tailwindcss-v4\']"></view>', 'utf8')
    await writeFile(normalScssFile, normalScss, 'utf8')
    await writeFile(independentScssFile, independentScss, 'utf8')
    const collector = createSourceCandidateCollector()
    await collector.syncFile(normalVueFile)
    await collector.syncFile(independentVueFile)
    await collector.syncCss(normalScssFile, normalScss)
    await collector.syncCss(independentScssFile, independentScss)
    const runtimeSet = collector.values()
    const context = createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcssBasedir: root,
          tailwindcss: {
            config: path.join(root, 'tailwind.config.sub-normal.js'),
          },
        },
      },
    })
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        weapp: { srcRoot: 'src' },
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/build/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => collector.values(),
      getSourceCandidateSource: file => collector.source(file),
      getSourceCandidateSources: () => collector.sources(),
      getSourceCandidatesForEntries: (entries, options) => collector.valuesForEntries(entries, options),
      getSourceCandidateSourcesForEntries: (entries, options) => collector.sourcesForEntries(entries, options),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => new Map(),
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'app.json': {
        ...createRollupAsset(JSON.stringify({
          pages: ['pages/index'],
          subPackages: [
            { root: 'sub-normal', pages: ['pages/index'] },
            { root: 'sub-independent', pages: ['pages/index'] },
          ],
        })),
        fileName: 'app.json',
      },
      'sub-normal/pages/index.js': {
        ...createRollupChunk('console.log("normal")'),
        fileName: 'sub-normal/pages/index.js',
        moduleIds: [normalVueFile],
      },
      'sub-independent/pages/index.js': {
        ...createRollupChunk('console.log("independent")'),
        fileName: 'sub-independent/pages/index.js',
        moduleIds: [independentVueFile],
      },
      'sub-normal/pages/index.wxss': {
        ...createRollupAsset(''),
        fileName: 'sub-normal/pages/index.wxss',
      },
      'sub-independent/pages/index.wxss': {
        ...createRollupAsset(''),
        fileName: 'sub-independent/pages/index.wxss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const normalCss = String((bundle['sub-normal/pages/index.wxss'] as OutputAsset).source)
    const independentCss = String((bundle['sub-independent/pages/index.wxss'] as OutputAsset).source)
    expect(normalCss).toContain('.bg-normal-subpackage-marker')
    expect(normalCss).toContain('.before_ccontent-normal')
    expect(normalCss).not.toContain('.bg-independent-subpackage-marker')
    expect(normalCss).not.toContain('.before_ccontent-independent')
    expect(independentCss).toContain('.bg-independent-subpackage-marker')
    expect(independentCss).toContain('.before_ccontent-independent')
    expect(independentCss).not.toContain('.bg-normal-subpackage-marker')
    expect(independentCss).not.toContain('.before_ccontent-normal')
    expect(generateMock).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('regenerates vite-processed Tailwind v4 subpackage css from remembered non-wechat source css', async () => {
    const generateCssByGeneratorMock = vi.fn(async (options: {
      file: string
      rawSource: string
    }) => {
      const css = options.file.includes('sub-independent')
        ? '.bg-independent-subpackage-marker{}.before_ccontent-_b_aindependent_a_B::before{}'
        : '.bg-normal-subpackage-marker{}.before_ccontent-_b_anormal_a_B::before{}'
      return createMockGeneratorCssResult(css, 4)
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v4-non-wechat-subpackage-'))
    createdDirs.push(root)
    const independentSourceFile = path.join(root, 'src/sub-independent/pages/index.css')
    const normalSourceFile = path.join(root, 'src/sub-normal/pages/index.css')
    const independentRawSource = '@import "tailwindcss" source(none);\n@config "../../../tailwind.config.sub-independent.js";'
    const normalRawSource = '@import "tailwindcss" source(none);\n@config "../../../tailwind.config.sub-normal.js";'
    const rememberedCssSources = new Map([
      ['sub-independent/pages/index.acss', {
        outputFile: 'sub-independent/pages/index.acss',
        rawSource: independentRawSource,
        sourceFile: independentSourceFile,
      }],
      ['sub-normal/pages/index.acss', {
        outputFile: 'sub-normal/pages/index.acss',
        rawSource: normalRawSource,
        sourceFile: normalSourceFile,
      }],
    ])
    const runtimeSet = new Set([
      'bg-independent-subpackage-marker',
      'before:content-[\'independent\']',
      'bg-normal-subpackage-marker',
      'before:content-[\'normal\']',
    ])
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.acss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.acss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
      },
    })
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/build/mp-alipay' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => true),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'sub-independent/pages/index.acss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', independentSourceFile)}\n.vite-placeholder{}`),
        fileName: 'sub-independent/pages/index.acss',
      },
      'sub-normal/pages/index.acss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', normalSourceFile)}\n.vite-placeholder{}`),
        fileName: 'sub-normal/pages/index.acss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const independentCss = String((bundle['sub-independent/pages/index.acss'] as OutputAsset).source)
    const normalCss = String((bundle['sub-normal/pages/index.acss'] as OutputAsset).source)
    expect(independentCss).toContain('.bg-independent-subpackage-marker')
    expect(independentCss).toContain('.before_ccontent-_b_aindependent_a_B')
    expect(independentCss).not.toContain('.bg-normal-subpackage-marker')
    expect(normalCss).toContain('.bg-normal-subpackage-marker')
    expect(normalCss).toContain('.before_ccontent-_b_anormal_a_B')
    expect(normalCss).not.toContain('.bg-independent-subpackage-marker')
    expect(generateCssByGeneratorMock).toHaveBeenCalledTimes(2)
    expect(generateCssByGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      file: independentSourceFile,
      rawSource: independentRawSource,
    }))
    expect(generateCssByGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      file: normalSourceFile,
      rawSource: normalRawSource,
    }))
  }, TEST_TIMEOUT_MS)

  it('excludes subpackage source candidates when generating Tailwind v4 app css', async () => {
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => {
      const css = [...options.candidates].sort().map(candidate => `.${candidate}{display:block}`).join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set(options.candidates),
        rawCandidates: new Set(options.candidates),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v3-main-package-scope-'))
    createdDirs.push(root)
    const mainSourceFile = path.join(root, 'miniprogram/pages/index.wxml')
    const subSourceFile = path.join(root, 'miniprogram/sub-normal/pages/index.wxml')
    const collector = createSourceCandidateCollector({
      extractor: source => source.includes('111') ? ['text-[111px]'] : ['text-[222px]'],
    })
    await collector.sync(mainSourceFile, '<view class="text-[111px]"></view>')
    await collector.sync(subSourceFile, '<view class="text-[222px]"></view>')
    const runtimeSet = collector.values()
    const context = createContext({
      appType: 'weapp-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
      },
    })
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => collector.values(),
      getSourceCandidatesForEntries: (entries, options) => collector.valuesForEntries(entries, options),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => new Map(),
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'app.json': {
        ...createRollupAsset(JSON.stringify({
          pages: ['pages/index'],
          subPackages: [{ root: 'sub-normal', pages: ['pages/index'] }],
        })),
        fileName: 'app.json',
      },
      'app.wxss': {
        ...createRollupAsset('@tailwind utilities;'),
        fileName: 'app.wxss',
      },
      'sub-normal/pages/index.js': {
        ...createRollupChunk('console.log("sub")'),
        fileName: 'sub-normal/pages/index.js',
        moduleIds: [path.join(root, 'miniprogram/sub-normal/pages/index.ts')],
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain('.text-_b111px_B')
    expect(appCss).toContain('font-size: 111px')
    expect(appCss).not.toContain('.text-_b222px_B')
    expect(appCss).not.toContain('font-size: 222px')
  }, TEST_TIMEOUT_MS)

  it('injects replayed main package vite css into app wxss without leaking subpackage css', async () => {
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
    }) => {
      const css = options.rawSource.includes('tw-main-watch')
        ? '.tw-main-watch{display:block}'
        : options.rawSource.includes('tw-sub-watch')
          ? '.tw-sub-watch{display:block}'
          : ''
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 4,
      }
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-main-package-replay-'))
    createdDirs.push(root)
    const runtimeSet = new Set(['tw-main-watch', 'tw-sub-watch'])
    const context = createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss' || file === 'src/tailwind.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
      },
    })
    const mainSourceFile = path.join(root, 'src/pages/index/index.vue?vue&type=style&index=0&lang.css')
    const subSourceFile = path.join(root, 'src/sub-normal/pages/index.vue?vue&type=style&index=0&lang.css')
    const rememberedCssSources = new Map([
      ['pages/index/index.wxss', {
        outputFile: 'pages/index/index.wxss',
        rawSource: '@import "tailwindcss";\n.tw-main-watch { @apply block; }',
        sourceFile: mainSourceFile,
      }],
      ['sub-normal/pages/index.wxss', {
        outputFile: 'sub-normal/pages/index.wxss',
        rawSource: '@import "tailwindcss";\n.tw-sub-watch { @apply block; }',
        sourceFile: subSourceFile,
      }],
    ])
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>()
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn((file: string, css: string, options?: { injectIntoMain?: boolean | undefined }) => {
        viteProcessedCssAssetResults.set(file, { css, injectIntoMain: options?.injectIntoMain })
      }),
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      getViteProcessedCssAssetResult: (file: string) => viteProcessedCssAssetResults.get(file),
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'app.json': {
        ...createRollupAsset(JSON.stringify({
          pages: ['pages/index/index'],
          subPackages: [{ root: 'sub-normal', pages: ['pages/index'] }],
        })),
        fileName: 'app.json',
      },
      'app.wxss': {
        ...createRollupAsset('@import "./app-origin.wxss";'),
        fileName: 'app.wxss',
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("main")'),
        fileName: 'pages/index/index.js',
      },
      'sub-normal/pages/index.js': {
        ...createRollupChunk('console.log("sub")'),
        fileName: 'sub-normal/pages/index.js',
      },
    }

    const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
    await generateBundle.call({
      addWatchFile: vi.fn(),
      emitFile(file: { type: 'asset', fileName: string, source: string }) {
        emitted.push(file)
        return file.fileName
      },
    }, {}, bundle)

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    const mainPageCss = emitted.find(file => file.fileName === 'pages/index/index.wxss')?.source
    const subPageCss = emitted.find(file => file.fileName === 'sub-normal/pages/index.wxss')?.source
    expect(appCss).toMatch(/\.tw-main-watch\s*\{[^}]*display:\s*block/)
    expect(appCss).not.toContain('.tw-sub-watch')
    expect(bundle['pages/index/index.wxss' as keyof typeof bundle]).toBeUndefined()
    expect(mainPageCss).toMatch(/\.tw-main-watch\s*\{[^}]*display:\s*block/)
    expect(mainPageCss).not.toContain('.tw-sub-watch')
    expect(subPageCss).toMatch(/\.tw-sub-watch\s*\{[^}]*display:\s*block/)
    expect(viteProcessedCssAssetResults.get(mainSourceFile)?.injectIntoMain).toBe(true)
    expect(viteProcessedCssAssetResults.get(subSourceFile)?.injectIntoMain).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('passes previous css to unchanged remembered vite css replay', async () => {
    const generateCalls: Array<{
      rawSource: string
      previousCss?: string | undefined
    }> = []
    const generateCssByGeneratorMock = vi.fn(async (options: {
      previousCss?: string | undefined
      rawSource: string
    }) => {
      generateCalls.push({
        rawSource: options.rawSource,
        previousCss: options.previousCss,
      })
      const css = options.previousCss
        ? `${options.previousCss}\n.tw-replay-next{display:flex}`
        : '.tw-replay-base{display:block}'
      return {
        css,
        rawCss: css,
        incrementalCss: options.previousCss ? '.tw-replay-next{display:flex}' : undefined,
        incrementalRawCss: options.previousCss ? '.tw-replay-next{display:flex}' : undefined,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 4,
      }
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-replay-previous-css-'))
    createdDirs.push(root)
    const runtimeSet = new Set(['tw-replay-base', 'tw-replay-next'])
    const context = createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
      },
    })
    const sourceFile = path.join(root, 'src/pages/index/index.vue?vue&type=style&index=0&lang.css')
    const rawSource = '@import "tailwindcss";\n.tw-replay-base { @apply block; }'
    const rememberedSignatures = new Map<string, string>()
    const rememberedCssSources = new Map([
      ['pages/index/index.wxss', {
        outputFile: 'pages/index/index.wxss',
        rawSource,
        sourceFile,
      }],
    ])
    const pruneViteCssCaches = vi.fn()
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      getRememberedCssSignature: (file: string) => rememberedSignatures.get(file),
      setRememberedCssSignature: (file: string, signature: string) => {
        rememberedSignatures.set(file, signature)
      },
      recordGeneratorCandidates: vi.fn(),
      pruneViteCssCaches,
    })
    const firstBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(rawSource),
        fileName: 'pages/index/index.wxss',
      },
    }
    await generateBundle.call({ addWatchFile: vi.fn() }, {}, firstBundle)
    const firstCss = (firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    const secondBundle = {
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }

    const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
    await generateBundle.call({
      addWatchFile: vi.fn(),
      emitFile(file: { type: 'asset', fileName: string, source: string }) {
        emitted.push(file)
        return file.fileName
      },
    }, {}, secondBundle)

    expect(generateCalls).toHaveLength(2)
    expect(generateCalls[0]?.previousCss).toBeUndefined()
    expect(generateCalls[1]?.previousCss).toBe(firstCss)
    expect(pruneViteCssCaches).toHaveBeenCalledTimes(1)
    const firstPruneOptions = pruneViteCssCaches.mock.calls.at(0)?.[0]
    expect(firstPruneOptions.activeFiles.has('pages/index/index.wxss')).toBe(true)
    expect(firstPruneOptions.activeKnownSfcFiles.has('pages/index/index.wxss')).toBe(true)
    expect(emitted.find(file => file.fileName === 'pages/index/index.wxss')?.source).toBe(
      `${firstCss}\n.tw-replay-next{display:flex}`,
    )
  }, TEST_TIMEOUT_MS)

  it('does not inject vite-processed main package page css into app wxss during build', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-main-page-build-css-'))
    createdDirs.push(root)
    const context = createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['tw-main-build'])),
        getClassSetSync: vi.fn(() => new Set(['tw-main-build'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['tw-main-build']) })),
      },
    })
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>()
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set(['tw-main-build'])),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set(['tw-main-build'])),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/build/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => true),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn((file: string, css: string, options?: { injectIntoMain?: boolean | undefined }) => {
        const previous = viteProcessedCssAssetResults.get(file)
        viteProcessedCssAssetResults.set(file, {
          css,
          injectIntoMain: options?.injectIntoMain ?? previous?.injectIntoMain,
        })
      }),
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      getViteProcessedCssAssetResult: (file: string) => viteProcessedCssAssetResults.get(file),
      getSourceCandidates: () => new Set(['tw-main-build']),
      getSourceCandidatesForEntries: () => new Set(['tw-main-build']),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => new Map(),
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'app.json': {
        ...createRollupAsset(JSON.stringify({ pages: ['pages/index/index'] })),
        fileName: 'app.json',
      },
      'app.wxss': {
        ...createRollupAsset('@import "./app-origin.wxss";'),
        fileName: 'app.wxss',
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("main")'),
        fileName: 'pages/index/index.js',
      },
      'pages/index/index.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'src/pages/index/index.vue?vue&type=style&index=0&lang.css'))}\n.tw-main-build{display:block}`),
        fileName: 'pages/index/index.wxss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).not.toContain('.tw-main-build')
    expect((bundle['pages/index/index.wxss'] as OutputAsset).source.toString()).toBe('.tw-main-build{display:block}')
    expect(viteProcessedCssAssetResults.get('pages/index/index.wxss')?.injectIntoMain).toBe(false)
  }, TEST_TIMEOUT_MS)

  it('does not replay vite-processed page css into app when output resolution points to app wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const bundle = {
      'app.wxss': {
        ...createRollupAsset(''),
        fileName: 'app.wxss',
      },
      'pages/index/index.css': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', '/project/src/pages/index/index.css')}\n.tw-page-build{display:block}`),
        fileName: 'pages/index/index.css',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>()

    collectViteProcessedCssAssetResults(bundle, {
      opts: context as any,
      isViteProcessedCssAsset: vi.fn(() => true),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn((file: string, css: string, options?: { injectIntoMain?: boolean | undefined }) => {
        viteProcessedCssAssetResults.set(file, { css, injectIntoMain: options?.injectIntoMain })
      }),
      resolveViteProcessedCssOutputFile: () => 'app.wxss',
    })
    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    expect((bundle['app.wxss'] as OutputAsset).source.toString()).not.toContain('.tw-page-build')
    expect(viteProcessedCssAssetResults.get('pages/index/index.css')?.injectIntoMain).toBeUndefined()
  })

  it('does not treat same-basename vite css results as imported css', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'shell.wxss'),
    })
    const bundle = {
      'shell.wxss': {
        ...createRollupAsset('@import "./styles/shared.wxss";\n.shell-entry{display:block}'),
        fileName: 'shell.wxss',
      },
      'styles/shared.wxss': {
        ...createRollupAsset('.style-shared{color:blue}'),
        fileName: 'styles/shared.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>([
      ['features/shared.wxss', {
        css: '.feature-shared{color:red}',
        injectIntoMain: true,
        outputFile: 'features/shared.wxss',
      }],
      ['styles/shared.wxss', {
        css: '.style-shared{color:blue}',
        injectIntoMain: true,
        outputFile: 'styles/shared.wxss',
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const css = (bundle['shell.wxss'] as OutputAsset).source.toString()
    expect(css).toContain('@import "./styles/shared.wxss"')
    expect(css).toContain('.feature-shared{color:red}')
    expect(css).not.toContain('.style-shared')
  })

  it('keeps imported taro vite app css shell when app-origin already carries the generated css', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-taro-app-origin-shell-'))
    createdDirs.push(root)
    const sourceFile = path.join(root, 'src/app.css')
    const records = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>()
    const generateBundle = createGenerateBundleHook({
      opts: createContext({
        appType: 'taro',
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
        styleHandler: vi.fn(async (code: string) => ({ css: code })),
        tailwindRuntime: {
          getClassSet: vi.fn(async () => new Set(['tw-app-entry'])),
          getClassSetSync: vi.fn(() => new Set(['tw-app-entry'])),
          majorVersion: 4,
          extract: vi.fn(async () => ({ classSet: new Set(['tw-app-entry']) })),
        },
      }) as any,
      runtimeState: {
        tailwindRuntime: { majorVersion: 4 } as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set(['tw-app-entry'])),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set(['tw-app-entry'])),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn((asset: OutputAsset, file: string) =>
        file === 'app-origin.wxss' && asset.source.toString().includes('weapp-tailwindcss generated css')),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult(file, css, options) {
        records.set(file, {
          css,
          injectIntoMain: options?.injectIntoMain,
          outputFile: options?.outputFile,
        })
      },
      getViteProcessedCssAssetResults: () => records.entries(),
      getViteProcessedCssAssetResult: file => records.get(file),
      getSourceCandidates: () => new Set(['tw-app-entry']),
      getSourceCandidateSource: file => file === sourceFile ? '@import "tailwindcss" source(none);' : undefined,
      getSourceCandidatesForEntries: () => new Set(['tw-app-entry']),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => new Map([
        ['app-origin.wxss', {
          outputFile: 'app-origin.wxss',
          rawSource: '@import "tailwindcss" source(none);',
          sourceFile,
        }],
      ]),
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'app-origin.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', sourceFile)}\n.tw-app-entry{display:flex}`),
        fileName: 'app-origin.wxss',
        originalFileNames: [sourceFile],
      },
      'app.wxss': {
        ...createRollupAsset('@import "app-origin.wxss";'),
        fileName: 'app.wxss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    expect((bundle['app.wxss'] as OutputAsset).source.toString()).toBe('@import "app-origin.wxss";')
    expect((bundle['app-origin.wxss'] as OutputAsset).source.toString()).not.toContain('weapp-tailwindcss generated css')
  }, TEST_TIMEOUT_MS)

  it('does not match plain taro temporary css assets to remembered subpackage css', async () => {
    const generateMock = vi.fn(async () => ({
      css: '.subpackage{}',
      rawCss: '.subpackage{}',
      target: 'weapp',
      classSet: new Set(['subpackage']),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-taro-temp-css-'))
    createdDirs.push(root)
    const subCssFile = path.join(root, 'src/sub-normal/pages/index.css')
    const rawSubCss = '@import "tailwindcss" source(none);\n@config "../../../tailwind.config.sub-normal.js";'
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['subpackage'])),
        getClassSetSync: vi.fn(() => new Set(['subpackage'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['subpackage']) })),
      },
    })
    const rememberedCssSources = new Map([
      ['sub-normal/pages/index.wxss', {
        outputFile: 'sub-normal/pages/index.wxss',
        rawSource: rawSubCss,
        sourceFile: subCssFile,
      }],
    ])
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set(['subpackage'])),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set(['subpackage'])),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => new Set(['subpackage']),
      getSourceCandidatesForEntries: () => new Set(['subpackage']),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      recordGeneratorCandidates: vi.fn(),
    })
    const rawPageCss = '.tw-page-style-watch-anchor{color:inherit}'
    const bundle = {
      'index.css': {
        ...createRollupAsset(rawPageCss),
        fileName: 'index.css',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const output = (bundle['index.wxss'] ?? bundle['index.css']) as OutputAsset
    expect(output.source).toBe(rawPageCss)
    expect(generateMock).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('preserves app-origin import while replaying independent main css into app.wxss', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const bundle = {
      'app.wxss': {
        ...createRollupAsset('@import "app-origin.wxss";'),
        fileName: 'app.wxss',
      },
      'app-origin.wxss': {
        ...createRollupAsset('.bg-normal-subpackage-marker{}'),
        fileName: 'app-origin.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>([
      [path.resolve('/project/src/app.css'), { css: '.app-main{}', injectIntoMain: true }],
      ['app-origin.wxss', { css: '.bg-normal-subpackage-marker{}', injectIntoMain: false }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain('@import "app-origin.wxss";')
    expect(appCss).toContain('.app-main{}')
    expect(appCss).not.toContain('.bg-normal-subpackage-marker')
  })

  it('does not replay explicit root vite css into subpackage page styles', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const bundle = {
      'app.wxss': {
        ...createRollupAsset('.app-root{}'),
        fileName: 'app.wxss',
      },
      'sub-normal/pages/index.wxss': {
        ...createRollupAsset('.bg-normal-subpackage-marker{}'),
        fileName: 'sub-normal/pages/index.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>([
      [path.resolve('/project/src/main.css'), {
        css: '.tw-entry-rule{}',
        injectIntoMain: true,
        outputFile: 'app.wxss',
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
    })

    const appCss = (bundle['app.wxss'] as OutputAsset).source.toString()
    const subpackageCss = (bundle['sub-normal/pages/index.wxss'] as OutputAsset).source.toString()
    expect(appCss).toContain('.tw-entry-rule{}')
    expect(subpackageCss).toBe('.bg-normal-subpackage-marker{}')
  })

  it('keeps non-main vite-processed subpackage css assets when app css is injected', () => {
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
    })
    const subpackageCss = '.bg-normal-subpackage-marker{}'
    const bundle = {
      'app.wxss': {
        ...createRollupAsset('.app-root{}'),
        fileName: 'app.wxss',
      },
      'sub-normal/pages/index.wxss': {
        ...createRollupAsset(subpackageCss),
        fileName: 'sub-normal/pages/index.wxss',
      },
    }
    const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>([
      ['sub-normal/pages/index.wxss', {
        css: subpackageCss,
        outputFile: 'sub-normal/pages/index.wxss',
      }],
      [path.resolve('/project/src/main.css'), {
        css: '.app-entry{}',
        injectIntoMain: true,
        outputFile: 'app.wxss',
      }],
    ])

    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: context as any,
      getViteProcessedCssAssetResults: () => viteProcessedCssAssetResults.entries(),
      markCssAssetProcessed: vi.fn(),
      recordCssAssetResult: vi.fn(),
      shouldRemoveInjectedSourceAsset: (_targetFile, record) => {
        if (record.injectIntoMain !== true || typeof record.outputFile !== 'string') {
          return false
        }
        return record.file.replace(/\\/g, '/') !== record.outputFile.replace(/\\/g, '/')
      },
    })

    expect((bundle['app.wxss'] as OutputAsset).source.toString()).toContain('.app-entry{}')
    expect((bundle['sub-normal/pages/index.wxss'] as OutputAsset).source).toBe(subpackageCss)
  })

  it('keeps explicit cssEntries when vite css transforms see tailwindcss roots', async () => {
    mockTailwindV4GeneratorCss()
    const explicitEntry = path.join(os.tmpdir(), 'weapp-tw-explicit-entry.css')
    const detectedEntry = path.join(os.tmpdir(), 'weapp-tw-detected-entry.css')
    const refreshTailwindcssRuntime = vi.fn()
    const context = createContext({
      cssEntries: [explicitEntry],
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
      },
      refreshTailwindcssRuntime,
    })
    refreshTailwindcssRuntime.mockImplementation(async () => context.tailwindRuntime)
    setCurrentContext(context)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss({ cssEntries: [explicitEntry] })
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const transform = getTransformHandler(rewritePlugin)

    await transform?.call(rewritePlugin, '@import "tailwindcss";', detectedEntry)

    expect(context.cssEntries).toEqual([explicitEntry])
    expect(context.tailwindcss?.v4?.cssSources).toBeUndefined()
    expect(refreshTailwindcssRuntime).not.toHaveBeenCalled()
  })

  it('removes Tailwind v4 official PostCSS plugins in default auto mode', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = createContext({
      generator: {
        target: 'weapp',
      },
    })
    setCurrentContext(currentContext)
    currentContext.tailwindRuntime.majorVersion = 3

    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const configResult = await (postPlugin.config as any)?.call(postPlugin, {
      plugins: [
        { name: '@tailwindcss/vite:scan' },
        { name: 'other-vite-plugin' },
      ],
    })
    expect(configResult?.resolve?.alias?.[0]?.replacement).toContain('generator-placeholder.css')

    const config = {
      plugins: [
        { name: '@tailwindcss/vite:scan' },
        { name: 'other-vite-plugin' },
      ],
      css: {
        postcss: {
          plugins: [
            { postcssPlugin: 'tailwindcss' },
            { postcssPlugin: 'autoprefixer' },
          ],
        },
      },
    } as unknown as ResolvedConfig

    await (postPlugin.configResolved as any)?.call(postPlugin, config)

    expect(config.plugins.map(plugin => plugin.name)).toEqual([
      'other-vite-plugin',
    ])
    expect((config.css.postcss as any).plugins).toEqual([
      { postcssPlugin: 'autoprefixer' },
    ])
  }, TEST_TIMEOUT_MS)

  it('generates Tailwind v4 web css in vite generator mode', async () => {
    const runtimeSet = new Set(['flex', 'min-h-screen'])
    const generatedCss = '.flex{display:flex}.min-h-screen{min-height:100vh}'
    const generateMock = vi.fn(async ({ target, candidates }: { target: string, candidates: Set<string> }) => ({
      css: generatedCss,
      rawCss: generatedCss,
      target,
      classSet: new Set(candidates),
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
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,      }
    })

    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      styleHandler: vi.fn(async () => {
        throw new Error('web target should not use mini-program styleHandler')
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(sourcePlugin)
    await transform?.call(sourcePlugin, 'export const cls = "flex min-h-screen"', '/project/src/pages/index.ts')

    const bundle = {
      'app.js': {
        ...createRollupChunk('const cls = "flex min-h-screen"'),
        fileName: 'app.js',
      },
      'app.css': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(generatedCss)
    expect((bundle['app.js'] as OutputChunk).code).toBe('const cls = "flex min-h-screen"')
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      target: 'web',
      candidates: expect.any(Set),
    }))
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates as Set<string>
    expect(candidates.has('flex')).toBe(true)
    expect(candidates.has('min-h-screen')).toBe(true)
  }, TEST_TIMEOUT_MS)

  it('reuses snapshot hashes for unchanged js process cache checks', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const hashSpy = vi.spyOn(currentContext.cache, 'computeHash')
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    expect(currentContext.tailwindRuntime.extract).toHaveBeenCalledTimes(2)
    expect(currentContext.tailwindRuntime.getClassSetSync).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('updates v3 watch runtime classes incrementally without full extract on source candidate changes', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const htmlFile = 'pages/index/index.wxml'
    const jsFile = 'assets/index.js'
    const cssFile = 'app.wxss'
    const baselineClass = 'text-red-500'
    const firstClass = 'bg-blue-500'
    const secondClass = 'bg-[#123455]'
    const jsHandler = createJsHandler({
      escapeMap: MappingChars2String,
      jsArbitraryValueFallback: false,
      tailwindcssMajorVersion: 3,
    })
    const templateHandler = createTemplateHandler({
      escapeMap: MappingChars2String,
      jsHandler,
    })
    const extractMock = vi.fn(async () => ({
      classSet: new Set([baselineClass, firstClass]),
    }))

    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      templateHandler,
      jsHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set([baselineClass, firstClass])),
        getClassSetSync: vi.fn(() => new Set([baselineClass, firstClass])),
        extract: extractMock,
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
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
      [htmlFile]: {
        ...createRollupAsset(`<view class="${firstClass}"></view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "${firstClass}"`),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset('@tailwind utilities;'),
        fileName: cssFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    expect((firstBundle[htmlFile] as OutputAsset).source.toString()).toContain(replaceWxml(firstClass))
    expect((firstBundle[jsFile] as OutputChunk).code).toContain(replaceWxml(firstClass))
    expect((firstBundle[cssFile] as OutputAsset).source.toString()).toContain(`.${replaceWxml(firstClass)}`)

    const secondBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="${secondClass}"></view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "${secondClass}"`),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset('@tailwind utilities;'),
        fileName: cssFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const secondHtml = (secondBundle[htmlFile] as OutputAsset).source.toString()
    const secondJs = (secondBundle[jsFile] as OutputChunk).code
    const secondCss = (secondBundle[cssFile] as OutputAsset).source.toString()
    expect(secondHtml).toContain(replaceWxml(secondClass))
    expect(secondJs).toContain(replaceWxml(secondClass))
    expect(secondCss).toContain(`.${replaceWxml(secondClass)}`)
    expect(secondCss).toContain(`.${replaceWxml(baselineClass)}`)
    expect(extractMock).toHaveBeenCalledTimes(1)
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
      tailwindcssMajorVersion: 4,
    })
    const templateHandler = createTemplateHandler({
      escapeMap: MappingChars2String,
      jsHandler,
    })

    setCurrentContext(createContext({
      templateHandler,
      jsHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => fallbackRuntimeSet),
        getClassSetSync: vi.fn(() => fallbackRuntimeSet),
        extract: vi.fn(async () => ({ classSet: fallbackRuntimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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

  it('adds unresolved dynamic wxml arbitrary candidates to the full runtime retry', async () => {
    const loggerModule = await import('@weapp-tailwindcss/logger')
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {})
    const fullRuntimeSet = new Set<string>()
    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => new Set<string>()),
        reset: vi.fn(async () => undefined),
      }),
    }))

    setCurrentContext(createContext({
      htmlMatcher: (file: string) => file.endsWith('wxml'),
      templateHandler: createTemplateHandler({
        jsHandler: createJsHandler({
          jsArbitraryValueFallback: false,
          tailwindcssMajorVersion: 4,
        }),
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => fullRuntimeSet),
        getClassSetSync: vi.fn(() => fullRuntimeSet),
        extract: vi.fn(async () => ({ classSet: fullRuntimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const rawWxml = '<view class="{{active ? \'h-[458rpx] w-[218rpx] inset-x-[30%]\' : \'\'}}">111</view>'
    const bundle = {
      'packages/activ-gift/indexwxml': {
        ...createRollupAsset(rawWxml),
        fileName: 'packages/activ-gift/indexwxml',
      } satisfies OutputAsset,
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const transformed = (bundle['packages/activ-gift/indexwxml'] as OutputAsset).source.toString()
    expect(transformed).toContain(replaceWxml('h-[458rpx]'))
    expect(transformed).toContain(replaceWxml('w-[218rpx]'))
    expect(transformed).toContain(replaceWxml('inset-x-[30%]'))
    expect(transformed).not.toContain('h-[458rpx]')
    expect(transformed).not.toContain('w-[218rpx]')
    expect(transformed).not.toContain('inset-x-[30%]')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain('已回退到完整 runtimeSet 重试')
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set when only comment-carried class candidates change', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSets = [
      new Set(['text-[#123456]']),
      new Set(['text-[#654321]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code),
      jsHandler: createJsHandler({
        jsArbitraryValueFallback: false,
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 4,
      },
    }))

    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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

    currentContext.tailwindRuntime.extract.mockClear()
    currentContext.tailwindRuntime.getClassSetSync.mockClear()
    currentContext.tailwindRuntime.getClassSet.mockClear()
    runtimeIndex = 1

    await generateBundle?.call(postPlugin, {} as any, {
      'index.wxml': createRollupAsset('<view class="card"></view><!-- text-[#654321] -->'),
      'index.js': createRollupChunk('const cls = "card"\n/* text-[#654321] */'),
    })

    expect(currentContext.tailwindRuntime.extract).toHaveBeenCalledTimes(1)
    expect(currentContext.tailwindRuntime.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(currentContext.tailwindRuntime.getClassSet).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('reuses css handler override objects for the same asset across incremental runs', async () => {
    setCurrentContext(createContext({
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect((bundle['pages/a/index.css'] as OutputAsset).source).toBe(`css:${css}`)
    expect((bundle['pages/b/index.css'] as OutputAsset).source).toBe(`css:${css}`)
  }, TEST_TIMEOUT_MS)

  it('processes Vite source style assets and writes mini-program style extension', async () => {
    const styleHandler = vi.fn(async (code: string) => ({ css: `css:${code}` }))
    setCurrentContext(createContext({
      appType: 'weapp-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      styleHandler,
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const rawScssAssetCss = '.from-scss { color: red; }'
    const bundle = {
      'sub-normal/pages/index.scss': {
        ...createRollupAsset(rawScssAssetCss),
        fileName: 'sub-normal/pages/index.scss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
    await generateBundle?.call({
      ...postPlugin,
      emitFile(file: { type: 'asset', fileName: string, source: string }) {
        emitted.push(file)
        return file.fileName
      },
    }, {} as any, bundle)

    const emittedWxss = emitted.find(file => file.fileName === 'sub-normal/pages/index.wxss')
    expect(bundle['sub-normal/pages/index.scss']).toBeUndefined()
    expect(emittedWxss?.fileName).toBe('sub-normal/pages/index.wxss')
    expect(emittedWxss?.source).toBe(`css:${rawScssAssetCss}`)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.onUpdate).toHaveBeenCalledWith(
      'sub-normal/pages/index.wxss',
      rawScssAssetCss,
      `css:${rawScssAssetCss}`,
    )
  }, TEST_TIMEOUT_MS)

  it('keeps Vite source style asset names for web generator target', async () => {
    const styleHandler = vi.fn(async (code: string) => ({ css: `css:${code}` }))
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      generator: {
        target: 'web',
      },
      styleHandler,
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const css = '.web { color: red; }'
    const bundle = {
      'assets/index.scss': {
        ...createRollupAsset(css),
        fileName: 'assets/index.scss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(bundle['assets/index.wxss']).toBeUndefined()
    expect((bundle['assets/index.scss'] as OutputAsset).fileName).toBe('assets/index.scss')
    expect((bundle['assets/index.scss'] as OutputAsset).source).toBe(css)
    expect(styleHandler).not.toHaveBeenCalled()
    expect(currentContext.onUpdate).toHaveBeenCalledWith('assets/index.scss', css, css)
  }, TEST_TIMEOUT_MS)

  it('skips template and js class transforms for web generator target', async () => {
    const templateHandler = vi.fn(async (code: string) => `tpl:${code}`)
    const jsHandler = vi.fn((code: string) => ({ code: `js:${code}` }))
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.css'),
      generator: {
        target: 'web',
      },
      htmlMatcher: (file: string) => file.endsWith('.html'),
      jsHandler,
      jsMatcher: (file: string) => file.endsWith('.js'),
      templateHandler,
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const html = '<div class="from-[#0a0f1c] text-[26rpx]"></div>'
    const js = 'const cls = "from-[#0a0f1c] text-[26rpx]"'
    const bundle = {
      'index.html': {
        ...createRollupAsset(html),
        fileName: 'index.html',
      },
      'assets/index.js': {
        ...createRollupChunk(js),
        fileName: 'assets/index.js',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['index.html'] as OutputAsset).source).toBe(html)
    expect((bundle['assets/index.js'] as OutputChunk).code).toBe(js)
    expect(templateHandler).not.toHaveBeenCalled()
    expect(jsHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('skips bundle runtime class scanning for web generator target', async () => {
    const syncMock = vi.fn(async () => new Set(['text-[26rpx]']))
    const resetMock = vi.fn(async () => undefined)
    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: syncMock,
        reset: resetMock,
      }),
    }))

    const currentContext = createContext({
      cssMatcher: (file: string) => file.endsWith('.css'),
      generator: {
        target: 'web',
      },
      htmlMatcher: (file: string) => file.endsWith('.html'),
      jsMatcher: (file: string) => file.endsWith('.js'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['from-runtime'])),
        getClassSetSync: vi.fn(() => new Set(['from-runtime'])),
        extract: vi.fn(async () => ({ classSet: new Set(['from-runtime']) })),
        majorVersion: 4,
      },
    })
    setCurrentContext(currentContext)

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const css = '.text-\\[26rpx\\] { font-size: 0.8125rem; }'
    const html = '<div class="from-[#0a0f1c] text-[26rpx]"></div>'
    const bundle = {
      'index.html': {
        ...createRollupAsset(html),
        fileName: 'index.html',
      },
      'assets/index.css': {
        ...createRollupAsset(css),
        fileName: 'assets/index.css',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "from-[#0a0f1c] text-[26rpx]"'),
        fileName: 'assets/index.js',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(syncMock).not.toHaveBeenCalled()
    expect(resetMock).not.toHaveBeenCalled()
    expect(currentContext.tailwindRuntime.extract).not.toHaveBeenCalled()
    expect(currentContext.tailwindRuntime.getClassSet).not.toHaveBeenCalled()
    expect(currentContext.tailwindRuntime.getClassSetSync).not.toHaveBeenCalled()
    expect((bundle['index.html'] as OutputAsset).source).toBe(html)
    expect((bundle['assets/index.css'] as OutputAsset).source).toBe(css)
  }, TEST_TIMEOUT_MS)

  it('scans configured source candidates during Tailwind v4 web generator buildStart', async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-v4-web-scan-'))
    createdDirs.push(projectRoot)
    const cssEntry = path.join(projectRoot, 'src/main.css')
    const sourceFile = path.join(projectRoot, 'src/pages/index.vue')
    await mkdir(path.dirname(sourceFile), { recursive: true })
    await writeFile(cssEntry, [
      '@import "tailwindcss" source(none);',
      '@source "./pages/**/*.{vue,js,ts}";',
    ].join('\n'), 'utf8')
    await writeFile(sourceFile, '<template><view class="bg-[#123456]"></view></template>')

    const resolveScanMock = vi.fn(async () => ({
      entries: [
        {
          base: path.dirname(cssEntry),
          pattern: './pages/**/*.{vue,js,ts}',
          negated: false,
        },
      ],
      explicit: true,
    }))
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: resolveScanMock,
      }
    })

    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.css'),
      tailwindcss: {
        v4: {
          cssEntries: [cssEntry],
        },
      },
      generator: {
        target: 'web',
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['from-runtime'])),
        getClassSetSync: vi.fn(() => new Set(['from-runtime'])),
        extract: vi.fn(async () => ({ classSet: new Set(['from-runtime']) })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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

    await sourcePlugin.buildStart?.call(sourcePlugin as any, {} as any)

    expect(resolveScanMock).toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('generates Tailwind v4 css for uni-app x H5 web target during vite build finalization', async () => {
    const generatedCss = '.bg-\\[\\#f21903\\]{background-color:#f21903}.text-xl{font-size:1.25rem;line-height:1.75rem}'
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: generatedCss,
      rawCss: generatedCss,
      target: 'web',
      classSet: new Set(options.candidates),
      dependencies: ['/repo/uni-app-x/main.css'],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          version: 4,
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })

    const styleHandler = vi.fn(async () => {
      throw new Error('web target should not use mini-program styleHandler')
    })
    setCurrentContext(createContext({
      appType: 'uni-app-x',
      cssMatcher: (file: string) => file.endsWith('.css'),
      generator: {
        target: 'web',
      },
      mainCssChunkMatcher: vi.fn((file: string) => file === 'main.css'),
      styleHandler,
      tailwindcss: {
        v4: {
          cssEntries: ['/repo/uni-app-x/main.css'],
        },
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['bg-[#f21903]', 'text-xl'])),
        getClassSetSync: vi.fn(() => new Set(['bg-[#f21903]', 'text-xl'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['bg-[#f21903]', 'text-xl']) })),
      },
      uniAppX: false,
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const finalizerPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:css-finalizer') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(finalizerPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/build/h5' },
    } as ResolvedConfig)

    const bundle = {
      'main.css': {
        ...createRollupAsset('@import "tailwindcss" source(none);\n@source "./pages/**/*.{uts,uvue}";'),
        fileName: 'main.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(finalizerPlugin)
    const addWatchFile = vi.fn()
    await generateBundle?.call({ ...finalizerPlugin, addWatchFile }, {} as any, bundle)

    const css = (bundle['main.css'] as OutputAsset).source.toString()
    expect(css).toBe(generatedCss)
    expect(css).not.toContain('@import "tailwindcss"')
    expect(css).not.toContain('@source')
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(styleHandler).not.toHaveBeenCalled()
    expect(addWatchFile).toHaveBeenCalledWith('/repo/uni-app-x/main.css')
  }, TEST_TIMEOUT_MS)

  it('scans source candidates during Tailwind v4 web generator buildStart', async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-v3-web-scan-'))
    createdDirs.push(projectRoot)
    await mkdir(path.join(projectRoot, 'src'), { recursive: true })
    await writeFile(path.join(projectRoot, 'src/App.vue'), '<template><view class="flex min-h-screen"></view></template>')
    const resolveScanMock = vi.fn(async () => ({
      entries: undefined,
      explicit: false,
    }))
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: resolveScanMock,
      }
    })

    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.css'),
      generator: {
        target: 'web',
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(['from-runtime'])),
        getClassSetSync: vi.fn(() => new Set(['from-runtime'])),
        extract: vi.fn(async () => ({ classSet: new Set(['from-runtime']) })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: projectRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    await sourcePlugin.buildStart?.call(sourcePlugin as any, {} as any)

    expect(resolveScanMock).toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('drops raw preprocessor source style assets that Vite exposes during watch', async () => {
    const styleHandler = vi.fn(async (code: string) => ({ css: `css:${code}` }))
    setCurrentContext(createContext({
      appType: 'weapp-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      styleHandler,
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const rawScss = [
      '// https://sass-lang.com/documentation/at-rules/import/#plain-css-imports',
      '.s {',
      '  .a { color: turquoise; }',
      '}',
    ].join('\n')
    const bundle = {
      'pages/index/index.scss': {
        ...createRollupAsset(rawScss),
        fileName: 'pages/index/index.scss',
      },
      'pages/index/index.wxss': {
        ...createRollupAsset('.s .a { color: turquoise; }'),
        fileName: 'pages/index/index.wxss',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(bundle['pages/index/index.scss']).toBeUndefined()
    expect((bundle['pages/index/index.wxss'] as OutputAsset).source).toBe('css:.s .a { color: turquoise; }')
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(styleHandler).toHaveBeenCalledWith('.s .a { color: turquoise; }', expect.any(Object))
  }, TEST_TIMEOUT_MS)

  it('uses tailwind v4 engine css for matching main css assets', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const dependencyFiles = [
      path.resolve(process.cwd(), 'src/app.css'),
      path.resolve(process.cwd(), 'tailwind.config.js'),
    ]
    const syncMock = vi.fn(async () => runtimeSet)
    const resetMock = vi.fn(async () => undefined)
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: dependencyFiles,
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
      css: '@import "tailwindcss" source(none);',
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
      resolveTailwindV4SourceFromRuntime: resolveSourceMock,
    }))

    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    const addWatchFile = vi.fn()
    await generateBundle?.call({ ...postPlugin, addWatchFile }, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(weappCss)
    expect(addWatchFile.mock.calls.map(([file]) => file)).toEqual(dependencyFiles)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: new Set(['w-[100px]']),
    }))
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps generator css output when Rollup rejects late addWatchFile registration', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const dependencyFiles = [
      path.resolve(process.cwd(), 'tailwind.config.js'),
    ]
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: '.w-\\[100px\\]{width:100px}',
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: dependencyFiles,
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
      css: '@import "tailwindcss" source(none);',
      dependencies: [],
    }))

    vi.doMock('@/bundlers/vite/incremental-runtime-class-set', () => ({
      createBundleRuntimeClassSetManager: () => ({
        sync: vi.fn(async () => runtimeSet),
        reset: vi.fn(async () => undefined),
      }),
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: createEngineMock,
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: resolveSourceMock,
    }))

    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

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

    const phaseError = new Error('Cannot call "addWatchFile" after the build has finished.')
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const addWatchFile = vi.fn(() => {
      throw phaseError
    })

    await expect(generateBundle?.call({ ...postPlugin, addWatchFile }, {} as any, bundle)).resolves.toBeUndefined()
    expect((bundle['app.css'] as OutputAsset).source.toString()).toContain(weappCss)
    expect(addWatchFile).toHaveBeenCalledWith(dependencyFiles[0])
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `css:${code}` }))
    setCurrentContext(createContext({
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `user:${code}` }))
    setCurrentContext(createContext({
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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

    const bundle = {
      'app.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'app.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${weappCss}\nuser:${userCss}`)
    expect(styleHandler).toHaveBeenCalledTimes(2)
    expect(styleHandler.mock.calls.at(-1)?.[0]).toBe(userCss.trim())
    expect(styleHandler.mock.calls.at(-1)?.[1]).toMatchObject({
      isMainChunk: true,
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss4',
      })),
      resolveTailwindV4Source: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    setCurrentContext(createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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

  it('keeps raw vue source candidates when vite transforms vue sub-requests', async () => {
    const runtimeSet = new Set<string>()
    const rawTailwindCss = '/*! weapp-tailwindcss generator-placeholder */'
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    setCurrentContext(createContext({
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
    const vueFile = path.resolve(process.cwd(), 'src/pages/index/index.vue')
    await transform?.call(sourcePlugin, '<template><text class="text-[188rpx] font-bold"></text></template>', vueFile)
    await transform?.call(sourcePlugin, 'import "./main.css"', `${vueFile}?vue&type=script&lang.ts`)
    await transform?.call(sourcePlugin, 'export function render() { return "compiled" }', `${vueFile}?vue&type=template`)

    const bundle = {
      'pages/index/index.wxml': {
        ...createRollupAsset('<text class="text-[188rpx] font-bold"></text>'),
        fileName: 'pages/index/index.wxml',
      },
      'app.css': {
        ...createRollupAsset(rawTailwindCss),
        fileName: 'app.css',
      },
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const candidates = generateMock.mock.calls.at(-1)?.[0].candidates as Set<string>
    expect(candidates).toContain('text-[188rpx]')
    expect(candidates).toContain('font-bold')
    expect(String((bundle['app.css'] as OutputAsset).source)).toContain('.text-[188rpx]{}')
  }, TEST_TIMEOUT_MS)

  it('finalizes css assets emitted after the main generateBundle pass through Rollup output plugins', async () => {
    const runtimeSet = new Set(['w-[100px]'])
    const rawTailwindCss = '/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */\n.w-\\[100px\\]{width:100px}\n@property --tw-leading{syntax:"*";inherits:false}'
    const weappCss = '.w-_b100px_B{width:100px}'
    const dependencyFiles = [
      path.resolve(process.cwd(), 'src/app.css'),
      path.resolve(process.cwd(), 'tailwind.config.js'),
    ]
    const writeFileMock = vi.fn(async () => {
      throw new Error('bundler css output must not call writeFile')
    })
    const generateMock = vi.fn(async () => ({
      css: weappCss,
      rawCss: rawTailwindCss,
      target: 'weapp',
      classSet: runtimeSet,
      dependencies: dependencyFiles,
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const finalizer = plugins?.find((plugin: Plugin) =>
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
    const addWatchFile = vi.fn()
    await generateBundle?.call({ ...finalizer, addWatchFile }, {} as any, bundle)

    const css = (bundle['pages-order/pages/home/home.wxss'] as OutputAsset).source.toString()
    expect(css).toBe(weappCss)
    expect(addWatchFile.mock.calls.map(([file]) => file)).toEqual(dependencyFiles)
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

  it('treats generator false as the default generator path', async () => {
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    setCurrentContext(createContext({
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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

    expect((bundle['app.css'] as OutputAsset).source).toBe('.w-_b100px_B{width:100px}')
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('throws instead of falling back when tailwind v4 generator fails', async () => {
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `legacy:${code}` }))
    setCurrentContext(createContext({
      generator: {
      },
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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

  it('keeps Vite web css without generator or mini-program post processing', async () => {
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `mini:${code}` }))
    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
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

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${rawTailwindCss}${userCss}`)
    expect(generateMock).not.toHaveBeenCalled()
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps Vite build web css without dropping ordinary bundled rules', async () => {
    const runtimeSet = new Set(['hover:bg-blue-500'])
    const rawTailwindCss = '/*! tailwindcss v4.3.1 | MIT License | https://tailwindcss.com */\n.hover\\:bg-blue-500:hover{color:blue}'
    const userCss = '\nhtml{font-family:Inter,ui-sans-serif}.site-card{display:grid;color:#0f172a}'
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
      })),
    }))

    const styleHandler = vi.fn(async (code: string) => ({ css: `mini:${code}` }))
    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
      'assets/index.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'assets/index.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const source = (bundle['assets/index.css'] as OutputAsset).source.toString()
    expect(source).toContain('.hover\\:bg-blue-500:hover{color:blue}')
    expect(source).toContain('html{font-family:Inter,ui-sans-serif}')
    expect(source).toContain('.site-card{display:grid;color:#0f172a}')
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('generates raw Tailwind v4 directives for Vite build web css', async () => {
    const runtimeSet = new Set(['i-mdi-home', 'hover:bg-blue-500'])
    const rawTailwindCss = '@import "tailwindcss" source(none);\n@source "./src/**/*.{vue,ts}";'
    const userCss = '\nhtml{font-family:Inter,ui-sans-serif}.site-card{display:grid;color:#0f172a}'
    const webCss = '.i-mdi-home{display:inline-block}.hover\\:bg-blue-500:hover{color:blue}'
    const generateMock = vi.fn(async () => ({
      css: webCss,
      rawCss: webCss,
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
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          projectRoot: process.cwd(),
          base: process.cwd(),
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })

    const styleHandler = vi.fn(async (code: string) => ({ css: `mini:${code}` }))
    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      styleHandler,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
      'assets/index.css': {
        ...createRollupAsset(`${rawTailwindCss}${userCss}`),
        fileName: 'assets/index.css',
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const source = (bundle['assets/index.css'] as OutputAsset).source.toString()
    expect(source).toContain('.i-mdi-home{display:inline-block}')
    expect(source).toContain('html{font-family:Inter,ui-sans-serif}')
    expect(source).toContain('.site-card{display:grid;color:#0f172a}')
    expect(source).not.toContain('@import "tailwindcss"')
    expect(source).not.toContain('@source')
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('does not run the css finalizer on html assets matched by a broad css matcher', async () => {
    const runtimeSet = new Set(['flex'])
    const generateMock = vi.fn(async () => ({
      css: '.flex{display:flex}',
      rawCss: '.flex{display:flex}',
      target: 'web',
      classSet: runtimeSet,
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })

    const html = '<!DOCTYPE html><html><head><style>@import "tailwindcss";@config "../tailwind.config.js";</style></head><body></body></html>'
    setCurrentContext(createContext({
      cssMatcher: () => true,
      htmlMatcher: (file: string) => file.endsWith('.html'),
      generator: {
        target: 'web',
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const finalizerPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:css-finalizer') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(finalizerPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'index.html': {
        ...createRollupAsset(html),
        fileName: undefined as unknown as string,
      },
    }

    const generateBundle = getGenerateBundleHandler(finalizerPlugin)
    await generateBundle?.call(finalizerPlugin, {} as any, bundle)

    expect((bundle['index.html'] as OutputAsset).source.toString()).toBe(html)
    expect(generateMock).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('classifies html assets before broad css matchers', () => {
    const context = createContext({
      cssMatcher: () => true,
    })

    expect(classifyBundleEntry('index.html', context)).toBe('html')
    expect(classifyBundleEntry('app.wxml', context)).toBe('html')
  })

  it('resolves web Tailwind v4 asset @config from the original css source file', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-web-config-source-'))
    createdDirs.push(root)
    const sourceFile = path.join(root, 'src/main.css')
    const configFile = path.join(root, 'tailwind.config.js')
    await mkdir(path.dirname(sourceFile), { recursive: true })
    await writeFile(sourceFile, '@import "tailwindcss" source(none);\n@config "../tailwind.config.js";', 'utf8')
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{vue,ts}"] }\n', 'utf8')

    const runtimeSet = new Set(['i-mdi-home'])
    const createdSources: Array<{ css: string, base: string }> = []
    const generateMock = vi.fn(async () => ({
      css: '.i-mdi-home{display:inline-block}',
      rawCss: '.i-mdi-home{display:inline-block}',
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
        createWeappTailwindcssGenerator: vi.fn((source: { css: string, base: string }) => {
          createdSources.push(source)
          return {
            generate: generateMock,
          }
        }),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })

    setCurrentContext(createContext({
      generator: {
        target: 'web',
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              cssSources: [
                {
                  file: sourceFile,
                  base: path.dirname(sourceFile),
                  css: '@import "tailwindcss" source(none);\n@config "../tailwind.config.js";',
                  dependencies: [configFile],
                },
              ],
            },
          },
        },
      },
    }))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const bundle = {
      'assets/index.css': {
        ...createRollupAsset('@import "tailwindcss" source(none);\n@config "../tailwind.config.js";\n.site-card{display:grid}'),
        fileName: 'assets/index.css',
        originalFileNames: [sourceFile],
      },
    }

    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    const source = (bundle['assets/index.css'] as OutputAsset).source.toString()
    expect(source).toContain('.i-mdi-home{display:inline-block}')
    expect(source).toContain('.site-card{display:grid}')
    expect(createdSources[0]?.css).toContain(`@config "${configFile.replaceAll('\\', '/')}";`)
    expect(createdSources[0]?.css).not.toContain('../tailwind.config.js')
  }, TEST_TIMEOUT_MS)

  it('resolves web Tailwind v4 asset source from configured css when Rollup reports index html as original file', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-web-html-origin-css-source-'))
    createdDirs.push(root)
    const mainSourceFile = path.join(root, 'src/main.css')
    const subSourceFile = path.join(root, 'src/sub/index.css')
    const configFile = path.join(root, 'tailwind.config.js')
    const subConfigFile = path.join(root, 'tailwind.config.sub.js')
    await mkdir(path.dirname(mainSourceFile), { recursive: true })
    await mkdir(path.dirname(subSourceFile), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./src/**/*.{vue,ts}"] }\n', 'utf8')
    await writeFile(subConfigFile, 'module.exports = { content: ["./src/sub/**/*.{vue,ts}"] }\n', 'utf8')

    const mainRawSource = [
      '@import "tailwindcss" source(none);',
      '@config "../tailwind.config.js";',
      '@source "../src/**/*.{vue,js,ts,jsx,tsx,html}";',
      '@source not "../src/sub/**/*";',
      '@custom-variant system-dark { @media (prefers-color-scheme: dark) { @slot; } }',
      '@theme { --color-midnight: #121063; }',
      '@layer components { .layer-card-v4 { display: flex; } }',
    ].join('\n')
    const subRawSource = [
      '@import "tailwindcss" source(none);',
      '@config "../../tailwind.config.sub.js";',
      '@source "../**/*.{vue,js,ts,jsx,tsx,html}";',
      '@theme { --color-subpackage: #1677ff; }',
    ].join('\n')
    await writeFile(mainSourceFile, mainRawSource, 'utf8')
    await writeFile(subSourceFile, subRawSource, 'utf8')

    const runtimeSet = new Set(['i-mdi-home'])
    const generatedOptions: Array<{ rawSource: string, file: string }> = []
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
      file: string
    }) => {
      generatedOptions.push(options)
      return createMockGeneratorCssResult('.i-mdi-home{display:inline-block}', 4)
    })

    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const context = createContext({
      generator: {
        target: 'web',
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              cssSources: [
                {
                  file: mainSourceFile,
                  base: path.dirname(mainSourceFile),
                  css: mainRawSource,
                  dependencies: [configFile],
                },
                {
                  file: subSourceFile,
                  base: path.dirname(subSourceFile),
                  css: subRawSource,
                  dependencies: [subConfigFile],
                },
              ],
            },
          },
        },
      },
    })
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/build/h5' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      recordGeneratorCandidates: vi.fn(),
    })

    const bundle = {
      'assets/index-A1B2C3.css': {
        ...createRollupAsset([
          '@media source(none){/*! weapp-tailwindcss generator-placeholder */}',
          '@config "../tailwind.config.js";',
          '@source "../src/**/*.{vue,js,ts,jsx,tsx,html}";',
          '@source not "../src/sub/**/*";',
          '@custom-variant system-dark{ @media (prefers-color-scheme: dark){ @slot; } }',
          '@theme{--color-midnight:#121063}',
          '@layer components{.layer-card-v4{display:flex}}',
          '.site-card{display:grid}',
        ].join('')),
        fileName: 'assets/index-A1B2C3.css',
        originalFileNames: ['index.html'],
      },
      'index.html': {
        ...createRollupAsset('<!DOCTYPE html><html><head></head><body></body></html>'),
        fileName: 'index.html',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {} as any, bundle)

    expect(generateCssByGeneratorMock).toHaveBeenCalledTimes(1)
    expect(generatedOptions[0]).toEqual(expect.objectContaining({
      file: mainSourceFile,
      rawSource: mainRawSource,
    }))
    expect((bundle['assets/index-A1B2C3.css'] as OutputAsset).source.toString()).toContain('.i-mdi-home{display:inline-block}')
  }, TEST_TIMEOUT_MS)

  it('resolves renamed mini-program Tailwind v4 css assets from configured source fingerprints', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-mini-renamed-css-source-'))
    createdDirs.push(root)
    const normalSourceFile = path.join(root, 'src/sub-normal/pages/index.css')
    const independentSourceFile = path.join(root, 'src/sub-independent/pages/index.css')
    const normalConfigFile = path.join(root, 'tailwind.config.sub-normal.js')
    const independentConfigFile = path.join(root, 'tailwind.config.sub-independent.js')
    await mkdir(path.dirname(normalSourceFile), { recursive: true })
    await mkdir(path.dirname(independentSourceFile), { recursive: true })
    await writeFile(normalConfigFile, 'module.exports = { content: ["./src/sub-normal/**/*.{tsx,jsx}"] }\n', 'utf8')
    await writeFile(independentConfigFile, 'module.exports = { content: ["./src/sub-independent/**/*.{tsx,jsx}"] }\n', 'utf8')

    const normalRawSource = [
      '@import "tailwindcss" source(none);',
      '@config "../../../tailwind.config.sub-normal.js";',
      '@source "./**/*.{tsx,jsx}";',
      '@theme { --color-normal-subpackage-marker: #1677ff; }',
      '.bg-normal-subpackage-marker{background-color:var(--color-normal-subpackage-marker)}',
    ].join('\n')
    const independentRawSource = [
      '@import "tailwindcss" source(none);',
      '@config "../../../tailwind.config.sub-independent.js";',
      '@source "./**/*.{tsx,jsx}";',
      '@theme { --color-independent-subpackage-marker: #13c2c2; }',
      '.bg-independent-subpackage-marker{background-color:var(--color-independent-subpackage-marker)}',
    ].join('\n')
    await writeFile(normalSourceFile, normalRawSource, 'utf8')
    await writeFile(independentSourceFile, independentRawSource, 'utf8')

    const runtimeSet = new Set(['bg-normal-subpackage-marker', 'bg-independent-subpackage-marker'])
    const generatedOptions: Array<{ rawSource: string, file: string }> = []
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
      file: string
    }) => {
      generatedOptions.push(options)
      const marker = options.rawSource.includes('sub-independent')
        ? '.bg-independent-subpackage-marker{background-color:#13c2c2}'
        : '.bg-normal-subpackage-marker{background-color:#1677ff}'
      return createMockGeneratorCssResult(marker, 4)
    })

    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
          projectRoot: root,
          base: root,
          baseFallbacks: [],
          css: '@import "tailwindcss" source(none);',
          dependencies: [],
        })),
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const context = createContext({
      appType: 'taro',
      cssMatcher: (file: string) => file.endsWith('.acss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.acss' || file === 'app-origin.acss'),
      tailwindcssBasedir: root,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              cssSources: [
                {
                  file: normalSourceFile,
                  base: path.dirname(normalSourceFile),
                  css: normalRawSource,
                  dependencies: [normalConfigFile],
                },
                {
                  file: independentSourceFile,
                  base: path.dirname(independentSourceFile),
                  css: independentRawSource,
                  dependencies: [independentConfigFile],
                },
              ],
            },
          },
        },
      },
    })
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/alipay' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      getSourceCandidateSource: () => undefined,
      getSourceCandidateSources: () => [],
      getSourceCandidateSourcesForEntries: () => [],
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      recordGeneratorCandidates: vi.fn(),
    })

    const bundle = {
      'app.json': {
        ...createRollupAsset(JSON.stringify({
          pages: ['pages/index/index'],
          subPackages: [
            { root: 'sub-normal', pages: ['pages/index'] },
            { root: 'sub-independent', pages: ['pages/index'] },
          ],
        })),
        fileName: 'app.json',
      },
      'sub-normal/pages/index.css': {
        ...createRollupAsset([
          '@media source(none){/*! weapp-tailwindcss generator-placeholder */}',
          '@config "../../../tailwind.config.sub-normal.js";',
          '@source "./**/*.{tsx,jsx}";',
          '@theme{--color-normal-subpackage-marker:#1677ff}',
          '.bg-normal-subpackage-marker{background-color:var(--color-normal-subpackage-marker)}',
        ].join('')),
        fileName: 'index.css',
        originalFileNames: ['index.css'],
      },
      'sub-independent/pages/index.css': {
        ...createRollupAsset([
          '@media source(none){/*! weapp-tailwindcss generator-placeholder */}',
          '@config "../../../tailwind.config.sub-independent.js";',
          '@source "./**/*.{tsx,jsx}";',
          '@theme{--color-independent-subpackage-marker:#13c2c2}',
          '.bg-independent-subpackage-marker{background-color:var(--color-independent-subpackage-marker)}',
        ].join('')),
        fileName: 'index2.css',
        originalFileNames: ['index2.css'],
      },
      'sub-normal/pages/index.acss': {
        ...createRollupAsset(''),
        fileName: 'sub-normal/pages/index.acss',
      },
      'sub-independent/pages/index.acss': {
        ...createRollupAsset(''),
        fileName: 'sub-independent/pages/index.acss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {} as any, bundle)

    expect(generateCssByGeneratorMock).toHaveBeenCalledTimes(2)
    expect(generatedOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        file: normalSourceFile,
        rawSource: normalRawSource,
      }),
      expect.objectContaining({
        file: independentSourceFile,
        rawSource: independentRawSource,
      }),
    ]))
    expect((bundle['sub-normal/pages/index.acss'] as OutputAsset).source.toString()).toContain('.bg-normal-subpackage-marker{background-color:#1677ff}')
    expect((bundle['sub-normal/pages/index.acss'] as OutputAsset).source.toString()).not.toContain('.bg-independent-subpackage-marker')
    expect((bundle['sub-independent/pages/index.acss'] as OutputAsset).source.toString()).toContain('.bg-independent-subpackage-marker{background-color:#13c2c2}')
    expect((bundle['sub-independent/pages/index.acss'] as OutputAsset).source.toString()).not.toContain('.bg-normal-subpackage-marker')
  }, TEST_TIMEOUT_MS)

  it('does not share css transform results for identical assets with relative urls', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect((bundle['pages/a/index.css'] as OutputAsset).source).toBe(`css:${css}`)
    expect((bundle['pages/a/detail.css'] as OutputAsset).source).toBe(`css:${css}`)
  }, TEST_TIMEOUT_MS)

  it('reuses template handler options for multiple html assets in one bundle pass', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const runtimeSet = new Set(['flex', escapedGap])
    const appRoot = path.resolve(process.cwd(), 'apps/issue-814-tw4')
    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
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

    const transformedWxml = (bundle['index.wxml'] as OutputAsset).source.toString()
    const transformedJs = (bundle['index.js'] as OutputChunk).code

    expect(transformedWxml).toContain(escapedGap)
    expect(transformedJs).toContain(escapedGap)
    expect(transformedJs).not.toContain('gap-[20px]')
  }, TEST_TIMEOUT_MS)

  it('fixes issue #814 in tw4 fixture when cwd is workspace root and build root points to app root', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const workspaceRoot = path.resolve(process.cwd())
    const appRoot = path.resolve(workspaceRoot, 'apps/issue-814-tw4')
    const emptySet = new Set<string>()
    const issueSet = new Set(['flex', 'gap-[20px]'])

    const initialRuntime = {
      getClassSet: vi.fn(async () => emptySet),
      getClassSetSync: vi.fn(() => emptySet),
      extract: vi.fn(async () => ({ classSet: emptySet })),
      majorVersion: 4,
    }
    const refreshedRuntime = {
      getClassSet: vi.fn(async () => issueSet),
      getClassSetSync: vi.fn(() => issueSet),
      extract: vi.fn(async () => ({ classSet: issueSet })),
      majorVersion: 4,
    }
    const refreshTailwindcssRuntime = vi.fn(async () => refreshedRuntime)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssRuntime,
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
        jsArbitraryValueFallback: false,
      }),
      tailwindRuntime: initialRuntime,
    }))

    const plugins = WeappTailwindcss()
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

    const transformedWxml = (bundle['index.wxml'] as OutputAsset).source.toString()
    const transformedJs = (bundle['index.js'] as OutputChunk).code

    expect(refreshTailwindcssRuntime).toHaveBeenCalled()
    expect(transformedWxml).toContain(escapedGap)
    expect(transformedJs).toContain(escapedGap)
    expect(transformedJs).not.toContain('gap-[20px]')
  }, TEST_TIMEOUT_MS)

  it('captures issue #814 fault mode when jsPreserveClass keeps gap candidate untouched', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const runtimeSet = new Set(['flex', 'gap-[20px]'])
    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
        jsPreserveClass: keyword => keyword === 'gap-[20px]',
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
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

    const transformedJs = (bundle['index.js'] as OutputChunk).code
    expect(transformedJs).toContain('gap-[20px]')
    expect(transformedJs).not.toContain(escapedGap)
  }, TEST_TIMEOUT_MS)

  it('aligns implicit tailwindcss basedir to vite root before bundle processing', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const workspaceRoot = path.resolve(process.cwd())
    const appRoot = path.resolve(workspaceRoot, 'apps/issue-814-tw4')
    const runtimeSet = new Set(['flex', 'gap-[20px]'])
    const refreshedRuntime = {
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 4,
    }
    const refreshTailwindcssRuntime = vi.fn(async () => refreshedRuntime)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssRuntime,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: appRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(getCurrentContext().tailwindcssBasedir).toBe(appRoot)
    expect(refreshTailwindcssRuntime).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('prefers the nearest tailwind config root when vite root points to a source subdirectory', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const workspaceRoot = path.resolve(__dirname, '../../..')
    const fixtureRoot = path.resolve(__dirname, '../fixtures/vite')
    const viteRoot = path.join(fixtureRoot, 'src')
    const refreshTailwindcssRuntime = vi.fn(async () => getCurrentContext().tailwindRuntime)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssRuntime,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: viteRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(getCurrentContext().tailwindcssBasedir).toBe(fixtureRoot)
    expect(refreshTailwindcssRuntime).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('keeps explicit tailwindcss basedir unchanged on configResolved', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const workspaceRoot = path.resolve(process.cwd())
    const appRoot = path.resolve(workspaceRoot, 'apps/issue-814-tw4')
    const refreshTailwindcssRuntime = vi.fn(async () => getCurrentContext().tailwindRuntime)

    setCurrentContext(createContext({
      tailwindcssBasedir: workspaceRoot,
      refreshTailwindcssRuntime,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss({
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
    expect(refreshTailwindcssRuntime).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps non-set business literals unchanged in serve mode while preserving classNameSet-only strategy', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set(['text-red-500'])
    setCurrentContext(createContext({
      jsPreserveClass: (keyword: string) => keyword.startsWith('biz-token'),
      jsHandler: createJsHandler({
        jsPreserveClass: (keyword: string) => keyword.startsWith('biz-token'),
      }),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
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
    const runtimeSet = new Set(['text-red-500'])
    const context = createContext({
      jsHandler: createJsHandler({}),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    })
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root: process.cwd(),
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => new Set<string>(),
      getSourceCandidatesForEntries: () => new Set<string>(),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => new Map(),
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })
    const bundle = {
      'index.js': createRollupChunk(`
const trace = "at App.vue:4"
const cls = "w-[1.5px]"
`),
    }
    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const transformedCode = (bundle['index.js'] as OutputChunk).code
    expect(transformedCode).toContain('at App.vue:4')
    expect(transformedCode).toContain('w-[1.5px]')
    expect(transformedCode).not.toContain(replaceWxml('w-[1.5px]'))
  }, TEST_TIMEOUT_MS)

  it('only transforms dirty js entry and affected linked entries on incremental runs', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      jsHandler: vi.fn((code: string) => ({ code: `js:${code}` })),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: code
          .replace(/\*,\s*::before,\s*::after/g, 'view,text,::before,::after')
          .replaceAll('border-emerald-200\\/70', '_f70'),
      })),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    expect(firstCss).toMatch(/view,text,::(?:before|after),::(?:before|after)/)
    expect(firstCss).toContain('.border-emerald-200_f70')
    expect(firstCss).not.toContain('*,::before,::after')
    expect(firstCss).not.toContain('border-emerald-200\\/70')
    vi.mocked(currentContext.styleHandler).mockClear()

    const secondBundle = {
      'index.js': createRollupChunk('const sss = "border-emerald-300/70"'),
      'index.css': {
        ...createRollupAsset(rawCss),
        fileName: 'index.css',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const secondCss = (secondBundle['index.css'] as OutputAsset).source.toString()
    expect(secondCss).toMatch(/view,text,::(?:before|after),::(?:before|after)/)
    expect(secondCss).toContain('.border-emerald-300_f70')
    expect(secondCss).not.toContain('*,::before,::after')
    expect(secondCss).not.toContain('border-emerald-200\\/70')
    expect(secondCss).not.toContain('border-emerald-300\\/70')
    expect(secondCss).not.toBe(firstCss)
  }, TEST_TIMEOUT_MS)

  it('reapplies cached css transform when css formatting changes only', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: code
          .replace(/\*,\s*::before,\s*::after/g, 'view,text,::before,::after')
          .replaceAll('border-emerald-200\\/70', '_f70'),
      })),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
    expect(transformedCss).toMatch(/view,text,::(?:before|after),::(?:before|after)/)
    expect(transformedCss).toContain('.border-emerald-200_f70')
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('shares non-main css transform results for identical assets in the same bundle round', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: `shared:${code}`,
      })),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      cssMatcher: (file: string) => file.endsWith('.wxss'),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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

  it('replays clean css results when only script candidates change in incremental runs', async () => {
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates),
      rawCandidates: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4Source: vi.fn(async (options: { base?: string, css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: options.base ?? process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    const forceRuntimeRefresh = process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
    process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] = '1'
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: `style:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = (js: string) => ({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="text-[#111111]"></view>'),
        fileName: 'pages/index/index.wxml',
      },
      'pages/index/index.js': {
        ...createRollupChunk(js),
        fileName: 'pages/index/index.js',
      },
      'app.wxss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.wxss',
      },
      'pages/a.wxss': {
        ...createRollupAsset('.card{color:red}'),
        fileName: 'pages/a.wxss',
      },
      'pages/b.wxss': {
        ...createRollupAsset('.card{color:red}'),
        fileName: 'pages/b.wxss',
      },
    })

    runtimeSet.add('text-[#111111]')
    const firstBundle = createBundle('const color = "text-[#111111]"')
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstAppCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()
    const firstPageCss = (firstBundle['pages/a.wxss'] as OutputAsset).source.toString()
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)

    currentContext.styleHandler.mockClear()
    generateMock.mockClear()

    runtimeSet.delete('text-[#111111]')
    runtimeSet.add('text-[#222222]')
    const secondBundle = createBundle('const color = "text-[#222222]"')
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expect((secondBundle['app.wxss'] as OutputAsset).source.toString()).not.toBe(firstAppCss)
    expect((secondBundle['app.wxss'] as OutputAsset).source.toString()).toContain('text-[#222222]')
    expect((secondBundle['pages/a.wxss'] as OutputAsset).source.toString()).toBe(firstPageCss)
    expect((secondBundle['pages/b.wxss'] as OutputAsset).source.toString()).toBe(firstPageCss)
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('regenerates remembered vite pipeline main css when only script candidates change', async () => {
    const generateMock = vi.fn(async (options: { candidates: Set<string>, css: string }) => ({
      css: `${options.css}\n${[...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n')}`,
      rawCss: `${options.css}\n${[...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n')}`,
      target: 'weapp',
      classSet: new Set(options.candidates),
      rawCandidates: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async (options: { css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4Source: vi.fn(async (options: { css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
    }))
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: vi.fn(async (options: { runtime: Set<string> }) => {
          const result = await generateMock({ candidates: options.runtime })
          return {
            css: result.css,
            rawCss: result.rawCss,
            target: result.target,
            classSet: result.classSet,
            rawCandidates: result.rawCandidates,
            dependencies: result.dependencies,
            sources: result.sources,
            root: result.root,
            version: result.version,
          }
        }),
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: `style:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const transform = getTransformHandler(postPlugin)
    const sourceCss = '@import "tailwindcss";'
    const sourceFile = path.resolve(process.cwd(), 'src/app.css')
    const appOriginCss = `${createBundlerGeneratedCssMarker('vite', sourceFile)}
/*! tailwindcss v4.3.0 | MIT License | https://tailwindcss.com */`
    runtimeSet.add('text-[#111111]')
    await transform?.call({ addWatchFile: vi.fn() } as any, sourceCss, sourceFile)
    const firstBundle = {
      'pages/index/index.js': {
        ...createRollupChunk('const color = "text-[#111111]"'),
        fileName: 'pages/index/index.js',
      },
      'app-origin.wxss': {
        ...createRollupAsset(appOriginCss),
        fileName: 'app-origin.wxss',
        originalFileNames: [sourceFile],
      },
      'app.wxss': {
        ...createRollupAsset('@import "app-origin.wxss";'),
        fileName: 'app.wxss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    generateMock.mockClear()
    runtimeSet.delete('text-[#111111]')
    runtimeSet.add('text-[#222222]')
    const secondBundle = {
      'pages/index/index.js': {
        ...createRollupChunk('const color = "text-[#222222]"'),
        fileName: 'pages/index/index.js',
      },
      'app-origin.wxss': {
        ...createRollupAsset(appOriginCss),
        fileName: 'app-origin.wxss',
        originalFileNames: [sourceFile],
      },
      'app.wxss': {
        ...createRollupAsset('@import "app-origin.wxss";'),
        fileName: 'app.wxss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const nextAppCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()
    const nextAppOriginCss = (secondBundle['app-origin.wxss'] as OutputAsset).source.toString()
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(nextAppCss).toContain('@import "app-origin.wxss";')
    expect(nextAppCss).not.toContain('text-[#222222]')
    expect(nextAppOriginCss).toContain('text-[#222222]')
    expect(nextAppOriginCss).not.toContain('text-[#111111]')
  }, TEST_TIMEOUT_MS)

  it('replays updated vite pipeline main css into uni-app dev app.wxss', async () => {
    const localCandidates = (candidates: Set<string>) =>
      new Set([...candidates].filter(candidate => /^text-\[\d+\.\d+rpx\]$/.test(candidate)))
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...localCandidates(options.candidates)].sort().map((candidate) => {
        const fontSize = candidate.match(/^text-\[(.+)\]$/)?.[1] ?? '0rpx'
        return `.${replaceWxml(candidate)}{font-size:${fontSize}}`
      }).join('\n'),
      rawCss: [...localCandidates(options.candidates)].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: localCandidates(options.candidates),
      rawCandidates: localCandidates(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.resetModules()
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4Source: vi.fn(async (options: { base?: string, css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: options.base ?? process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-app-wxss-replay-'))
    createdDirs.push(root)
    const runtimeSet = new Set<string>()
    const forceRuntimeRefresh = process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
    process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] = '1'
    setCurrentContext(createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss' || file === 'src/tailwind.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
      plugins: [{ name: 'vite:uni' }],
    } as ResolvedConfig)
    await (serveGeneratePlugin.configResolved as any)?.call(serveGeneratePlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
      plugins: [{ name: 'vite:uni' }],
    } as ResolvedConfig)

    const transform = getTransformHandler(serveGeneratePlugin)
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const cssSourceFile = path.resolve(root, 'src/main.css')
    const cssSource = '@import "tailwindcss" source(none);\n@source "../src/**/*.{vue,js,ts}";'

    try {
      runtimeSet.add('text-[102.43rpx]')
      await transform?.call({ addWatchFile: vi.fn() } as any, cssSource, cssSourceFile)

      const firstBundle = {
        'src/main.wxss': {
          ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', cssSourceFile)}\n.${replaceWxml('text-[102.43rpx]')}{font-size:102.43rpx}`),
          fileName: 'src/main.wxss',
          originalFileNames: [cssSourceFile],
        },
        'app.wxss': {
          ...createRollupAsset(''),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, firstBundle)
      const firstAppCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()
      expect(firstAppCss).toContain(replaceWxml('text-[102.43rpx]'))
      expect(firstAppCss).toContain('102.43rpx')

      runtimeSet.clear()
      runtimeSet.add('text-[103.43rpx]')
      await (sourcePlugin.handleHotUpdate as any)?.call(sourcePlugin, {
        file: path.resolve(process.cwd(), 'src/pages/index/index.vue'),
        modules: [],
        server: {
          moduleGraph: {
            getModuleById: vi.fn(),
            getModulesByFile: vi.fn(() => []),
            invalidateModule: vi.fn(),
          },
          ws: { send: vi.fn() },
        },
        timestamp: Date.now(),
      } as unknown as HmrContext)

      const secondBundle = {
        'pages/index/index.wxml': {
          ...createRollupAsset(`<view class="${replaceWxml('text-[103.43rpx]')}"></view>`),
          fileName: 'pages/index/index.wxml',
        },
        'app.wxss': {
          ...createRollupAsset(firstAppCss),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, secondBundle)
      const secondAppCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()
      expect(secondAppCss).toContain(replaceWxml('text-[103.43rpx]'))
      expect(secondAppCss).toContain('103.43rpx')
      expect(secondAppCss).not.toContain(replaceWxml('text-[104.43rpx]'))

      runtimeSet.clear()
      runtimeSet.add('text-[104.43rpx]')
      const thirdBundle = {
        'pages/index/index.wxml': {
          ...createRollupAsset(`<view class="${replaceWxml('text-[104.43rpx]')}"></view>`),
          fileName: 'pages/index/index.wxml',
        },
        'app.wxss': {
          ...createRollupAsset(firstAppCss),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, thirdBundle)
      const thirdAppCss = (thirdBundle['app.wxss'] as OutputAsset).source.toString()
      expect(thirdAppCss).toContain(replaceWxml('text-[104.43rpx]'))
      expect(thirdAppCss).toContain('104.43rpx')
      expect(thirdAppCss).not.toContain(replaceWxml('text-[103.43rpx]'))
    }
    finally {
      if (forceRuntimeRefresh === undefined) {
        delete process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
      }
      else {
        process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] = forceRuntimeRefresh
      }
    }
  }, TEST_TIMEOUT_MS)

  it('refreshes uni-app dev app.wxss from script-only escaped v4 hmr candidates without force refresh env', async () => {
    const localCandidates = (candidates: Set<string>) =>
      new Set([...candidates].filter(candidate => /^text-\[\d+\.\d+rpx\]$/.test(candidate)))
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...localCandidates(options.candidates)].sort().map((candidate) => {
        const fontSize = candidate.match(/^text-\[(.+)\]$/)?.[1] ?? '0rpx'
        return `.${replaceWxml(candidate)}{font-size:${fontSize}}`
      }).join('\n'),
      rawCss: [...localCandidates(options.candidates)].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: localCandidates(options.candidates),
      rawCandidates: localCandidates(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.resetModules()
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4Source: vi.fn(async (options: { base?: string, css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: options.base ?? process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-app-wxss-script-replay-'))
    createdDirs.push(root)
    const runtimeSet = new Set<string>()
    const forceRuntimeRefresh = process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
    delete process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
    setCurrentContext(createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss' || file === 'src/tailwind.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
      plugins: [{ name: 'vite:uni' }],
    } as ResolvedConfig)

    const transform = getTransformHandler(serveGeneratePlugin)
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const cssSourceFile = path.resolve(root, 'src/main.css')
    const cssSource = '@import "tailwindcss" source(none);\n@source "../src/**/*.{vue,js,ts}";'

    try {
      runtimeSet.add('text-[102.43rpx]')
      await transform?.call({ addWatchFile: vi.fn() } as any, cssSource, cssSourceFile)

      const firstBundle = {
        'pages/index/index.js': {
          ...createRollupChunk(`const className = ref("${replaceWxml('text-[102.43rpx]')}")`),
          fileName: 'pages/index/index.js',
        },
        'src/main.wxss': {
          ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', cssSourceFile)}\n.${replaceWxml('text-[102.43rpx]')}{font-size:102.43rpx}`),
          fileName: 'src/main.wxss',
          originalFileNames: [cssSourceFile],
        },
        'app.wxss': {
          ...createRollupAsset(''),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, firstBundle)
      const firstAppCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()
      expect(firstAppCss).toContain(replaceWxml('text-[102.43rpx]'))

      runtimeSet.clear()
      runtimeSet.add('text-[103.43rpx]')
      const secondBundle = {
        'pages/index/index.js': {
          ...createRollupChunk(`const className = ref("${replaceWxml('text-[103.43rpx]')}")`),
          fileName: 'pages/index/index.js',
        },
        'app.wxss': {
          ...createRollupAsset(firstAppCss),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, secondBundle)
      const secondAppCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()
      expect(generateMock.mock.calls.some(call =>
        (call[0].candidates as Set<string>).has('text-[103.43rpx]'),
      )).toBe(true)
      expect(secondAppCss).toContain(replaceWxml('text-[103.43rpx]'))
      expect(secondAppCss).toContain('103.43rpx')
      expect(secondAppCss).not.toContain(replaceWxml('text-[104.43rpx]'))
    }
    finally {
      if (forceRuntimeRefresh === undefined) {
        delete process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
      }
      else {
        process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] = forceRuntimeRefresh
      }
    }
  }, TEST_TIMEOUT_MS)

  it('replays uni-app v3 Tailwind entry css into app.wxss after rollback candidates change', async () => {
    const preflight = 'view,text,::after,::before{box-sizing:border-box;margin:0;padding:0;border:0 solid;}'
    const reorderedPreflight = 'view,text,::after,::before{margin:0;border:0 solid;padding:0;box-sizing:border-box;}'
    const wrapGeneratedCss = (utilities: string, baseCss = preflight) => `${baseCss}
${utilities}
/*! weapp-tailwindcss layer components start */
.tw-watch-layer{color:red}
/*! weapp-tailwindcss layer components end */`
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: wrapGeneratedCss([...options.candidates].sort().map(candidate => `.${replaceWxml(candidate)}{background:${candidate}}`).join('\n')),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates),
      rawCandidates: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    const forceRuntimeRefresh = process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
    process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] = '1'
    setCurrentContext(createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss' || file === 'src/tailwind.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
      plugins: [{ name: 'vite:uni' }],
    } as ResolvedConfig)

    const transform = getTransformHandler(serveGeneratePlugin)
    const generateBundle = getGenerateBundleHandler(postPlugin)
    const cssSourceFile = path.resolve(process.cwd(), 'src/tailwind.scss')
    const cssSource = '@use "tailwindcss/base";\n@use "tailwindcss/components";\n@use "tailwindcss/utilities";'

    try {
      runtimeSet.add('bg-[red]')
      await transform?.call({ addWatchFile: vi.fn() } as any, cssSource, cssSourceFile)
      const firstGeneratedCss = `${createBundlerGeneratedCssMarker('vite', cssSourceFile)}\n${wrapGeneratedCss(`.${replaceWxml('bg-[red]')}{background:bg-[red]}`)}`

      const firstBundle = {
        'pages/index/index.js': {
          ...createRollupChunk(`const card = "${replaceWxml('bg-[red]')}"`),
          fileName: 'pages/index/index.js',
        },
        'src/tailwind.wxss': {
          ...createRollupAsset(firstGeneratedCss ?? ''),
          fileName: 'src/tailwind.wxss',
          originalFileNames: [cssSourceFile],
        },
        'app.wxss': {
          ...createRollupAsset(''),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, firstBundle)
      const firstAppCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()
      expect(firstAppCss).toContain(replaceWxml('bg-[red]'))

      runtimeSet.clear()
      runtimeSet.add('bg-[#4268EA]')
      await (sourcePlugin.handleHotUpdate as any)?.call(sourcePlugin, {
        file: path.resolve(process.cwd(), 'src/pages/index/index.vue'),
        modules: [],
        server: {
          moduleGraph: {
            getModuleById: vi.fn(),
            getModulesByFile: vi.fn(() => []),
            invalidateModule: vi.fn(),
          },
          ws: { send: vi.fn() },
        },
        timestamp: Date.now(),
      } as unknown as HmrContext)
      const rollbackBundle = {
        'pages/index/index.js': {
          ...createRollupChunk(`const card = "${replaceWxml('bg-[#4268EA]')}"`),
          fileName: 'pages/index/index.js',
        },
        'src/tailwind.wxss': {
          ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', cssSourceFile)}\n${wrapGeneratedCss(`.${replaceWxml('bg-[#4268EA]')}{background:bg-[#4268EA]}`, reorderedPreflight)}`),
          fileName: 'src/tailwind.wxss',
          originalFileNames: [cssSourceFile],
        },
        'app.wxss': {
          ...createRollupAsset(firstAppCss),
          fileName: 'app.wxss',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, rollbackBundle)
      const rollbackAppCss = (rollbackBundle['app.wxss'] as OutputAsset).source.toString()
      expect(rollbackAppCss).toContain(replaceWxml('bg-[#4268EA]'))
      expect(rollbackAppCss.match(/box-sizing:border-box/g) ?? []).toHaveLength(1)
    }
    finally {
      if (forceRuntimeRefresh === undefined) {
        delete process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH']
      }
      else {
        process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] = forceRuntimeRefresh
      }
    }
  }, TEST_TIMEOUT_MS)

  it('regenerates custom uni-app v3 Tailwind entry css when a Vue template adds a new arbitrary class', async () => {
    const createCss = (candidates: Set<string>) => [...candidates]
      .sort()
      .map(candidate => `.${replaceWxml(candidate)}{font-size:${candidate === 'text-[123rpx]' ? '123rpx' : '48rpx'}}`)
      .join('\n')
    const generateMock = vi.fn(async (source: { css: string }) => ({
      css: createCss(currentCandidates),
      rawCss: source.css,
      target: 'weapp',
      classSet: new Set(currentCandidates),
      rawCandidates: new Set(currentCandidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
          generate: vi.fn(async () => generateMock(source)),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,      }
    })

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-uni-v3-template-hmr-'))
    createdDirs.push(root)
    const styleEntryFile = path.join(root, 'src/styles/tw-entry.vue')
    const pageFile = path.join(root, 'src/components/sections/CapabilityShowcase.vue')
    await mkdir(path.dirname(styleEntryFile), { recursive: true })
    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(styleEntryFile, [
      '<template><view /></template>',
      '<style lang="scss">',
      '@use "tailwindcss/base";',
      '@use "tailwindcss/components";',
      '@use "tailwindcss/utilities";',
      '</style>',
    ].join('\n'), 'utf8')
    await writeFile(pageFile, '<template><view class="text-2xl font-semibold"></view></template>', 'utf8')

    let currentCandidates = new Set(['text-2xl'])
    setCurrentContext(createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'shell.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(currentCandidates)),
        getClassSetSync: vi.fn(() => new Set(currentCandidates)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(currentCandidates) })),
        getContexts: vi.fn(() => [{
          userConfig: { content: ['./src/**/*.{html,js,ts,jsx,tsx,vue}'] },
          tailwindConfig: { content: ['./src/**/*.{html,js,ts,jsx,tsx,vue}'] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    const serveGeneratePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()
    expect(serveGeneratePlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
      plugins: [{ name: 'vite:uni' }],
    } as ResolvedConfig)

    const styleSource = '@use "tailwindcss/base";\n@use "tailwindcss/components";\n@use "tailwindcss/utilities";'
    await getTransformHandler(sourcePlugin)?.call(sourcePlugin, await readFile(pageFile, 'utf8'), pageFile)
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const firstBundle = {
      'components/sections/CapabilityShowcase.wxml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-2xl')} font-semibold"></view>`),
        fileName: 'components/sections/CapabilityShowcase.wxml',
      },
      'shell.wxss': {
        ...createRollupAsset('@import "./styles/tw-entry.wxss";'),
        fileName: 'shell.wxss',
      },
      'styles/tw-entry.wxss': {
        ...createRollupAsset(styleSource),
        fileName: 'styles/tw-entry.wxss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstEntryCss = (firstBundle['styles/tw-entry.wxss'] as OutputAsset).source.toString()
    expect(firstEntryCss).toContain('.text-2xl')
    expect(firstEntryCss).not.toContain(replaceWxml('text-[123rpx]'))

    currentCandidates = new Set(['text-[123rpx]'])
    await writeFile(pageFile, '<template><view class="text-[123rpx] font-semibold"></view></template>', 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, pageFile, { event: 'update' })
    await (sourcePlugin.buildStart as any)?.call(sourcePlugin)

    const secondBundle = {
      'components/sections/CapabilityShowcase.wxml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-[123rpx]')} font-semibold"></view>`),
        fileName: 'components/sections/CapabilityShowcase.wxml',
      },
      'shell.wxss': {
        ...createRollupAsset('@import "./styles/tw-entry.wxss";'),
        fileName: 'shell.wxss',
      },
      'styles/tw-entry.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', path.join(root, 'src/styles/tw-entry.vue?vue&type=style&index=0&lang.scss'))}\n${firstEntryCss}`),
        fileName: 'styles/tw-entry.wxss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    const secondEntryCss = (secondBundle['styles/tw-entry.wxss'] as OutputAsset).source.toString()
    expect(secondEntryCss).toContain(replaceWxml('text-[123rpx]'))
    expect(secondEntryCss).toContain('123rpx')
  }, TEST_TIMEOUT_MS)

  it('regenerates remembered uni-app v3 app.wxss when only component template candidates change', async () => {
    const createCss = (candidates: Set<string>) => [...candidates]
      .sort()
      .map(candidate => `.${replaceWxml(candidate)}{font-size:${candidate === 'text-[123rpx]' ? '123rpx' : '24px'}}`)
      .join('\n')
    const generateCssByGeneratorMock = vi.fn(async (options: { runtime: Set<string>, rawSource: string }) => ({
      css: createCss(options.runtime),
      rawCss: options.rawSource,
      target: 'weapp',
      classSet: new Set(options.runtime),
      rawCandidates: new Set(options.runtime),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-uni-v3-app-hmr-'))
    createdDirs.push(root)
    const appFile = path.join(root, 'src/App.vue')
    await mkdir(path.dirname(appFile), { recursive: true })
    await writeFile(appFile, '<style>\n@tailwind utilities;\n</style>', 'utf8')

    let currentCandidates = new Set(['text-2xl'])
    const context = createContext({
      appType: 'uni-app-vite',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(currentCandidates)),
        getClassSetSync: vi.fn(() => new Set(currentCandidates)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(currentCandidates) })),
        getContexts: vi.fn(() => [{
          userConfig: { content: ['./src/**/*.{html,js,ts,jsx,tsx,vue}'] },
          tailwindConfig: { content: ['./src/**/*.{html,js,ts,jsx,tsx,vue}'] },
        }]),
      },
    })
    const appStyleFile = `${appFile}?vue&type=style&index=0&lang.css`
    const appStyleSource = '@tailwind utilities;'
    const rememberedCssSources = new Map([
      ['app.wxss', {
        outputFile: 'app.wxss',
        rawSource: appStyleSource,
        sourceFile: appStyleFile,
      }],
    ])
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => currentCandidates),
      ensureBundleRuntimeClassSet: vi.fn(async () => currentCandidates),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [{ name: 'vite:uni' }],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => true),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => currentCandidates,
      getSourceCandidatesForEntries: () => currentCandidates,
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      getRememberedCssSources: () => rememberedCssSources,
      recordGeneratorCandidates: vi.fn(),
    })
    const firstBundle = {
      'components/sections/CapabilityShowcase.wxml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-2xl')} font-semibold"></view>`),
        fileName: 'components/sections/CapabilityShowcase.wxml',
      },
      'app.wxss': {
        ...createRollupAsset(`${createBundlerGeneratedCssMarker('vite', appFile)}\n${appStyleSource}`),
        fileName: 'app.wxss',
        originalFileNames: [appStyleFile],
      },
    }
    await generateBundle.call({ addWatchFile: vi.fn() }, {}, firstBundle)
    const firstAppCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()

    currentCandidates = new Set(['text-[123rpx]'])
    const secondBundle = {
      'components/sections/CapabilityShowcase.wxml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-[123rpx]')} font-semibold"></view>`),
        fileName: 'components/sections/CapabilityShowcase.wxml',
      },
      'app.wxss': {
        ...createRollupAsset(firstAppCss),
        fileName: 'app.wxss',
        originalFileNames: [appStyleFile],
      },
    }
    await generateBundle.call({ addWatchFile: vi.fn() }, {}, secondBundle)
    const secondAppCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()
    expect(secondAppCss).toContain(replaceWxml('text-[123rpx]'))
    expect(secondAppCss).toContain('font-size:123rpx')
    expect(secondAppCss).not.toContain('.text-2xl')
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime-linked alipay acss when only axml changes', async () => {
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].sort().map(candidate => `.${replaceWxml(candidate)}{}`).join('\n'),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates),
      rawCandidates: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.acss'),
      htmlMatcher: (file: string) => file.endsWith('.axml'),
      mainCssChunkMatcher: vi.fn(() => false),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-alipay' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    runtimeSet.add('text-[20rpx]')
    const firstBundle = {
      'pages/index/index.axml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-[20rpx]')}"></view>`),
        fileName: 'pages/index/index.axml',
      },
      'pages/index/index.acss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'pages/index/index.acss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    runtimeSet.clear()
    runtimeSet.add('text-[123rpx]')
    const secondBundle = {
      'pages/index/index.axml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-[123rpx]')}"></view>`),
        fileName: 'pages/index/index.axml',
      },
      'pages/index/index.acss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'pages/index/index.acss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expect(generateMock).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime-linked toutiao ttss when only ttml changes', async () => {
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => ({
      css: [...options.candidates].sort().map(candidate => `.${replaceWxml(candidate)}{}`).join('\n'),
      rawCss: [...options.candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates),
      rawCandidates: new Set(options.candidates),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.ttss'),
      htmlMatcher: (file: string) => file.endsWith('.ttml'),
      mainCssChunkMatcher: vi.fn(() => false),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-toutiao' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    runtimeSet.add('text-[20rpx]')
    const firstBundle = {
      'pages/index/index.ttml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-[20rpx]')}"></view>`),
        fileName: 'pages/index/index.ttml',
      },
      'pages/index/index.ttss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'pages/index/index.ttss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    runtimeSet.clear()
    runtimeSet.add('text-[123rpx]')
    const secondBundle = {
      'pages/index/index.ttml': {
        ...createRollupAsset(`<view class="${replaceWxml('text-[123rpx]')}"></view>`),
        fileName: 'pages/index/index.ttml',
      },
      'pages/index/index.ttss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'pages/index/index.ttss',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expect(generateMock).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('replays remembered vite pipeline css when source rolls back without css bundle asset', async () => {
    const generateMock = vi.fn(async (source: { css: string }) => ({
      css: `generated:${source.css}`,
      rawCss: `generated:${source.css}`,
      target: 'weapp',
      classSet: new Set<string>(),
      rawCandidates: new Set<string>(),
      dependencies: [],
      sources: [],
      root: null,
      version: 4,
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
        generate: vi.fn(async () => generateMock(source)),
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async (options: { css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4Source: vi.fn(async (options: { css?: string } = {}) => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css ?? '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const servePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:generate:serve') as Plugin
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(servePlugin).toBeTruthy()
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const sourceFile = path.resolve(process.cwd(), 'pages/index/index.css')
    const dirtySource = '@import "tailwindcss";\n.tw-watch-style-case { @apply font-bold; }'
    const cleanSource = '@import "tailwindcss";'
    const createViteProcessedCssAsset = (source: string) =>
      `${createBundlerGeneratedCssMarker('vite', sourceFile)}\n${source}`

    const firstBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(createViteProcessedCssAsset(dirtySource)),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [sourceFile],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()).toContain('.tw-watch-style-case')

    const transform = getTransformHandler(servePlugin)
    await transform?.call(servePlugin, cleanSource, sourceFile)

    generateMock.mockClear()
    const thirdBundle = {
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
    await generateBundle?.call({
      ...postPlugin,
      emitFile(file: { type: 'asset', fileName: string, source: string }) {
        emitted.push(file)
        return file.fileName
      },
    }, {} as any, thirdBundle)

    const replayedCss = emitted.find(file => file.fileName === 'pages/index/index.css')?.source
    expect(generateMock).toHaveBeenCalledTimes(1)
    expect(replayedCss).toContain('generated:@import "tailwindcss";')
    expect(replayedCss).not.toContain('.tw-watch-style-case')
  }, TEST_TIMEOUT_MS)

  it('refreshes remembered vite pipeline css with equivalent style source requests before replay', async () => {
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
    }) => {
      const css = options.rawSource.includes('.tw-watch-style-case')
        ? '.tw-watch-style-case{font-weight:700}'
        : '.clean-style{display:block}'
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-equivalent-style-replay-'))
    createdDirs.push(root)
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    })
    const sourceFile = path.join(root, 'pages/index/index.vue')
    const dirtyStyleRequest = `${sourceFile}?vue&type=style&index=0&lang.scss`
    const cleanStyleRequest = `${sourceFile}?vue&type=style&index=0&lang.scss&used`
    const dirtySource = '.tw-watch-style-case { @apply font-bold; }'
    const cleanSource = '.clean-style { @apply block; }'
    const rememberedCssSources = new Map([
      ['pages/index/index.wxss', {
        outputFile: 'pages/index/index.wxss',
        rawSource: dirtySource,
        sourceFile: dirtyStyleRequest,
      }],
    ])
    const refreshRememberedCssSource = vi.fn(async (remembered: { outputFile: string, rawSource: string, sourceFile: string }) => ({
      ...remembered,
      rawSource: cleanSource,
      sourceFile: cleanStyleRequest,
    }))
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set<string>()),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => new Set<string>(),
      getSourceCandidatesForEntries: () => new Set<string>(),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource,
      getRememberedCssSources: () => rememberedCssSources,
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })

    const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
    const replayBundleTarget = {
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    const replayBundle = new Proxy(replayBundleTarget, {
      set(target, property, value, receiver) {
        if (property === 'pages/index/index.wxss') {
          throw new Error('Rolldown blocks assigning generated css assets to bundle')
        }
        return Reflect.set(target, property, value, receiver)
      },
    })
    await generateBundle.call({
      addWatchFile: vi.fn(),
      emitFile(file: { type: 'asset', fileName: string, source: string }) {
        emitted.push(file)
        return file.fileName
      },
    }, {} as any, replayBundle)

    const replayedCss = emitted.find(file => file.fileName === 'pages/index/index.wxss')?.source
    expect(refreshRememberedCssSource).toHaveBeenCalledTimes(1)
    expect(generateCssByGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: cleanSource,
      file: cleanStyleRequest,
    }))
    expect(replayedCss).toContain('.clean-style')
    expect(replayedCss).not.toContain('.tw-watch-style-case')
    expect(replayBundleTarget['pages/index/index.wxss' as keyof typeof replayBundleTarget]).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('refreshes remembered scss sources outside tailwind content scan on watch change', async () => {
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
    }) => {
      const css = options.rawSource.includes('.tw-watch-style-case')
        ? '.tw-watch-style-case{font-weight:700}'
        : '.clean-style{display:block}'
      return createMockGeneratorCssResult(css)
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-scss-watch-refresh-'))
    createdDirs.push(root)
    const pageDir = path.join(root, 'miniprogram/pages/index')
    await mkdir(pageDir, { recursive: true })
    const sourceFile = path.join(pageDir, 'index.scss')
    const cleanSource = '.clean-style { @apply block; }'
    const dirtySource = '.tw-watch-style-case { @apply font-bold; }'
    await writeFile(sourceFile, cleanSource, 'utf8')
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: ['./miniprogram/**/*.{wxml,js,ts}'] },
          tailwindConfig: { content: ['./miniprogram/**/*.{wxml,js,ts}'] },
        }]),
      },
    })
    setCurrentContext(context)
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(rewritePlugin).toBeTruthy()
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const transform = getTransformHandler(rewritePlugin)
    const firstTransform = await transform?.call(rewritePlugin, cleanSource, sourceFile) as { code: string } | null | undefined
    expect(firstTransform?.code).toContain('.clean-style')

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const firstBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(firstTransform?.code ?? cleanSource),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [sourceFile],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()).toContain('.clean-style')
    expect((firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()).not.toContain('.tw-watch-style-case')

    await writeFile(sourceFile, dirtySource, 'utf8')
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, sourceFile, { event: 'update' })

    generateCssByGeneratorMock.mockClear()
    const secondBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(firstTransform?.code ?? cleanSource),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [sourceFile],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const refreshedCss = (secondBundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    expect(generateCssByGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: dirtySource,
      file: sourceFile,
    }))
    expect(refreshedCss).toContain('.tw-watch-style-case')
    expect(refreshedCss).not.toContain('.clean-style')
  }, TEST_TIMEOUT_MS)

  it.each(VITE_UNIT_CASES)(
    'replays remembered css through emitFile without bundle assignment for Vite $major',
    async ({ major, specifier }) => {
      const vite = await import(specifier) as { version?: string }
      expect(vite.version?.startsWith(`${major}.`)).toBe(true)

      const generateCssByGeneratorMock = vi.fn(async (options: {
        rawSource: string
      }) => createMockGeneratorCssResult(`/* vite ${major} */\n${options.rawSource}`))
      vi.resetModules()
      vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
        return {
          ...actual,
          generateCssByGenerator: generateCssByGeneratorMock,
        }
      })
      vi.doMock('@/generator', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/generator')>()
        return {
          ...actual,
          normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
        }
      })
      const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
      const root = await mkdtemp(path.join(os.tmpdir(), `weapp-tw-vite-${major}-emitfile-`))
      createdDirs.push(root)
      const context = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
        tailwindRuntime: {
          getClassSet: vi.fn(async () => new Set<string>()),
          getClassSetSync: vi.fn(() => new Set<string>()),
          majorVersion: 4,
          extract: vi.fn(async () => ({ classSet: new Set<string>() })),
          getContexts: vi.fn(() => [{
            userConfig: { content: [] },
            tailwindConfig: { content: [] },
          }]),
        },
      })
      const rawSource = '.matrix-style { display: block; }'
      const outputFile = `pages/vite-${major}/index.wxss`
      const rememberedCssSources = new Map([
        [outputFile, {
          outputFile,
          rawSource,
          sourceFile: path.join(root, `pages/vite-${major}/index.css`),
        }],
      ])
      const generateBundle = createGenerateBundleHookWithMock({
        opts: context as any,
        runtimeState: {
          tailwindRuntime: context.tailwindRuntime as any,
          readyPromise: Promise.resolve(),
        },
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        ensureBundleRuntimeClassSet: vi.fn(async () => new Set<string>()),
        debug: vi.fn(),
        getResolvedConfig: () => ({
          command: 'serve',
          plugins: [],
          root,
          css: { postcss: { plugins: [] } },
          build: { outDir: 'dist/dev/mp-weixin' },
        } as unknown as ResolvedConfig),
        markCssAssetProcessed: vi.fn(),
        isCssAssetProcessed: vi.fn(() => false),
        isViteProcessedCssAsset: vi.fn(() => false),
        recordCssAssetResult: vi.fn(),
        recordViteProcessedCssAssetResult: vi.fn(),
        getViteProcessedCssAssetResults: () => [],
        getViteProcessedCssAssetResult: () => undefined,
        getSourceCandidates: () => new Set<string>(),
        getSourceCandidatesForEntries: () => new Set<string>(),
        waitForSourceCandidateSyncs: vi.fn(async () => undefined),
        rememberCssSource: vi.fn(),
        getRememberedCssSources: () => rememberedCssSources,
        getRememberedCssSignature: () => undefined,
        setRememberedCssSignature: vi.fn(),
        recordGeneratorCandidates: vi.fn(),
      })

      const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
      const replayBundleTarget = {
        [`pages/vite-${major}/index.js`]: {
          ...createRollupChunk('console.log("stable")'),
          fileName: `pages/vite-${major}/index.js`,
        },
      }
      const replayBundle = new Proxy(replayBundleTarget, {
        set() {
          throw new Error(`Vite ${major} unit case forbids assigning generated css assets to bundle`)
        },
        defineProperty() {
          throw new Error(`Vite ${major} unit case forbids defining generated css assets on bundle`)
        },
      })

      await generateBundle.call({
        addWatchFile: vi.fn(),
        emitFile(file: { type: 'asset', fileName: string, source: string }) {
          emitted.push(file)
          return file.fileName
        },
      }, {} as any, replayBundle)

      expect(generateCssByGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
        rawSource,
      }))
      expect(emitted).toEqual([
        {
          type: 'asset',
          fileName: outputFile,
          source: expect.stringContaining(`/* vite ${major} */`),
        },
      ])
      expect(Object.prototype.hasOwnProperty.call(replayBundleTarget, outputFile)).toBe(false)
    },
    TEST_TIMEOUT_MS,
  )

  it('refreshes remembered sfc style source from watch cache before replaying stale vite pipeline css', async () => {
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
    }) => {
      const css = options.rawSource.includes('.tw-watch-style-case')
        ? '.base-style{display:flex}.tw-watch-style-case{font-weight:700}'
        : '.base-style{display:flex}'
      return createMockGeneratorCssResult(css)
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-sfc-style-refresh-'))
    createdDirs.push(root)
    const pageDir = path.join(root, 'pages/index')
    await mkdir(pageDir, { recursive: true })
    const sourceFile = path.join(pageDir, 'index.vue')
    const dirtyStyleSource = '.base-style { @apply flex; }\n.tw-watch-style-case { @apply font-bold; }'
    const cleanStyleSource = '.base-style { @apply flex; }'
    await writeFile(sourceFile, `<template><view /></template>\n<style lang="scss">\n${dirtyStyleSource}\n</style>\n`, 'utf8')
    const styleRequest = `${sourceFile}?vue&type=style&index=0&lang.scss`
    const rememberedCssSources = new Map([
      ['pages/index/index.wxss', {
        outputFile: 'pages/index/index.wxss',
        rawSource: dirtyStyleSource,
        sourceFile: styleRequest,
      }],
    ])
    let currentStyleSource = dirtyStyleSource
    const refreshRememberedCssSource = vi.fn(async (remembered: { outputFile: string, rawSource: string, sourceFile: string }) => ({
      ...remembered,
      rawSource: currentStyleSource,
    }))
    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    })
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set<string>()),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => new Set<string>(),
      getSourceCandidatesForEntries: () => new Set<string>(),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource,
      getRememberedCssSources: () => rememberedCssSources,
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      getKnownSfcSource: vi.fn(() => `<template><view /></template>\n<style lang="scss">\n${currentStyleSource}\n</style>\n`),
      recordGeneratorCandidates: vi.fn(),
    })
    const createViteProcessedCssAsset = (source: string) =>
      `${createBundlerGeneratedCssMarker('vite', styleRequest)}\n${source}`

    const firstBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(createViteProcessedCssAsset(dirtyStyleSource)),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [styleRequest],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle.call({
      addWatchFile: vi.fn(),
    }, {} as any, firstBundle)
    expect((firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()).toContain('.tw-watch-style-case')

    await writeFile(sourceFile, `<template><view /></template>\n<style lang="scss">\n${cleanStyleSource}\n</style>\n`, 'utf8')
    currentStyleSource = cleanStyleSource
    generateCssByGeneratorMock.mockClear()
    const secondBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(createViteProcessedCssAsset(dirtyStyleSource)),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [styleRequest],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle.call({
      addWatchFile: vi.fn(),
    }, {} as any, secondBundle)

    const rolledBackCss = (secondBundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    expect(refreshRememberedCssSource).toHaveBeenCalled()
    expect(generateCssByGeneratorMock).toHaveBeenCalled()
    const lastGeneratedOptions = generateCssByGeneratorMock.mock.calls.at(-1)?.[0]
    expect(lastGeneratedOptions.rawSource).toContain('.base-style { @apply flex; }')
    expect(lastGeneratedOptions.rawSource).not.toContain('.tw-watch-style-case')
    expect(rolledBackCss).toContain('.base-style')
    expect(rolledBackCss).not.toContain('.tw-watch-style-case')
  }, TEST_TIMEOUT_MS)

  it('infers uni-app page sfc styles when inline styles skip vite css transform', async () => {
    const generateMock = vi.fn(async (source: { css: string }) => {
      const css = [
        source.css.includes('.first-style') ? '.first-style{display:block}' : '',
        source.css.includes('.base-style') ? '.base-style{display:flex}' : '',
        source.css.includes('.tw-watch-style-case') ? '.tw-watch-style-case{font-weight:700}' : '',
      ].join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
          generate: vi.fn(async () => generateMock(source)),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-sfc-style-infer-'))
    createdDirs.push(root)
    const pageDir = path.join(root, 'feature/pages/index')
    await mkdir(pageDir, { recursive: true })
    const sourceFile = path.join(pageDir, 'index.vue')
    const source = [
      '<template><view /></template>',
      '<style lang="scss">',
      '.first-style { @apply block; }',
      '</style>',
      '<style lang="scss">',
      '.base-style { @apply flex; }',
      '.tw-watch-style-case { @apply font-bold; }',
      '</style>',
    ].join('\n')
    await writeFile(sourceFile, source, 'utf8')
    const secondStyleRequest = `${sourceFile}?vue&type=style&index=1&lang.scss`

    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    })
    const rememberCssSource = vi.fn()
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set<string>()),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => new Set<string>(),
      getSourceCandidatesForEntries: () => new Set<string>(),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource,
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => new Map([
        ['pages/index/index.wxss', {
          outputFile: 'pages/index/index.wxss',
          rawSource: '.base-style { @apply flex; }',
          sourceFile: secondStyleRequest,
        }],
      ]),
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      getKnownSfcSource: vi.fn(() => undefined),
      recordGeneratorCandidates: vi.fn(),
    })

    const bundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset('.compiled-page-style{}'),
        fileName: 'pages/index/index.wxss',
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
        facadeModuleId: sourceFile,
        moduleIds: [sourceFile],
      },
    }
    await generateBundle.call({
      addWatchFile: vi.fn(),
      getModuleInfo: vi.fn((id: string) => id === sourceFile ? { code: source } : null),
    }, {} as any, bundle)

    const css = (bundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    expect(css).toContain('.first-style')
    expect(css).toContain('.base-style')
    expect(css).toContain('.tw-watch-style-case')
    expect(rememberCssSource).toHaveBeenCalledWith(
      expect.objectContaining({
        outputFile: 'pages/index/index.wxss',
        sourceFile,
      }),
      expect.any(String),
    )
  }, TEST_TIMEOUT_MS)

  it('refreshes merged sfc style sources before regenerating stale vite pipeline css assets', async () => {
    const generateMock = vi.fn(async (source: { css: string }) => {
      const css = [
        source.css.includes('.page-root') ? '.page-root{display:block}' : '',
        source.css.includes('.base-style') ? '.base-style{display:flex}' : '',
        source.css.includes('.tw-watch-style-case') ? '.tw-watch-style-case{font-weight:700}' : '',
      ].join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
          generate: vi.fn(async () => generateMock(source)),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-sfc-style-merge-refresh-'))
    createdDirs.push(root)
    const pageDir = path.join(root, 'pages/index')
    await mkdir(pageDir, { recursive: true })
    const sourceFile = path.join(pageDir, 'index.vue')
    const firstStyleSource = '.page-root { @apply block; }'
    const cleanSecondStyleSource = '.base-style { @apply flex; }'
    const dirtySecondStyleSource = `${cleanSecondStyleSource}\n.tw-watch-style-case { @apply font-bold; }`
    await writeFile(
      sourceFile,
      `<template><view /></template>\n<style lang="scss">\n${firstStyleSource}\n</style>\n<style lang="scss">\n${cleanSecondStyleSource}\n</style>\n`,
      'utf8',
    )

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(rewritePlugin).toBeTruthy()
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const transform = getTransformHandler(rewritePlugin)
    const firstStyleRequest = `${sourceFile}?vue&type=style&index=0&lang.scss`
    const secondStyleRequest = `${sourceFile}?vue&type=style&index=1&lang.scss`
    const firstTransform = await transform?.call(rewritePlugin, firstStyleSource, firstStyleRequest) as { code: string } | null | undefined
    const secondTransform = await transform?.call(rewritePlugin, cleanSecondStyleSource, secondStyleRequest) as { code: string } | null | undefined
    expect(firstTransform?.code).toContain('.page-root')
    expect(secondTransform?.code).toContain('.base-style')
    const staleMergedCss = `${firstTransform?.code ?? ''}\n${secondTransform?.code ?? ''}`

    const firstBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(staleMergedCss),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [firstStyleRequest, secondStyleRequest],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstCss = (firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    expect(firstCss).toContain('.page-root')
    expect(firstCss).toContain('.base-style')
    expect(firstCss).not.toContain('.tw-watch-style-case')

    await writeFile(
      sourceFile,
      `<template><view /></template>\n<style lang="scss">\n${firstStyleSource}\n</style>\n<style lang="scss">\n${dirtySecondStyleSource}\n</style>\n`,
      'utf8',
    )
    await (sourcePlugin.watchChange as any)?.call(sourcePlugin, sourceFile, { event: 'update' })

    const secondBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(staleMergedCss),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [firstStyleRequest, secondStyleRequest],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const refreshedCss = (secondBundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    expect(refreshedCss).toContain('.page-root')
    expect(refreshedCss).toContain('.base-style')
    expect(refreshedCss).toContain('.tw-watch-style-case')
  }, TEST_TIMEOUT_MS)

  it('replays merged sfc style sources once when vite omits the css bundle asset', async () => {
    const generateMock = vi.fn(async (source: { css: string }) => {
      const css = [
        source.css.includes('.page-root') ? '.page-root{display:block}' : '',
        source.css.includes('.base-style') ? '.base-style{display:flex}' : '',
        source.css.includes('.tw-watch-style-case') ? '.tw-watch-style-case{font-weight:700}' : '',
      ].join('')
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
          generate: vi.fn(async () => generateMock(source)),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-sfc-style-merge-replay-'))
    createdDirs.push(root)
    const pageDir = path.join(root, 'pages/index')
    await mkdir(pageDir, { recursive: true })
    const sourceFile = path.join(pageDir, 'index.vue')
    const firstStyleSource = '.page-root { @apply block; }'
    const cleanSecondStyleSource = '.base-style { @apply flex; }'
    const dirtySecondStyleSource = `${cleanSecondStyleSource}\n.tw-watch-style-case { @apply font-bold; }`
    await writeFile(
      sourceFile,
      `<template><view /></template>\n<style lang="scss">\n${firstStyleSource}\n</style>\n<style lang="scss">\n${cleanSecondStyleSource}\n</style>\n`,
      'utf8',
    )

    const context = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    })
    const firstStyleRequest = `${sourceFile}?vue&type=style&index=0&lang.scss`
    const secondStyleRequest = `${sourceFile}?vue&type=style&index=1&lang.scss`
    const rememberedCssSources = new Map([
      ['pages/index/index.wxss', {
        outputFile: 'pages/index/index.wxss',
        rawSource: firstStyleSource,
        sourceFile: firstStyleRequest,
      }],
      [`pages/index/index.wxss\0${sourceFile}?type=style&index=1`, {
        outputFile: 'pages/index/index.wxss',
        rawSource: cleanSecondStyleSource,
        sourceFile: secondStyleRequest,
      }],
    ])
    const rememberedSignatures = new Map<string, string>()
    const refreshRememberedCssSource = vi.fn(async (remembered: { outputFile: string, rawSource: string, sourceFile: string }) => ({
      ...remembered,
      rawSource: remembered.sourceFile === secondStyleRequest
        ? dirtySecondStyleSource
        : firstStyleSource,
    }))
    const generateBundle = createGenerateBundleHook({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      ensureBundleRuntimeClassSet: vi.fn(async () => new Set<string>()),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'serve',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      getViteProcessedCssAssetResults: () => [],
      getViteProcessedCssAssetResult: () => undefined,
      getSourceCandidates: () => new Set<string>(),
      getSourceCandidatesForEntries: () => new Set<string>(),
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource,
      getRememberedCssSources: () => rememberedCssSources,
      getRememberedCssSignature: (file: string) => rememberedSignatures.get(file),
      setRememberedCssSignature: (file: string, signature: string) => {
        rememberedSignatures.set(file, signature)
      },
      recordGeneratorCandidates: vi.fn(),
    })

    await writeFile(
      sourceFile,
      `<template><view /></template>\n<style lang="scss">\n${firstStyleSource}\n</style>\n<style lang="scss">\n${dirtySecondStyleSource}\n</style>\n`,
      'utf8',
    )
    const bundle = {
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    const emitted: Array<{ type: 'asset', fileName: string, source: string }> = []
    await generateBundle.call({
      addWatchFile: vi.fn(),
      emitFile(file: { type: 'asset', fileName: string, source: string }) {
        emitted.push(file)
        return file.fileName
      },
    }, {} as any, bundle)

    expect(refreshRememberedCssSource).toHaveBeenCalledTimes(2)
    const replayedCss = emitted.find(file => file.fileName === 'pages/index/index.wxss')?.source ?? ''
    expect(replayedCss).toContain('.page-root')
    expect(replayedCss).toContain('.base-style')
    expect(replayedCss).toContain('.tw-watch-style-case')
  }, TEST_TIMEOUT_MS)

  it('regenerates vite pipeline css when a style source rolls back with css bundle asset', async () => {
    const generateMock = vi.fn(async (source: { css: string }) => {
      const css = source.css.includes('.tw-watch-style-case')
        ? '.tw-watch-style-case{font-weight:700}'
        : '.clean-style{display:block}'
      return {
        css,
        rawCss: css,
        target: 'weapp',
        classSet: new Set<string>(),
        rawCandidates: new Set<string>(),
        dependencies: [],
        sources: [],
        root: null,
        version: 3,
      }
    })
    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn((source: { css: string }) => ({
          generate: vi.fn(async () => generateMock(source)),
        })),
        normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      }
    })
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        getContexts: vi.fn(() => [{
          userConfig: { content: [] },
          tailwindConfig: { content: [] },
        }]),
      },
    }))
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(rewritePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const transform = getTransformHandler(rewritePlugin)
    const sourceFile = path.resolve(process.cwd(), 'pages/index/index.css')
    const dirtySource = '.tw-watch-style-case { @apply font-bold; }'
    const cleanSource = '.clean-style { display: block; }'
    const createViteProcessedCssAsset = (source: string) =>
      `${createBundlerGeneratedCssMarker('vite', sourceFile)}\n${source}`

    await transform?.call(rewritePlugin, dirtySource, sourceFile)
    const firstBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(createViteProcessedCssAsset(dirtySource)),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [sourceFile],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle['pages/index/index.wxss'] as OutputAsset).source.toString()).toContain('.tw-watch-style-case')

    const cleanTransformResult = await transform?.call(rewritePlugin, cleanSource, sourceFile)
    expect(cleanTransformResult).toBeNull()
    const secondBundle = {
      'pages/index/index.wxss': {
        ...createRollupAsset(createViteProcessedCssAsset(dirtySource)),
        fileName: 'pages/index/index.wxss',
        originalFileNames: [sourceFile],
      },
      'pages/index/index.js': {
        ...createRollupChunk('console.log("stable")'),
        fileName: 'pages/index/index.js',
      },
    }
    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const rolledBackCss = (secondBundle['pages/index/index.wxss'] as OutputAsset).source.toString()
    expect(rolledBackCss).toContain('.clean-style')
    expect(rolledBackCss).not.toContain('.tw-watch-style-case')
  }, TEST_TIMEOUT_MS)

  it('appends incremental generator css when only runtime candidates grow', async () => {
    const generatedCandidates = new Set<string>()
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => {
      const candidates = [...options.candidates].sort()
      const missingCandidates = candidates.filter(candidate => !generatedCandidates.has(candidate))
      for (const candidate of missingCandidates) {
        generatedCandidates.add(candidate)
      }
      const createCss = (items: string[]) => items.map(candidate => `.${candidate}{}`).join('\n')
      return {
        css: createCss(candidates),
        rawCss: createCss(candidates),
        incrementalCss: createCss(missingCandidates),
        incrementalRawCss: createCss(missingCandidates),
        target: 'weapp',
        classSet: new Set(candidates),
        rawCandidates: new Set(candidates),
        dependencies: [],
        sources: [],
        root: null,
        version: 4,
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: `style:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = (js: string) => ({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="text-[#111111]"></view>'),
        fileName: 'pages/index/index.wxml',
      },
      'pages/index/index.js': {
        ...createRollupChunk(js),
        fileName: 'pages/index/index.js',
      },
      'app.wxss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.wxss',
      },
    })

    runtimeSet.add('text-[#111111]')
    const firstBundle = createBundle('const color = "text-[#111111]"')
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()

    runtimeSet.add('text-[#222222]')
    const secondBundle = createBundle('const color = "text-[#111111] text-[#222222]"')
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    const secondCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()

    expect(generateMock).toHaveBeenCalledTimes(2)
    expect(secondCss).toBe(`${firstCss}\n.text-[#222222]{}`)
    expect(secondCss).toContain('text-[#111111]')
    expect(secondCss).toContain('text-[#222222]')
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('does not duplicate preflight when appending incremental v4 generator css', async () => {
    const generatedCandidates = new Set<string>()
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => {
      const candidates = [...options.candidates].sort()
      const missingCandidates = candidates.filter(candidate => !generatedCandidates.has(candidate))
      for (const candidate of missingCandidates) {
        generatedCandidates.add(candidate)
      }
      const createCss = (items: string[]) => items.map(candidate => `.${candidate}{}`).join('\n')
      const preflight = 'view,text,::after,::before{box-sizing:border-box;margin:0;padding:0;border:0 solid;}'
      return {
        css: `${preflight}\n${createCss(candidates)}`,
        rawCss: `${preflight}\n${createCss(candidates)}`,
        incrementalCss: createCss(missingCandidates),
        incrementalRawCss: createCss(missingCandidates),
        target: 'weapp',
        classSet: new Set(candidates),
        rawCandidates: new Set(candidates),
        dependencies: [],
        sources: [],
        root: null,
        version: 4,
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: `style:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = (js: string) => ({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="text-[#111111]"></view>'),
        fileName: 'pages/index/index.wxml',
      },
      'pages/index/index.js': {
        ...createRollupChunk(js),
        fileName: 'pages/index/index.js',
      },
      'app.wxss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.wxss',
      },
    })

    runtimeSet.add('text-[#111111]')
    const firstBundle = createBundle('const color = "text-[#111111]"')
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()

    runtimeSet.add('text-[#222222]')
    const secondBundle = createBundle('const color = "text-[#111111] text-[#222222]"')
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    const secondCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()

    expect(generateMock).toHaveBeenCalledTimes(2)
    expect(firstCss.match(/box-sizing:border-box/g) ?? []).toHaveLength(1)
    expect(secondCss.match(/box-sizing:border-box/g) ?? []).toHaveLength(1)
    expect(secondCss).toBe(`${firstCss}\n.text-[#222222]{}`)
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps generator css incremental when runtime candidates replace a utility', async () => {
    const generatedCandidates = new Set<string>()
    const generateMock = vi.fn(async (options: { candidates: Set<string> }) => {
      const candidates = [...options.candidates].sort()
      const missingCandidates = candidates.filter(candidate => !generatedCandidates.has(candidate))
      for (const candidate of missingCandidates) {
        generatedCandidates.add(candidate)
      }
      const createCss = (items: string[]) => items.map(candidate => `.${candidate}{}`).join('\n')
      return {
        css: createCss([...generatedCandidates].sort()),
        rawCss: createCss([...generatedCandidates].sort()),
        incrementalCss: createCss(missingCandidates),
        incrementalRawCss: createCss(missingCandidates),
        target: 'weapp',
        classSet: new Set(generatedCandidates),
        rawCandidates: new Set(generatedCandidates),
        dependencies: [],
        sources: [],
        root: null,
        version: 4,
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        version: 4,
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss" source(none);',
        dependencies: [],
        packageName: 'tailwindcss',
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        packageName: 'tailwindcss',
      })),
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set<string>()
    setCurrentContext(createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: `style:${code}` })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set(runtimeSet)),
        getClassSetSync: vi.fn(() => new Set(runtimeSet)),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(runtimeSet) })),
      },
    }))
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = getGenerateBundleHandler(postPlugin)
    const createBundle = (js: string) => ({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="text-[#111111]"></view>'),
        fileName: 'pages/index/index.wxml',
      },
      'pages/index/index.js': {
        ...createRollupChunk(js),
        fileName: 'pages/index/index.js',
      },
      'app.wxss': {
        ...createRollupAsset('/*! weapp-tailwindcss generator-placeholder */'),
        fileName: 'app.wxss',
      },
    })

    runtimeSet.add('text-[#111111]')
    const firstBundle = createBundle('const color = "text-[#111111]"')
    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    const firstCss = (firstBundle['app.wxss'] as OutputAsset).source.toString()

    runtimeSet.delete('text-[#111111]')
    runtimeSet.delete('text-[#222222]')
    runtimeSet.add('text-[#222222]')
    const secondBundle = createBundle('const color = "text-[#222222]"')
    await generateBundle?.call(postPlugin, {} as any, secondBundle)
    const secondCss = (secondBundle['app.wxss'] as OutputAsset).source.toString()

    expect(generateMock).toHaveBeenCalledTimes(2)
    expect(secondCss).toBe(`${firstCss}\n.text-[#222222]{}`)
    expect(secondCss).toContain('text-[#111111]')
    expect(secondCss).toContain('text-[#222222]')
  }, TEST_TIMEOUT_MS)

  it('isolates Tailwind v4 generated css share scope per output asset', async () => {
    const { createCssTransformShareScopeKey } = await import('@/bundlers/vite/generate-bundle/css-share-scope')
    const generatedCss = '/*! tailwindcss v4.3.0 | MIT License | https://tailwindcss.com */\n.bg-\\[red\\]{color:red}'
    const opts = createContext({
      mainCssChunkMatcher: vi.fn(() => false),
    }) as any

    expect(createCssTransformShareScopeKey(opts, 'pages/a.wxss', generatedCss)).toBe('source:pages/a.wxss')
    expect(createCssTransformShareScopeKey(opts, 'pages/b.wxss', generatedCss)).toBe('source:pages/b.wxss')
    expect(createCssTransformShareScopeKey(opts, 'pages/a.wxss', '.card{color:red}')).toBe('global')
    expect(createCssTransformShareScopeKey(opts, 'pages/b.wxss', '.card{color:red}')).toBe('global')
  })

  it('runs Tailwind v4 Vite css tasks serially by default', async () => {
    const { resolveViteCssTaskConcurrency } = await import('@/bundlers/vite/generate-bundle/vite-css-cache')

    expect(resolveViteCssTaskConcurrency(false, 4)).toBe(1)
    expect(resolveViteCssTaskConcurrency(false, 3)).toBe(2)
    expect(resolveViteCssTaskConcurrency(true, 4)).toBe(1)
  })

  it('finalizes retained mini-program css assets without dropping third-party css', async () => {
    const { createStyleHandler } = await import('@weapp-tailwindcss/postcss')
    const { finalizeMiniProgramCssAssets } = await import('@/bundlers/vite/generate-bundle/final-css-assets')
    const styleHandler = createStyleHandler({
      autoprefixer: false,
      cssPresetEnv: false,
      cssChildCombinatorReplaceValue: ['view', 'text'],
      cssRemoveHoverPseudoClass: true,
      isMainChunk: false,
      majorVersion: 4,
    })
    const bundle = {
      'retained.wxss': {
        ...createRollupAsset(`
.nut-searchbar__nut-icon-mask-close:hover {
  cursor: pointer;
}
.nut-icon {
  color: var(--nut-icon-color, #171a26);
}
@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}
page {
  --nut-icon-height: 32rpx;
}
`),
        fileName: 'retained.wxss',
      },
    }
    const onUpdate = vi.fn()
    const recordCssAssetResult = vi.fn()

    await finalizeMiniProgramCssAssets(bundle, {
      cssMatcher: file => file.endsWith('.wxss'),
      getCssHandlerOptions: file => ({
        isMainChunk: file === 'app.wxss',
        majorVersion: 4,
        postcssOptions: {
          options: {
            from: file,
          },
        },
      } as any),
      isWebGeneratorTarget: false,
      onUpdate,
      recordCssAssetResult,
      styleHandler,
    })

    const css = (bundle['retained.wxss'] as OutputAsset).source.toString()
    expect(css).not.toContain(':hover')
    expect(css).toContain('.nut-icon')
    expect(css).toContain('--nut-icon-height')
    expect(css).toContain('@keyframes rotation')
    expect(recordCssAssetResult).toHaveBeenCalledWith('retained.wxss', css)
    expect(onUpdate).toHaveBeenCalledWith('retained.wxss', expect.any(String), css)
  })

  it('logs css diffs when vite css diff debugging is enabled', async () => {
    const previousDebugCssDiff = process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF
    process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF = '1'
    try {
      const debug = vi.fn()
      vi.doMock('@/debug', () => ({
        createDebug: () => debug,
      }))
      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      setCurrentContext(createContext({
        styleHandler: vi.fn(async () => ({
          css: '.card{color:blue}',
        })),
      }))
      const plugins = WeappTailwindcss({ debug })
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

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      appType: undefined,
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      mainCssChunkMatcher: vi.fn(() => true),
      cssMatcher: (file: string) => file.endsWith('.wxss'),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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

  it('does not infer mini-program appType for web generator target', async () => {
    const loggerModule = await import('@weapp-tailwindcss/logger')
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-web-root-'))
    createdDirs.push(projectRoot)
    await writeFile(path.join(projectRoot, 'package.json'), JSON.stringify({
      dependencies: {
        'weapp-vite': '^6.0.0',
      },
    }, null, 2))

    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    setCurrentContext(createContext({
      appType: undefined,
      generator: {
        target: 'web',
      },
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      mainCssChunkMatcher: vi.fn(() => true),
      cssMatcher: (file: string) => file.endsWith('.css'),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()
    const loggerInfoSpy = vi.spyOn(loggerModule.logger, 'info').mockImplementation(() => {})

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root: projectRoot,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    expect(currentContext.appType).toBeUndefined()
    expect(loggerInfoSpy).not.toHaveBeenCalledWith('根据 Vite 项目根目录自动推断 appType -> %s', 'weapp-vite')
  })

  it('defaults uni-app H5 serve mode to web generator target without mini-program appType inference', async () => {
    const previousUniPlatform = process.env.UNI_PLATFORM
    process.env.UNI_PLATFORM = 'h5'
    try {
      const loggerModule = await import('@weapp-tailwindcss/logger')
      const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-uni-h5-root-'))
      createdDirs.push(projectRoot)
      await writeFile(path.join(projectRoot, 'package.json'), JSON.stringify({
        dependencies: {
          '@dcloudio/vite-plugin-uni': '^3.0.0',
        },
      }, null, 2))

      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      setCurrentContext(createContext({
        appType: undefined,
        styleHandler: vi.fn(async (code: string) => ({ css: code })),
        mainCssChunkMatcher: vi.fn(() => true),
        cssMatcher: (file: string) => file.endsWith('.css'),
      }))
      const currentContext = getCurrentContext()
      const plugins = WeappTailwindcss()
      const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
      expect(postPlugin).toBeTruthy()
      const loggerInfoSpy = vi.spyOn(loggerModule.logger, 'info').mockImplementation(() => {})

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'serve',
        root: projectRoot,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/h5' },
      } as ResolvedConfig)

      expect(currentContext.generator?.target).toBeUndefined()
      expect(currentContext.appType).toBeUndefined()
      expect(loggerInfoSpy).not.toHaveBeenCalledWith('根据 Vite 项目根目录自动推断 appType -> %s', expect.any(String))
    }
    finally {
      if (previousUniPlatform === undefined) {
        delete process.env.UNI_PLATFORM
      }
      else {
        process.env.UNI_PLATFORM = previousUniPlatform
      }
    }
  }, TEST_TIMEOUT_MS)

  it('keeps template transform stable on script-only incremental updates', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
      cssMatcher: (file: string) => file.endsWith('.css') || file.endsWith('.wxss'),
      templateHandler: vi.fn(async (code: string) => replaceKnownClasses(code)),
      jsHandler: vi.fn((code: string) => ({ code: replaceKnownClasses(code) })),
      styleHandler: vi.fn(async (code: string) => ({ css: replaceKnownClasses(code) })),
    }))
    const currentContext = getCurrentContext()
    const plugins = WeappTailwindcss()
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
      expect(wxss).toContain('height: 20px')
      expect(wxss).toContain('content: var(--tw-content)')
      expect(wxss).toMatch(/(?:250 250 0|250,\s*250,\s*0)/)
      expect(wxss).toContain('#0000')
      expect(wxss).not.toContain('@apply')
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
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(3)
  }, TEST_TIMEOUT_MS)

  it('transforms inlined tailwind-merge output within bundle stage', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const runtimeSet = new Set(['bg-[#434332]', 'bg-[#123324]', 'px-[32px]', 'px-[35px]'])
    const realJsHandler = createJsHandler({
      ignoreCallExpressionIdentifiers: [],
    })
    const jsHandlerMock = vi.fn((code: string, classNameSet?: Set<string>, options?: CreateJsHandlerOptions) =>
      realJsHandler(code, classNameSet, options),
    )
    const getClassSetMock = vi.fn(async () => runtimeSet)
    const getClassSetSyncMock = vi.fn(() => runtimeSet)
    const extractMock = vi.fn(async () => ({ classSet: runtimeSet }))

    setCurrentContext(createContext({
      jsHandler: jsHandlerMock as any,
      tailwindRuntime: {
        getClassSet: getClassSetMock,
        getClassSetSync: getClassSetSyncMock,
        extract: extractMock,
        majorVersion: 4,
      },
    }))

    const plugins = WeappTailwindcss()
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

    expect(extractMock).toHaveBeenCalledTimes(1)
    expect(getClassSetSyncMock).toHaveBeenCalledTimes(1)
    expect(getClassSetMock).not.toHaveBeenCalled()
    expect(jsHandlerMock).toHaveBeenCalledTimes(1)
    expect(jsHandlerMock.mock.calls[0]?.[1]).toEqual(runtimeSet)

    const code = (bundle['index.js'] as OutputChunk).code
    expect(code).toContain('bg-_b_h123324_B px-_b35px_B')
    expect(code).toContain('bg-_b_h434332_B px-_b32px_B')
    expect(code).not.toContain('bg-[#123324]')
    expect(code).not.toContain('bg-[#434332]')
  }, TEST_TIMEOUT_MS)

  it('propagates linked js module updates', async () => {
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
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
    const plugins = WeappTailwindcss()
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

  it('keeps process cache during omitted-file incremental bundle updates', async () => {
    process.env.WEAPP_TW_WATCH_REGRESSION = '1'
    process.env.WEAPP_TW_HMR_MEMORY_DEBUG = '1'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    try {
      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      setCurrentContext(createContext({
        templateHandler: vi.fn(async (code: string) => `tpl:${code}`),
        jsHandler: vi.fn((code: string) => ({ code: `js:${code}` })),
        styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
      }))
      const currentContext = getCurrentContext()
      const plugins = WeappTailwindcss()
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
        'index.wxml': createRollupAsset('<view class="alpha"></view>'),
        'index.js': createRollupChunk('const cls = "alpha"'),
        'index.css': {
          ...createRollupAsset('.alpha { color: red; }'),
          fileName: 'index.css',
        },
      }
      await generateBundle?.call(postPlugin, {} as any, firstBundle)
      expect(currentContext.cache.hashMap.size).toBeGreaterThan(1)

      await generateBundle?.call(postPlugin, {} as any, {
        'index.js': createRollupChunk('const cls = "alpha beta"'),
      })

      expect([...currentContext.cache.hashMap.keys()]).toEqual(expect.arrayContaining([
        expect.stringContaining('index.wxml:html:'),
        'index.js:js',
        expect.stringContaining('index.css:css:'),
      ]))
      expect([...currentContext.cache.instance.keys()]).toEqual(expect.arrayContaining([
        'index.wxml',
        'index.js',
        'index.css',
      ]))

      const payloads = write.mock.calls
        .map(([chunk]) => String(chunk))
        .filter(line => line.startsWith('[weapp-tailwindcss:hmr] '))
        .map(line => JSON.parse(line.replace('[weapp-tailwindcss:hmr] ', '')))
        .filter(payload => payload.phase === 'generateBundle')
      expect(payloads.at(-1)?.memoryDebug).toMatchObject({
        bundle: {
          hasOmittedKnownFiles: true,
        },
        processCache: {
          activeCacheKeys: 1,
          activeHashKeys: 1,
          staleCacheKeys: 2,
          staleHashKeys: 2,
          pruned: false,
          pruneSkipped: true,
          pruneSkipReason: 'omitted-known-files',
        },
      })
    }
    finally {
      write.mockRestore()
      delete process.env.WEAPP_TW_WATCH_REGRESSION
      delete process.env.WEAPP_TW_HMR_MEMORY_DEBUG
    }
  }, TEST_TIMEOUT_MS)

  it('uses configured tailwind v4 css root for root shell output without restoring local imports', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-v4-root-shell-'))
    createdDirs.push(root)
    const tailwindCssFile = path.join(root, 'tailwind.css')
    const generateCssByGeneratorMock = vi.fn(async (options: {
      rawSource: string
      userRawSource?: string | undefined
      restoreLocalCssImports?: boolean | undefined
    }) => {
      const generatedCss = options.restoreLocalCssImports === false
        ? '.bg-red-500{background-color:#ef4444}'
        : '@import "./third-party-ui.css";\n.bg-red-500{background-color:#ef4444}'
      return {
        css: [generatedCss, options.userRawSource].filter(Boolean).join('\n'),
        rawCss: options.rawSource,
        target: 'weapp',
        source: 'generator',
        dependencies: [],
      }
    })
    vi.resetModules()
    vi.doMock('@/bundlers/shared/generator-css', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/shared/generator-css')>()
      return {
        ...actual,
        generateCssByGenerator: generateCssByGeneratorMock,
      }
    })
    const { createGenerateBundleHook: createGenerateBundleHookWithMock } = await import('@/bundlers/vite/generate-bundle')
    const runtimeSet = new Set(['bg-red-500'])
    const context = createContext({
      appType: 'weapp',
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      tailwindcssBasedir: root,
      tailwindcss: {
        v4: {
          cssSources: [{
            file: tailwindCssFile,
            base: root,
            css: '@import "tailwindcss";\n@import "./third-party-ui.css";\n@source "./pages/**/*";',
            dependencies: [],
          }],
        },
      },
      tailwindRuntime: {
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        options: {
          projectRoot: root,
          tailwindcss: {
            cwd: root,
            v4: {
              base: root,
              cssSources: [{
                file: tailwindCssFile,
                base: root,
                css: '@import "tailwindcss";\n@import "./third-party-ui.css";\n@source "./pages/**/*";',
                dependencies: [],
              }],
            },
          },
        },
      },
    })
    const records = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>()
    const generateBundle = createGenerateBundleHookWithMock({
      opts: context as any,
      runtimeState: {
        tailwindRuntime: context.tailwindRuntime as any,
        readyPromise: Promise.resolve(),
      },
      ensureRuntimeClassSet: vi.fn(async () => runtimeSet),
      ensureBundleRuntimeClassSet: vi.fn(async () => runtimeSet),
      debug: vi.fn(),
      getResolvedConfig: () => ({
        command: 'build',
        plugins: [],
        root,
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist' },
      } as unknown as ResolvedConfig),
      markCssAssetProcessed: vi.fn(),
      isCssAssetProcessed: vi.fn(() => false),
      isViteProcessedCssAsset: vi.fn(() => false),
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult(file, css, options) {
        records.set(file, {
          css,
          injectIntoMain: options?.injectIntoMain,
          outputFile: options?.outputFile,
        })
      },
      getViteProcessedCssAssetResults: () => records.entries(),
      getViteProcessedCssAssetResult: file => records.get(file),
      getSourceCandidates: () => runtimeSet,
      getSourceCandidatesForEntries: () => runtimeSet,
      getSourceCandidateSource: () => undefined,
      getSourceCandidateSources: () => [],
      getSourceCandidateSourcesForEntries: () => [],
      waitForSourceCandidateSyncs: vi.fn(async () => undefined),
      rememberCssSource: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      getRememberedCssSources: () => new Map(),
      getRememberedCssSignature: () => undefined,
      setRememberedCssSignature: vi.fn(),
      recordGeneratorCandidates: vi.fn(),
    })

    const bundle = {
      'app.wxss': {
        ...createRollupAsset('/* Main style shell. */'),
        fileName: 'app.wxss',
      },
      'third-party-ui.wxss': {
        ...createRollupAsset('.weapp-tw-user-ui-card{display:inline-flex}'),
        fileName: 'third-party-ui.wxss',
      },
    }

    await generateBundle.call({ addWatchFile: vi.fn() }, {}, bundle)

    const appCss = String((bundle['app.wxss'] as OutputAsset).source)
    expect(appCss).toContain('.bg-red-500')
    expect(appCss).not.toContain('@import "./third-party-ui.css"')
    expect(appCss).toContain('/* Main style shell. */')
    expect(generateCssByGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      file: tailwindCssFile,
      rawSource: expect.stringContaining('@import "tailwindcss"'),
      restoreLocalCssImports: false,
    }))
  }, TEST_TIMEOUT_MS)
})
