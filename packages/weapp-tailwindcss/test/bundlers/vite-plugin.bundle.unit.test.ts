import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { MappingChars2String } from '@weapp-core/escape'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
const MINIMAL_TAILWIND_V4_CSS = `
@theme default {
  --spacing: 0.25rem;
}
@tailwind utilities;
`
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

function normalizeGeneratorOptions(options: any) {
  if (options == null) {
    return { target: 'weapp' }
  }
  return {
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

describe('bundlers/vite WeappTailwindcss bundle', () => {
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()

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

  it('uses oxide source candidates as the default Tailwind v3 runtime input in Vite generator mode', async () => {
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
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
        validateCandidates: validateCandidatesMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: normalizeGeneratorOptions,
      resolveTailwindV3Source: vi.fn(async options => ({
        version: 3,
        projectRoot: process.cwd(),
        cwd: process.cwd(),
        base: process.cwd(),
        css: options?.css ?? '@tailwind utilities;',
        config: undefined,
        configObject: {},
        dependencies: [],
        packageName: 'tailwindcss',
        postcssPlugin: 'tailwindcss',
      })),
      resolveTailwindV3SourceFromPatcher: vi.fn(async () => ({
        version: 3,
        projectRoot: process.cwd(),
        cwd: process.cwd(),
        base: process.cwd(),
        css: '@tailwind utilities;',
        config: undefined,
        configObject: {},
        dependencies: [],
        packageName: 'tailwindcss',
        postcssPlugin: 'tailwindcss',
      })),
      resolveTailwindV3SourceOptionsFromPatcher: vi.fn(() => ({
        projectRoot: process.cwd(),
        cwd: process.cwd(),
        packageName: 'tailwindcss',
        postcssPlugin: 'tailwindcss',
      })),
    }))

    const runtimeSet = new Set(['from-patcher'])
    const currentContext = createContext({
      templateHandler: vi.fn(async () => '<view></view>'),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 3,
      },
    })
    setCurrentContext(currentContext)

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

    await getTransformHandler(sourcePlugin)?.call(
      sourcePlugin,
      '<view class="bg-[red] not-a-tailwind-class"></view>',
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
    }
    const generateBundle = getGenerateBundleHandler(postPlugin)
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
    expect(currentContext.twPatcher.getClassSet).not.toHaveBeenCalled()
    expect(currentContext.twPatcher.getClassSetSync).not.toHaveBeenCalled()
    expect(validateCandidatesMock).toHaveBeenCalledWith(expect.any(Set))
    expect([...(validateCandidatesMock.mock.calls[0]![0] as Set<string>)]).toEqual(expect.arrayContaining(['bg-[red]']))
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      candidates: new Set(['bg-[red]']),
      incrementalCache: true,
    }))
    expect((bundle['app.css'] as OutputAsset).source).toContain('background-color: red')
  }, TEST_TIMEOUT_MS)

  it('inlines external postcss config without official Tailwind plugins in force generator mode', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = createContext({
      generator: {
        target: 'weapp',
      },
    })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 4

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
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-auto-entry-'))
    createdDirs.push(root)
    const entry = path.join(root, 'subpackage', 'entry.css')
    const configFile = path.join(root, 'subpackage', 'tailwind.config.js')
    const css = '@import "tailwindcss" source(none);\n@config "./tailwind.config.js";'
    await mkdir(path.dirname(entry), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./**/*.wxml"] }\n', 'utf8')
    const refreshTailwindcssPatcher = vi.fn()
    const context = createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
      },
      refreshTailwindcssPatcher,
    })
    refreshTailwindcssPatcher.mockImplementation(async () => context.twPatcher)
    setCurrentContext(context)

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const transform = getTransformHandler(rewritePlugin)

    const result = await transform?.call(
      rewritePlugin,
      css,
      entry,
    )

    expect(context.cssEntries).toBeUndefined()
    expect(context.tailwindcss?.v4?.cssSources).toEqual([
      {
        file: entry,
        base: path.dirname(entry),
        css,
        dependencies: [configFile],
      },
    ])
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
    expect(String((result as any)?.code)).toContain('generator-placeholder.css')
  })

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

    const refreshTailwindcssPatcher = vi.fn()
    const context = createContext({
      twPatcher: {
        patch: vi.fn(),
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
      refreshTailwindcssPatcher,
    })
    refreshTailwindcssPatcher.mockImplementation(async () => context.twPatcher)
    setCurrentContext(context)

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss()
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'build',
      root,
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist', watch: {} },
    } as ResolvedConfig)
    refreshTailwindcssPatcher.mockClear()
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
        css: '@import "tailwindcss" source(none);\n@config "./tailwind.config.js";\n',
        dependencies: [subConfig],
      }),
    ])
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)

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

  it('scans Tailwind v4 @config content for vite source candidates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-config-content-'))
    createdDirs.push(root)
    const cssEntry = path.join(root, 'sub-independent', 'pages', 'index.css')
    const configFile = path.join(root, 'sub-independent', 'tailwind.config.cjs')
    const pageFile = path.join(root, 'sub-independent', 'pages', 'index.wxml')
    await mkdir(path.dirname(pageFile), { recursive: true })
    await writeFile(configFile, 'module.exports = { content: ["./pages/**/*.{wxml,ts}"] }\n', 'utf8')
    await writeFile(pageFile, '<view class="bg-[#010721] text-[35px] h-[29px]">ok</view>\n', 'utf8')

    const context = createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set()),
        getClassSetSync: vi.fn(() => new Set()),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set() })),
      },
    })
    setCurrentContext(context)

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({
      cssEntries: [cssEntry],
    })
    const sourcePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:source-candidates') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    await writeFile(cssEntry, '@import "tailwindcss" source(none);\n@config "./tailwind.config.cjs";\n', 'utf8')
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

  it('updates auto tailwindcss v4 css source content on repeated vite css transforms', async () => {
    const entry = path.join(os.tmpdir(), 'weapp-tw-vite-auto-entry-update.css')
    const refreshTailwindcssPatcher = vi.fn()
    const context = createContext({
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
      },
      refreshTailwindcssPatcher,
    })
    refreshTailwindcssPatcher.mockImplementation(async () => context.twPatcher)
    setCurrentContext(context)

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(2)
  })

  it('keeps explicit cssEntries when vite css transforms see tailwindcss roots', async () => {
    const explicitEntry = path.join(os.tmpdir(), 'weapp-tw-explicit-entry.css')
    const detectedEntry = path.join(os.tmpdir(), 'weapp-tw-detected-entry.css')
    const refreshTailwindcssPatcher = vi.fn()
    const context = createContext({
      cssEntries: [explicitEntry],
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set(['w-4'])),
        getClassSetSync: vi.fn(() => new Set(['w-4'])),
        majorVersion: 4,
        extract: vi.fn(async () => ({ classSet: new Set(['w-4']) })),
      },
      refreshTailwindcssPatcher,
    })
    refreshTailwindcssPatcher.mockImplementation(async () => context.twPatcher)
    setCurrentContext(context)

    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const plugins = WeappTailwindcss({ cssEntries: [explicitEntry] })
    const rewritePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:rewrite-css-imports') as Plugin
    const transform = getTransformHandler(rewritePlugin)

    await transform?.call(rewritePlugin, '@import "tailwindcss";', detectedEntry)

    expect(context.cssEntries).toEqual([explicitEntry])
    expect(context.tailwindcss?.v4?.cssSources).toBeUndefined()
    expect(refreshTailwindcssPatcher).not.toHaveBeenCalled()
  })

  it('removes Tailwind v3 official PostCSS plugins in default auto mode', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = createContext({
      generator: {
        target: 'weapp',
      },
    })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 3

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

  it('reuses snapshot hashes for unchanged js process cache checks', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      twPatcher: {
        patch: vi.fn(),
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
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('updates v3 watch runtime classes incrementally without full extract on source candidate changes', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set([baselineClass, firstClass])),
        getClassSetSync: vi.fn(() => new Set([baselineClass, firstClass])),
        extract: extractMock,
        majorVersion: 3,
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
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => fallbackRuntimeSet),
        getClassSetSync: vi.fn(() => fallbackRuntimeSet),
        extract: vi.fn(async () => ({ classSet: fallbackRuntimeSet })),
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
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => fullRuntimeSet),
        getClassSetSync: vi.fn(() => fullRuntimeSet),
        extract: vi.fn(async () => ({ classSet: fullRuntimeSet })),
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      twPatcher: {
        patch: vi.fn(),
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
    }))
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      css: '@import "tailwindcss";',
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

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      styleHandler,
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
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
    }))

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

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      styleHandler,
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

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

    expect((bundle['app.css'] as OutputAsset).source).toBe(`${webCss}\n${userCss}`)
    expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({
      target: 'web',
    }))
    expect(styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('does not share css transform results for identical assets with relative urls', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const runtimeSet = new Set(['flex', escapedGap])
    const appRoot = path.resolve(process.cwd(), 'apps/issue-814-tw4')
    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
      }),
      twPatcher: {
        patch: vi.fn(),
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

    const transformedWxml = (bundle['dist/pages/index/index.wxml'] as OutputAsset).source.toString()
    const transformedJs = (bundle['dist/pages/index/index.js'] as OutputChunk).code

    expect(transformedWxml).toContain(escapedGap)
    expect(transformedJs).toContain(escapedGap)
    expect(transformedJs).not.toContain('gap-[20px]')
  }, TEST_TIMEOUT_MS)

  it('fixes issue #814 in tw4 fixture when cwd is workspace root and build root points to app root', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
      }),
      twPatcher: initialPatcher,
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

    const transformedWxml = (bundle['dist/pages/index/index.wxml'] as OutputAsset).source.toString()
    const transformedJs = (bundle['dist/pages/index/index.js'] as OutputChunk).code

    expect(refreshTailwindcssPatcher).toHaveBeenCalled()
    expect(transformedWxml).toContain(escapedGap)
    expect(transformedJs).toContain(escapedGap)
    expect(transformedJs).not.toContain('gap-[20px]')
  }, TEST_TIMEOUT_MS)

  it('captures issue #814 fault mode when jsPreserveClass keeps gap candidate untouched', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const { wxml, js } = await loadIssue814Fixture()
    const escapedGap = replaceWxml('gap-[20px]')
    const runtimeSet = new Set(['flex', 'gap-[20px]'])
    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => code.replaceAll('gap-[20px]', escapedGap)),
      jsHandler: createJsHandler({
        jsPreserveClass: keyword => keyword === 'gap-[20px]',
      }),
      twPatcher: {
        patch: vi.fn(),
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

    const transformedJs = (bundle['dist/pages/index/index.js'] as OutputChunk).code
    expect(transformedJs).toContain('gap-[20px]')
    expect(transformedJs).not.toContain(escapedGap)
  }, TEST_TIMEOUT_MS)

  it('aligns implicit tailwindcss basedir to vite root before bundle processing', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('prefers the nearest tailwind config root when vite root points to a source subdirectory', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    expect(refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  }, TEST_TIMEOUT_MS)

  it('keeps explicit tailwindcss basedir unchanged on configResolved', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    expect(refreshTailwindcssPatcher).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps non-set business literals unchanged in serve mode while preserving classNameSet-only strategy', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

    const plugins = WeappTailwindcss()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: code
          .replace('*,::before,::after', 'view,text,::before,::after')
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
    expect(firstCss).toContain('view,text,::before,::after')
    expect(firstCss).toContain('.border-emerald-200_f70')
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
    expect(secondCss).toContain('.border-emerald-300_f70')
    expect(secondCss).not.toContain('*,::before,::after')
    expect(secondCss).not.toContain('border-emerald-200\\/70')
    expect(secondCss).not.toContain('border-emerald-300\\/70')
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(0)
  }, TEST_TIMEOUT_MS)

  it('reapplies cached css transform when css formatting changes only', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({
      styleHandler: vi.fn(async (code: string) => ({
        css: code
          .replace('*,::before,::after', 'view,text,::before,::after')
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
    expect(transformedCss).toContain('view,text,::before,::after')
    expect(transformedCss).toContain('.border-emerald-200_f70')
    expect(currentContext.styleHandler).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('shares non-main css transform results for identical assets in the same bundle round', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

  it('logs css diffs when vite css diff debugging is enabled', async () => {
    const previousDebugCssDiff = process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF
    process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF = '1'
    try {
      const debug = vi.fn()
      vi.doMock('@/debug', () => ({
        createDebug: () => debug,
      }))
      const WeappTailwindcss = await loadUnifiedVitePlugin()
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

    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

  it('keeps template transform stable on script-only incremental updates', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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

    expect(patchMock).not.toHaveBeenCalled()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
    const WeappTailwindcss = await loadUnifiedVitePlugin()
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
})
