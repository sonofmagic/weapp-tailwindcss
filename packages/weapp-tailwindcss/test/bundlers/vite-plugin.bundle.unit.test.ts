import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createJsHandler } from '@/js'
import { replaceWxml } from '@/wxml'
import {
  createContext,
  createRollupAsset,
  createRollupChunk,
  getCurrentContext,
  resetVitePluginTestContext,
  setCurrentContext,
} from './vite-plugin.testkit'

const TEST_TIMEOUT_MS = 2000

async function loadUnifiedVitePlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.UnifiedViteWeappTailwindcssPlugin
}

describe('bundlers/vite UnifiedViteWeappTailwindcssPlugin bundle', () => {
  beforeEach(() => {
    vi.resetModules()
    resetVitePluginTestContext()
  })

  it('generates bundle assets and leverages cache', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
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
    const postcssPlugins = (config.css?.postcss as any)?.plugins
    expect(postcssPlugins?.[0]).toEqual({ postcssPlugin: 'mocked-html-transform' })

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

    const generateBundle = postPlugin.generateBundle as any
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

  it('refreshes runtime class set on source changes so new arbitrary classes in :class strings are escaped', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const staticClass = 'rounded-[32rpx] border border-slate-100/70 bg-white/90 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]'
    const dynamicClass = 'rounded-[92rpx] border border-slate-100/70 bg-[#213435] p-9 shadow-[0_20px_45px_rgba(15,23,42,0.08)]'
    const runtimeSets = [
      new Set(staticClass.split(/\s+/)),
      new Set(dynamicClass.split(/\s+/)),
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

    const generateBundle = postPlugin.generateBundle as any
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

    const generateBundle = postPlugin.generateBundle as any
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

    const generateBundle = postPlugin.generateBundle as any
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

    const generateBundle = postPlugin.generateBundle as any

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

  it('keeps dirty state stable when bundle temporarily omits js entries', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    const generateBundle = postPlugin.generateBundle as any

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

    const generateBundle = postPlugin.generateBundle as any
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

  it('keeps template transform stable on script-only incremental updates', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'pages/index/index.wxml'
    const jsFile = 'pages/index/index.js'
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
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()

    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: process.cwd(),
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as ResolvedConfig)

    const generateBundle = postPlugin.generateBundle as any
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

    const generateBundle = postPlugin.generateBundle as any
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

    const generateBundle = postPlugin.generateBundle as any
    await generateBundle?.call(postPlugin, {} as any, bundle)

    expect((bundle['chunk.js'] as OutputChunk).code).toBe('linked:chunk')
    const chunkUpdates = currentContext.onUpdate.mock.calls.filter(([file]) => file === 'chunk.js')
    expect(chunkUpdates.length).toBeGreaterThan(0)
    expect(chunkUpdates.some(([, , updated]) => updated === 'linked:chunk')).toBe(true)

    const firstCall = currentContext.jsHandler.mock.calls[0] as unknown as [string, Set<string>, CreateJsHandlerOptions] | undefined
    const linkedOptions = firstCall?.[2]
    expect(linkedOptions?.moduleGraph?.resolve?.('./chunk.js', linkedOptions.filename ?? '')).toBe(linkedFile)
  }, TEST_TIMEOUT_MS)
})
