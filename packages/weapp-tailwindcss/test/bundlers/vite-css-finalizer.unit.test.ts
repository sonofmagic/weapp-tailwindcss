import type { OutputAsset, OutputBundle } from 'rollup'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
import { createViteCssFinalizerOutputPlugin } from '@/bundlers/vite/css-finalizer'

const mocks = vi.hoisted(() => ({
  generateTailwindV4Css: vi.fn(),
}))

vi.mock('@/bundlers/shared/v4-generation-core', () => ({
  generateTailwindV4Css: mocks.generateTailwindV4Css,
}))

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source,
  }
}

function getHandler(plugin: any) {
  return plugin.generateBundle.handler as (this: any, options: any, bundle: OutputBundle) => Promise<void>
}

function createContext(overrides: Record<string, any> = {}) {
  const processed = new WeakSet<OutputAsset>()
  const records = new Map<string, any>()
  const opts = {
    appType: 'taro',
    cssMatcher: (file: string) => /\.(?:css|wxss)$/.test(file),
    htmlMatcher: (file: string) => /\.(?:html|wxml)$/.test(file),
    mainCssChunkMatcher: (file: string) => /^(?:app|main)\.(?:css|wxss)$/.test(file),
    styleHandler: vi.fn(async (css: string) => ({ css: `${css}\n.handled{color:green}` })),
    onUpdate: vi.fn(),
    generator: {
      target: 'weapp',
    },
  }
  const context = {
    opts,
    runtimeState: {
      tailwindRuntime: {
        majorVersion: 4,
      },
      readyPromise: Promise.resolve(),
    },
    ensureRuntimeClassSet: vi.fn(async () => new Set(['text-red-500', 'hover:bg-red-500'])),
    isCssAssetProcessed: vi.fn((asset: OutputAsset) => processed.has(asset)),
    markCssAssetProcessed: vi.fn((asset: OutputAsset) => {
      processed.add(asset)
    }),
    debug: vi.fn(),
    getResolvedConfig: vi.fn(() => ({
      command: 'build',
      root: process.cwd(),
      build: { outDir: 'dist' },
    })),
    recordCssAssetResult: vi.fn((file: string, css: string) => {
      records.set(file, { css })
    }),
    recordViteProcessedCssAssetResult: vi.fn((file: string, css: string, options?: any) => {
      records.set(file, { css, ...options })
    }),
    getViteProcessedCssAssetResults: vi.fn(() => records.entries()),
    getSourceCandidates: vi.fn(() => new Set(['text-blue-500'])),
    waitForSourceCandidateSyncs: vi.fn(async () => undefined),
    ...overrides,
  }

  return {
    context,
    opts,
    processed,
    records,
  }
}

