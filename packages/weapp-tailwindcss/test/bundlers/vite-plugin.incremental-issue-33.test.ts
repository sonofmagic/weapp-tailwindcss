import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
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

const TEST_TIMEOUT_MS = 30000

async function loadUnifiedVitePlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.UnifiedViteWeappTailwindcssPlugin
}

function createEscaper(tokens: string[]) {
  return (code: string) => {
    let result = code
    for (const token of tokens) {
      result = result.replaceAll(token, replaceWxml(token))
    }
    return result
  }
}

function expectEscaped(source: string, token: string) {
  expect(source).toContain(replaceWxml(token))
  expect(source).not.toContain(token)
}

describe('bundlers/vite incremental issue #33 regression', () => {
  beforeEach(() => {
    vi.resetModules()
    resetVitePluginTestContext()
  })

  it('reapplies cached js transform for unchanged source on incremental runs', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'dist/pages/index/index.wxml'
    const jsFile = 'dist/pages/index/index.js'
    const rawTemplateToken = 'bg-[#000]'
    const rawScriptToken = 'px-[432.43px]'
    const runtimeSet = new Set([rawTemplateToken, rawScriptToken])
    const escapeKnown = createEscaper([rawTemplateToken, rawScriptToken])

    const realJsHandler = createJsHandler({
      staleClassNameFallback: false,
      jsArbitraryValueFallback: false,
    })
    const jsHandler = vi.fn((code: string, classNameSet?: Set<string>, options?: Record<string, unknown>) =>
      realJsHandler(code, classNameSet, options as any),
    )

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => escapeKnown(code)),
      jsHandler,
      twPatcher: {
        patch: vi.fn(async () => {}),
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

    const firstBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="${rawTemplateToken}">{{ cls }}</view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "${rawScriptToken}"`),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    expectEscaped((firstBundle[htmlFile] as OutputAsset).source.toString(), rawTemplateToken)
    expectEscaped((firstBundle[jsFile] as OutputChunk).code, rawScriptToken)

    // 模拟 dev 增量轮次：上游再次输出原始 JS 产物，但该入口源码 hash 与上一轮相同。
    const secondBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="${rawTemplateToken}">{{ cls }}</view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "${rawScriptToken}"`),
        fileName: jsFile,
      },
      'dist/pages/index/other.js': {
        ...createRollupChunk(`const touched = "${rawTemplateToken}"`),
        fileName: 'dist/pages/index/other.js',
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expectEscaped((secondBundle[htmlFile] as OutputAsset).source.toString(), rawTemplateToken)
    expectEscaped((secondBundle[jsFile] as OutputChunk).code, rawScriptToken)
  }, 8000)

  it('does not refresh runtime class set for formatting-only incremental html/js changes', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'dist/pages/index/index.wxml'
    const jsFile = 'dist/pages/index/index.js'
    const rawTemplateToken = 'bg-[#000]'
    const rawScriptToken = 'px-[432.43px]'
    const runtimeSet = new Set([rawTemplateToken, rawScriptToken])
    const escapeKnown = createEscaper([rawTemplateToken, rawScriptToken])

    const realJsHandler = createJsHandler({
      staleClassNameFallback: false,
      jsArbitraryValueFallback: false,
    })
    const jsHandler = vi.fn((code: string, classNameSet?: Set<string>, options?: Record<string, unknown>) =>
      realJsHandler(code, classNameSet, options as any),
    )

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => escapeKnown(code)),
      jsHandler,
      twPatcher: {
        patch: vi.fn(async () => {}),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
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

    const firstBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="${rawTemplateToken}">{{ cls }}</view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "${rawScriptToken}"`),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, firstBundle)

    currentContext.twPatcher.extract.mockClear()
    currentContext.twPatcher.getClassSetSync.mockClear()
    currentContext.twPatcher.getClassSet.mockClear()

    const secondBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="${rawTemplateToken}">
  {{ cls }}
</view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "${rawScriptToken}";\n`),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    expectEscaped((secondBundle[htmlFile] as OutputAsset).source.toString(), rawTemplateToken)
    expectEscaped((secondBundle[jsFile] as OutputChunk).code, rawScriptToken)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
    expect(currentContext.twPatcher.getClassSetSync).not.toHaveBeenCalled()
    expect(currentContext.twPatcher.getClassSet).not.toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('keeps script/template arbitrary values correct across add-modify-delete in incremental runs', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'dist/pages/index/index.wxml'
    const jsFile = 'dist/pages/index/index.js'
    const stageTokens = [
      'bg-[#101010]',
      'bg-[#202020]',
      'px-[432.43px]',
      'px-[120.5px]',
    ] as const
    const runtimeSet = new Set(stageTokens)
    const escapeKnown = createEscaper([...stageTokens])

    const realJsHandler = createJsHandler({
      staleClassNameFallback: false,
      jsArbitraryValueFallback: false,
    })
    const jsHandler = vi.fn((code: string, classNameSet?: Set<string>, options?: Record<string, unknown>) =>
      realJsHandler(code, classNameSet, options as any),
    )

    setCurrentContext(createContext({
      templateHandler: vi.fn(async (code: string) => escapeKnown(code)),
      jsHandler,
      twPatcher: {
        patch: vi.fn(async () => {}),
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

    const addBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="card bg-[#101010]">{{ cls }}</view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "px-[432.43px]"`),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>
    await generateBundle?.call(postPlugin, {} as any, addBundle)
    expectEscaped((addBundle[htmlFile] as OutputAsset).source.toString(), 'bg-[#101010]')
    expectEscaped((addBundle[jsFile] as OutputChunk).code, 'px-[432.43px]')

    const modifyBundle = {
      [htmlFile]: {
        ...createRollupAsset(`<view class="card bg-[#202020]">{{ cls }}</view>`),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(`const cls = "px-[120.5px]"`),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>
    await generateBundle?.call(postPlugin, {} as any, modifyBundle)
    expectEscaped((modifyBundle[htmlFile] as OutputAsset).source.toString(), 'bg-[#202020]')
    expectEscaped((modifyBundle[jsFile] as OutputChunk).code, 'px-[120.5px]')

    const deleteBundle = {
      [htmlFile]: {
        ...createRollupAsset('<view class="card">{{ cls }}</view>'),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const cls = "card"'),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>
    await generateBundle?.call(postPlugin, {} as any, deleteBundle)

    const htmlAfterDelete = (deleteBundle[htmlFile] as OutputAsset).source.toString()
    const jsAfterDelete = (deleteBundle[jsFile] as OutputChunk).code
    for (const token of stageTokens) {
      expect(htmlAfterDelete).not.toContain(token)
      expect(htmlAfterDelete).not.toContain(replaceWxml(token))
      expect(jsAfterDelete).not.toContain(token)
      expect(jsAfterDelete).not.toContain(replaceWxml(token))
    }

    expect(getCurrentContext().twPatcher.extract).toHaveBeenCalled()
    expect(jsHandler).toHaveBeenCalled()
  }, TEST_TIMEOUT_MS)

  it('refreshes runtime class set on build-command watch iterations for changed vue object class keys', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'dist/pages/index/index.wxml'
    const jsFile = 'dist/pages/index/index.js'
    const runtimeSets = [
      new Set(['bg-[#999999]']),
      new Set(['bg-[#999998]']),
    ] as const
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]
    const realJsHandler = createJsHandler({
      staleClassNameFallback: false,
      jsArbitraryValueFallback: false,
    })

    setCurrentContext(createContext({
      jsHandler: vi.fn((code: string, classNameSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classNameSet, options as any),
      ),
      twPatcher: {
        patch: vi.fn(async () => {}),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 3,
      },
    }))

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

    const generateBundle = postPlugin.generateBundle as any
    const firstBundle = {
      [htmlFile]: {
        ...createRollupAsset('<view class="content">{{ bgObj }}</view>'),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const bgObj = common_vendor.ref({ "bg-[#999999]": true });'),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, firstBundle)
    expect((firstBundle[jsFile] as OutputChunk).code).toContain(replaceWxml('bg-[#999999]'))
    expect((firstBundle[jsFile] as OutputChunk).code).not.toContain('bg-[#999999]')

    runtimeIndex = 1
    const secondBundle = {
      [jsFile]: {
        ...createRollupChunk('const bgObj = common_vendor.ref({ "bg-[#999998]": true });'),
        fileName: jsFile,
      },
    } as Record<string, OutputAsset | OutputChunk>

    await generateBundle?.call(postPlugin, {} as any, secondBundle)

    const transformedCode = (secondBundle[jsFile] as OutputChunk).code
    expect(transformedCode).toContain(replaceWxml('bg-[#999998]'))
    expect(transformedCode).not.toContain('bg-[#999998]')
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
  }, TEST_TIMEOUT_MS)

  it('keeps high-risk arbitrary object class keys escaped across build-command watch iterations', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const htmlFile = 'dist/pages/index/index.wxml'
    const jsFile = 'dist/pages/index/index.js'
    const stageTokens = [
      'bg-[#000]',
      'bg-[#f00]',
      'bg-[#0f0]',
      'px-[432.43px]',
      'px-[256.25px]',
      'w-[calc(100%_-_12px)]',
      'w-[calc(100%_-_24px)]',
      'bg-[rgb(12,34,56)]',
      'bg-[rgb(98,12,45)]',
      'bg-[var(--primary-color-hex)]',
      'bg-[var(--primary-color-bg)]',
      'text-[14px]',
      'text-[22px]',
    ] as const
    const runtimeSets = stageTokens.map(token => new Set([token])) as Array<Set<string>>
    let runtimeIndex = 0
    const getRuntimeSet = () => runtimeSets[runtimeIndex]
    const realJsHandler = createJsHandler({
      staleClassNameFallback: false,
      jsArbitraryValueFallback: false,
    })

    setCurrentContext(createContext({
      jsHandler: vi.fn((code: string, classNameSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classNameSet, options as any),
      ),
      twPatcher: {
        patch: vi.fn(async () => {}),
        getClassSet: vi.fn(async () => getRuntimeSet()),
        getClassSetSync: vi.fn(() => getRuntimeSet()),
        extract: vi.fn(async () => ({ classSet: getRuntimeSet() })),
        majorVersion: 3,
      },
    }))

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

    const generateBundle = postPlugin.generateBundle as any
    const stages = stageTokens.map(raw => ({ raw }))

    for (const [index, stage] of stages.entries()) {
      runtimeIndex = index
      const bundle = (
        index === 0
          ? {
              [htmlFile]: {
                ...createRollupAsset('<view class="content">{{ bgObj }}</view>'),
                fileName: htmlFile,
              },
              [jsFile]: {
                ...createRollupChunk(`const bgObj = common_vendor.ref({ "${stage.raw}": true });`),
                fileName: jsFile,
              },
            }
          : {
              [jsFile]: {
                ...createRollupChunk(`const bgObj = common_vendor.ref({ "${stage.raw}": true });`),
                fileName: jsFile,
              },
            }
      ) as Record<string, OutputAsset | OutputChunk>

      await generateBundle?.call(postPlugin, {} as any, bundle)

      const transformedCode = (bundle[jsFile] as OutputChunk).code
      expect(transformedCode).toContain(replaceWxml(stage.raw))
      expect(transformedCode).not.toContain(stage.raw)
    }

    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(stages.length)
  }, TEST_TIMEOUT_MS)
})