describe('vite css finalizer output plugin', () => {
  beforeEach(() => {
    mocks.generateTailwindV4Css.mockReset()
  })

  it('returns early outside build mode for non-native targets', async () => {
    const { context } = createContext({
      getResolvedConfig: vi.fn(() => ({ command: 'serve', root: process.cwd() })),
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(String((bundle['app.wxss'] as OutputAsset).source)).toBe('.root{color:red}')
    expect(context.markCssAssetProcessed).not.toHaveBeenCalled()
  })

  it('finalizes ordinary css assets through the configured style handler', async () => {
    const { context, opts } = createContext()
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'index.html': asset('index.html', '<html></html>'),
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.handled{color:green}')
    expect(opts.styleHandler).toHaveBeenCalledWith('.root{color:red}', expect.objectContaining({
      isMainChunk: true,
      majorVersion: 4,
      postcssOptions: {
        options: {
          from: 'app.wxss',
        },
      },
    }))
    expect(context.markCssAssetProcessed).toHaveBeenCalledWith(bundle['app.wxss'], 'app.wxss')
    expect(opts.onUpdate).toHaveBeenCalledWith(
      'app.wxss',
      '.root{color:red}',
      expect.stringContaining('.handled{color:green}'),
    )
  })

  it('strips Vite generated markers from already processed css assets', async () => {
    const { context } = createContext({
      isViteProcessedCssAsset: vi.fn((_asset: OutputAsset, file?: string) => file === 'pages/index.wxss'),
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const bundle: OutputBundle = {
      'pages/index.wxss': asset('pages/index.wxss', [
        createBundlerGeneratedCssMarker('vite', 'src/pages/index.css'),
        '.page{color:red}',
      ].join('\n')),
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toBe('.page{color:red}')
    expect(context.recordCssAssetResult).toHaveBeenCalledWith('pages/index.wxss', '.page{color:red}')
    expect(context.debug).toHaveBeenCalledWith('collect vite-processed css asset: %s bytes=%d', 'pages/index.wxss', 16)
  })

  it('generates Tailwind css for root directive assets, records dependencies, and remembers main source', async () => {
    mocks.generateTailwindV4Css.mockResolvedValue({
      css: '.generated{color:red}',
      dependencies: ['/project/tailwind.config.ts'],
    })
    const rememberMainCssSource = vi.fn()
    const { context, opts } = createContext({
      getSourceCandidates: vi.fn(() => new Set(['text-red-500', 'unsupported:hover'])),
      getSourceCandidateSourcesForEntries: vi.fn(() => new Map([
        ['text-red-500', new Set(['/project/src/index.ts'])],
      ])),
      rememberMainCssSource,
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '@import "tailwindcss";'),
    }
    const addWatchFile = vi.fn((id: string) => {
      if (id.includes('tailwind.config')) {
        const error = new Error('Cannot call "addWatchFile" after the build has finished.') as Error & { code?: string }
        error.code = 'INVALID_ROLLUP_PHASE'
        throw error
      }
    })

    await getHandler(plugin).call({ addWatchFile }, {}, bundle)

    expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: '@import "tailwindcss";',
      file: 'app.wxss',
      outputFile: 'app.wxss',
      runtime: expect.any(Set),
    }))
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.generated{color:red}')
    expect(context.recordCssAssetResult).toHaveBeenCalledWith('app.wxss', expect.stringContaining('.generated{color:red}'))
    expect(rememberMainCssSource).toHaveBeenCalledWith('app.wxss', '@import "tailwindcss";')
    expect(opts.onUpdate).toHaveBeenCalledWith('app.wxss', '@import "tailwindcss";', expect.stringContaining('.generated{color:red}'))
    expect(addWatchFile).toHaveBeenCalledWith('/project/tailwind.config.ts')
  })

  it('uses remembered main css source for processed main assets', async () => {
    mocks.generateTailwindV4Css.mockResolvedValue({
      css: '.remembered{color:blue}',
      dependencies: [],
    })
    const { context } = createContext({
      getRememberedMainCssSource: vi.fn(() => ({
        rawSource: '@import "tailwindcss";\n.from-source{}',
        sourceFile: '/project/src/app.css',
      })),
      isCssAssetProcessed: vi.fn()
        .mockReturnValueOnce(false)
        .mockReturnValue(true),
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const output = asset('app.wxss', '.processed{color:red}')
    const bundle: OutputBundle = {
      'app.wxss': output,
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: '@import "tailwindcss";\n.from-source{}',
      file: '/project/src/app.css',
      outputFile: 'app.wxss',
    }))
    expect(String(output.source)).toContain('.remembered{color:blue}')
  })

  it('skips local import css assets and does not invoke the generator', async () => {
    const { context, opts } = createContext()
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const output = asset('app.wxss', '@import "./local.css";\n.root{color:red}')
    const bundle: OutputBundle = {
      'app.wxss': output,
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(mocks.generateTailwindV4Css).not.toHaveBeenCalled()
    expect(opts.styleHandler).toHaveBeenCalledWith('@import "./local.css";\n.root{color:red}', expect.objectContaining({
      isMainChunk: true,
    }))
    expect(String(output.source)).toContain('.handled{color:green}')
  })

  it('finalizes web target css without invoking the mini-program style handler', async () => {
    const { context, opts } = createContext({
      opts: {
        appType: 'h5',
        cssMatcher: (file: string) => file.endsWith('.css'),
        htmlMatcher: (file: string) => file.endsWith('.html'),
        mainCssChunkMatcher: (file: string) => file === 'style.css',
        styleHandler: vi.fn(async (css: string) => ({ css: `${css}\n.handled{color:green}` })),
        onUpdate: vi.fn(),
        generator: {
          target: 'web',
        },
      },
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const output = asset('style.css', '@media (hover: hover){.hover\\:bg-red-500:hover{color:red}}')
    const bundle: OutputBundle = {
      'style.css': output,
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      file: 'style.css',
      outputFile: 'style.css',
    }))
    expect(opts.styleHandler).not.toHaveBeenCalled()
    expect(String(output.source)).toContain('@media (hover: hover)')
    expect(context.markCssAssetProcessed).toHaveBeenCalledWith(output, 'style.css')
  })

  it('normalizes vite-processed css assets inside finalizer entries', async () => {
    const { context } = createContext()
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const output = asset('app.wxss', [
      createBundlerGeneratedCssMarker('vite', 'src/app.css'),
      '.processed{color:red}',
    ].join('\n'))
    const bundle: OutputBundle = {
      'app.wxss': output,
    }
    context.isViteProcessedCssAsset = vi.fn(() => true)
    context.isCssAssetProcessed = vi.fn(() => false)

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(String(output.source)).toBe('.processed{color:red}')
    expect(context.markCssAssetProcessed).toHaveBeenCalledWith(output, 'app.wxss')
    expect(context.recordCssAssetResult).toHaveBeenCalledWith('app.wxss', '.processed{color:red}')
    expect(context.debug).toHaveBeenCalledWith('css finalizer skip vite-processed css: %s', 'app.wxss')
  })

  it('runs final injection and taro shell normalization when there are no pending css entries', async () => {
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])
    const { context, opts } = createContext({
      getViteProcessedCssAssetResults: vi.fn(() => records.entries()),
      getRecordedGeneratorCandidates: vi.fn(() => new Set(['cached'])),
      isCssAssetProcessed: vi.fn(() => true),
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '@source "./src";\n.root{color:red}'),
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(context.ensureRuntimeClassSet).not.toHaveBeenCalled()
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.generated{color:blue}')
    expect(String((bundle['app.wxss'] as OutputAsset).source)).not.toContain('@source')
    expect(opts.onUpdate).toHaveBeenCalled()
  })

  it('injects uni-app-x harmony apply styles when finalizer has no css assets', async () => {
    mocks.generateTailwindV4Css.mockResolvedValue({
      css: '.flex{display:flex}',
      dependencies: [],
    })
    const { context } = createContext({
      opts: {
        appType: 'uni-app-x',
        cssMatcher: (file: string) => file.endsWith('.css'),
        htmlMatcher: () => false,
        mainCssChunkMatcher: () => false,
        styleHandler: vi.fn(async (css: string) => ({ css })),
        onUpdate: vi.fn(),
        generator: {
          target: 'weapp',
        },
        uniAppX: {
          enabled: true,
        },
      },
      getSourceCandidates: vi.fn(() => new Set(['flex'])),
      getViteProcessedCssAssetResults: vi.fn(() => []),
    })
    const plugin = createViteCssFinalizerOutputPlugin(context as any)
    const bundle: OutputBundle = {
      'import/app-service.ets': asset('import/app-service.ets', 'marker'),
      'assets/App.js': {
        ...asset('assets/App.js', 'const _style_0 = {"app":{"":{"color":"blue"}}};'),
        type: 'chunk',
        code: 'const _style_0 = {"app":{"":{"color":"blue"}}};',
      } as any,
      'pages/index.js': {
        ...asset('pages/index.js', [
          'const _sfc_main = { class: "card flex" };',
          'export default _export_sfc(_sfc_main, [["__file","pages/index.uvue"]]);',
        ].join('\n')),
        type: 'chunk',
        code: [
          'const _sfc_main = { class: "card flex" };',
          'export default _export_sfc(_sfc_main, [["__file","pages/index.uvue"]]);',
        ].join('\n'),
        map: {
          sourcesContent: ['<style>.card{@apply flex}</style>'],
        },
      } as any,
    }

    await getHandler(plugin).call(plugin, {}, bundle)

    expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: expect.stringContaining('.card{@apply flex}'),
      file: 'uni-app-x-harmony-apply.css',
    }))
    expect((bundle['pages/index.js'] as any).code).toContain('display')
    expect(context.debug).toHaveBeenCalledWith('uni-app-x harmony bundle styles inject')
  })
})
