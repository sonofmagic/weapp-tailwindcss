import type { OutputAsset, OutputBundle } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import {
  createBundlerGeneratedCssMarker,
} from '@/bundlers/shared/generated-css-marker'
import {
  collectViteProcessedCssAssetResults,
  injectViteProcessedCssIntoMainCssAssets,
  isCssImportOnlyBundleAsset,
  removeCssCoveredByRootStyleAssets,
} from '@/bundlers/vite/processed-css-assets'

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source,
  }
}

function opts() {
  return {
    appType: 'taro',
    cssMatcher: (file: string) => /\.(?:css|wxss)$/.test(file),
    mainCssChunkMatcher: (file: string) => /^(?:app|common)\.(?:css|wxss)$/.test(file),
  } as any
}

describe('vite processed css assets', () => {
  it('collects marker scoped css and removes covered generated source assets', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'pages/index.wxss': asset('pages/index.wxss', [
        createBundlerGeneratedCssMarker('vite', 'src/app.css'),
        '.root{color:red}',
        createBundlerGeneratedCssMarker('vite', 'src/pages/index.css'),
        '.page{color:blue}',
      ].join('\n')),
      'src/pages/index.css': asset('src/pages/index.css', '.page{color:blue}'),
    }
    const records = new Map<string, { css: string, injectIntoMain?: boolean, outputFile?: string }>()
    const mark = vi.fn()

    const collected = collectViteProcessedCssAssetResults(bundle, {
      opts: opts(),
      isViteProcessedCssAsset: (_asset, file) => file?.endsWith('.wxss') === true || file === 'src/pages/index.css',
      markCssAssetProcessed: mark,
      recordViteProcessedCssAssetResult(file, css, options) {
        records.set(file, { css, ...options })
      },
      resolveViteProcessedCssOutputFile: file => file.startsWith('src/') ? file.slice(4).replace(/\.css$/, '.wxss') : file,
      transformCss: css => css.replace('blue', 'green'),
      debug: vi.fn(),
    })

    expect(collected).toBe(3)
    expect(bundle['pages/index.wxss']).toMatchObject({ source: '.page{color:green}' })
    expect(bundle['src/pages/index.css']).toBeUndefined()
    expect(records.get('pages/index.wxss')?.css).toContain('green')
    expect(mark).toHaveBeenCalled()
  })

  it('injects processed css into root and explicit output targets', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '@import "./common.wxss";\n@source "./src";\n.root{color:red}'),
      'common.wxss': asset('common.wxss', '.common{display:block}'),
      'pages/index.wxss': asset('pages/index.wxss', '/* shell */'),
      'pages/other.wxss': asset('pages/other.wxss', '.old{color:black}'),
    }
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
      ['src/pages/index.css', { css: '.page{color:green}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
      ['src/pages/skip.css', { css: '.skip{color:red}', injectIntoMain: false, outputFile: 'pages/other.wxss' }],
      ['src/common.css', { css: '.common{display:block}', outputFile: 'common.wxss' }],
    ])
    const onUpdate = vi.fn()

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: vi.fn(),
      shouldRemoveInjectedSourceAsset: () => true,
      onUpdate,
      debug: vi.fn(),
    })

    expect(injected).toBe(2)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.generated{color:blue}')
    expect(String((bundle['app.wxss'] as OutputAsset).source)).not.toContain('@source')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toBe('/* shell */')
    expect(String((bundle['pages/other.wxss'] as OutputAsset).source)).not.toContain('.skip')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('detects import-only assets and removes scoped css covered by root styles', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.dup{color:red}\n.keep{color:blue}'),
      'pages/index.wxss': asset('pages/index.wxss', '/* tokens: dup <= src */\n.dup{color:red}\n.page{color:green}\n/* tokens: dangling <= src */'),
      'pages/import.wxss': asset('pages/import.wxss', '@import "../app.wxss";\n/* comment */'),
    }
    const onUpdate = vi.fn()

    expect(isCssImportOnlyBundleAsset(bundle, 'pages/import.wxss', '@import "../app.wxss";\n/* comment */')).toBe(true)
    expect(isCssImportOnlyBundleAsset(bundle, 'pages/import.wxss', '@import "../app.wxss";\n.keep{}')).toBe(false)
    expect(isCssImportOnlyBundleAsset(bundle, 'pages/import.wxss', '@import "../missing.wxss";')).toBe(false)

    expect(removeCssCoveredByRootStyleAssets(bundle, {
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      onUpdate,
      debug: vi.fn(),
    })).toBe(1)
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toContain('.page{color:green}')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).not.toContain('.dup')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).not.toContain('dangling')
  })

  it('replays processed css into the root target and clears injected sources', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'pages/index.wxss': asset('pages/index.wxss', '.shell{display:block}'),
      'pages/index.css': asset('pages/index.css', '.page{color:green}'),
    }
    const records = new Map<string, any>([
      ['src/pages/index.css', { css: '.page{color:green}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
      ['src/pages/skip.css', { css: '.skip{color:red}', outputFile: 'pages/skip.wxss' }],
    ])
    const mark = vi.fn()

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: {
        ...opts(),
        mainCssChunkMatcher: (file: string) => file === 'pages/index.wxss',
      },
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: mark,
      shouldRemoveInjectedSourceAsset: () => true,
      debug: vi.fn(),
    })

    expect(injected).toBe(1)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.page{color:green}')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toBe('.shell{display:block}')
    expect(String((bundle['pages/index.css'] as OutputAsset).source)).toBe('')
    expect(mark).toHaveBeenCalledWith(bundle['app.wxss'], 'app.wxss')
  })

  it('preserves taro import shell assets by injecting into the imported root asset', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'pages/index.wxss': asset('pages/index.wxss', '@import "../app.wxss";\n/* shell */'),
    }
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: { ...opts(), appType: 'uni-app-vite' },
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: vi.fn(),
      debug: vi.fn(),
    })

    expect(injected).toBe(1)
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toContain('@import')
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.generated{color:blue}')
  })

  it('records marker aliases and keeps subpackage scoped root markers isolated', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'pkg/page.wxss': asset('pkg/page.wxss', [
        createBundlerGeneratedCssMarker('vite', 'src/app.css'),
        '.root{color:red}',
        '.pkg{color:green}',
      ].join('\n')),
    }
    const records = new Map<string, any>()

    const collected = collectViteProcessedCssAssetResults(bundle, {
      opts: opts(),
      isViteProcessedCssAsset: (_asset, file) => file === 'pkg/page.wxss',
      markCssAssetProcessed: vi.fn(),
      recordViteProcessedCssAssetResult(file, css, options) {
        records.set(file, { css, ...options })
      },
      resolveViteProcessedCssOutputFile: file => file.replace(/^src\//, '').replace(/\.css$/, '.wxss'),
      subpackageRoots: new Set(['pkg']),
      debug: vi.fn(),
    })

    expect(collected).toBe(1)
    expect(String((bundle['pkg/page.wxss'] as OutputAsset).source)).toContain('.root{color:red}')
    expect(records.get('pkg/page.wxss')?.outputFile).toBe('pkg/page.wxss')
    expect(records.get('app.wxss')).toBeUndefined()
  })

  it('normalizes absolute imports, binary asset sources, empty source media wrappers, and marker aliases', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'pages/import.wxss': asset('pages/import.wxss', '@import "/app.wxss";'),
      'pages/binary.wxss': {
        ...asset('pages/binary.wxss', ''),
        source: Buffer.from(`${createBundlerGeneratedCssMarker('vite', 'src/pages/binary.css')}\n@media source("./src") {}`),
      },
      'pages/alias.wxss': asset('pages/alias.wxss', [
        '/*! weapp-tailwindcss vite-generated-css */',
        '.fallback{color:red}',
        createBundlerGeneratedCssMarker('vite', 'src/pages/alias.css'),
        '.alias{color:blue}',
      ].join('\n')),
    }
    const records = new Map<string, any>()

    expect(isCssImportOnlyBundleAsset(bundle, 'pages/import.wxss', '@import "/app.wxss";')).toBe(true)
    expect(isCssImportOnlyBundleAsset(bundle, 'pages/import.wxss', '@import "')).toBe(false)

    const collected = collectViteProcessedCssAssetResults(bundle, {
      opts: opts(),
      isViteProcessedCssAsset: (_asset, file) => file?.startsWith('pages/') === true,
      recordViteProcessedCssAssetResult(file, css, options) {
        records.set(file, { css, ...options })
      },
      resolveViteProcessedCssOutputFile: file => file.replace(/^src\//, '').replace(/\.css$/, '.wxss'),
      debug: vi.fn(),
    })

    expect(collected).toBe(3)
    expect(String((bundle['pages/binary.wxss'] as OutputAsset).source)).toBe('@media source("./src") {}')
    expect(records.get('pages/alias.wxss')?.css).toContain('.alias{color:blue}')
    expect(records.get('src/pages/alias.css')?.css).toContain('.alias{color:blue}')
  })

  it('injects into explicit non-root targets and skips duplicate, imported, and empty records', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'pages/index.wxss': asset('pages/index.wxss', '@import "../shared.wxss";\n.shell{display:block}'),
      'shared.wxss': asset('shared.wxss', '.imported{color:black}'),
    }
    const records = new Map<string, any>([
      ['src/pages/index.css', { css: '.target{color:green}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
      ['src/pages/wrong.css', { css: '.wrong{color:red}', injectIntoMain: true, outputFile: 'pages/wrong.wxss' }],
      ['src/pages/duplicate.css', { css: '.shell{display:block}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
      ['src/pages/imported.css', { css: '.imported{color:black}', outputFile: 'shared.wxss' }],
      ['src/pages/empty.css', { css: '', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
    ])

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: { ...opts(), appType: 'mpx' },
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: vi.fn(),
      debug: vi.fn(),
    })

    const pageCss = String((bundle['pages/index.wxss'] as OutputAsset).source)
    expect(injected).toBe(2)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.target{color:green}')
    expect(pageCss).toBe('@import "../shared.wxss";\n.shell{display:block}')
    expect(String((bundle['shared.wxss'] as OutputAsset).source)).toContain('.target{color:green}')
    expect(pageCss).not.toContain('.wrong')
    expect(pageCss).not.toContain('.duplicate')
  })

  it('skips preserved mini-program import shells without a single root target', () => {
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
    ])
    const debug = vi.fn()

    const scopedImportBundle: OutputBundle = {
      'pages/dep.wxss': asset('pages/dep.wxss', '.dep{color:red}'),
      'pages/index.wxss': asset('pages/index.wxss', '@import "./dep.wxss";'),
    }
    expect(injectViteProcessedCssIntoMainCssAssets(scopedImportBundle, {
      opts: { ...opts(), mainCssChunkMatcher: (file: string) => file === 'pages/index.wxss' },
      getViteProcessedCssAssetResults: () => records.entries(),
      debug,
    })).toBe(0)
    expect(String((scopedImportBundle['pages/index.wxss'] as OutputAsset).source)).toBe('@import "./dep.wxss";')

    debug.mockClear()
    const twoImportBundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'common.wxss': asset('common.wxss', '.common{color:blue}'),
      'pages/index.wxss': asset('pages/index.wxss', '@import "../app.wxss";\n@import "../common.wxss";'),
    }
    expect(injectViteProcessedCssIntoMainCssAssets(twoImportBundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      debug,
    })).toBe(2)
    expect(String((twoImportBundle['pages/index.wxss'] as OutputAsset).source)).toContain('@import "../app.wxss"')
  })

  it('keeps base css when injected records become empty or duplicate after merge checks', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.base{color:red}'),
    }
    const records = new Map<string, any>([
      ['src/duplicate.css', { css: '.base{color:red}', injectIntoMain: true, outputFile: 'app.wxss' }],
      ['src/empty.css', { css: '', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])
    const mark = vi.fn()

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: mark,
      debug: vi.fn(),
    })

    expect(injected).toBe(0)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toBe('.base{color:red}')
    expect(mark).not.toHaveBeenCalled()
  })

  it('falls back safely when source media wrappers cannot be parsed', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '@media source("./src") { /*! weapp-tailwindcss generator-placeholder */ }'),
    }
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: vi.fn(),
      debug: vi.fn(),
    })

    expect(injected).toBe(1)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toContain('.generated{color:blue}')
    expect(String((bundle['app.wxss'] as OutputAsset).source)).not.toContain('generator-placeholder')
  })

  it('injects generated css into empty root assets and preserves explicit scoped targets', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', ''),
      'pages/index.wxss': asset('pages/index.wxss', '.page{color:black}'),
    }
    const records = new Map<string, any>([
      ['src/app.css', { css: '.root{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
      ['src/pages/index.css', { css: '.scoped{color:green}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
    ])

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: vi.fn(),
      debug: vi.fn(),
    })

    expect(injected).toBe(1)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toBe('.root{color:blue}\n.scoped{color:green}')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toBe('.page{color:black}')
  })

  it('moves taro import shell injection to the imported root css asset', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', ''),
      'pages/index.wxss': asset('pages/index.wxss', '@import "../app.wxss";'),
    }
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])
    const debug = vi.fn()

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      markCssAssetProcessed: vi.fn(),
      debug,
    })

    expect(injected).toBe(1)
    expect(String((bundle['app.wxss'] as OutputAsset).source)).toBe('.generated{color:blue}')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toBe('@import "../app.wxss";')
    expect(debug).toHaveBeenCalledWith('inject vite-processed css into main css asset: %s bytes=%d', 'app.wxss', 22)
  })

  it('cleans parsed source media wrappers and empty nested at-rules before injection', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', [
        '@media source("./src") {',
        '  .from-source{display:block}',
        '}',
        '@supports (display: grid) {}',
      ].join('\n')),
    }
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: opts(),
      getViteProcessedCssAssetResults: () => records.entries(),
      debug: vi.fn(),
    })

    const css = String((bundle['app.wxss'] as OutputAsset).source)
    expect(injected).toBe(1)
    expect(css).toContain('.from-source')
    expect(css).toContain('.generated{color:blue}')
    expect(css).not.toContain('@media source')
    expect(css).not.toContain('@supports')
  })

  it('preserves taro import shells when the imported target is not injectable', () => {
    const records = new Map<string, any>([
      ['src/app.css', { css: '.generated{color:blue}', injectIntoMain: true, outputFile: 'app.wxss' }],
    ])
    const debug = vi.fn()

    const nonRootImportBundle: OutputBundle = {
      'pages/dep.wxss': asset('pages/dep.wxss', '.dep{color:red}'),
      'app.wxss': asset('app.wxss', '@import "./pages/dep.wxss";'),
    }
    expect(injectViteProcessedCssIntoMainCssAssets(nonRootImportBundle, {
      opts: {
        ...opts(),
        mainCssChunkMatcher: (file: string) => file === 'app.wxss',
      },
      getViteProcessedCssAssetResults: () => records.entries(),
      debug,
    })).toBe(0)

    const missingRootBundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '@import "./missing.wxss";'),
    }
    expect(injectViteProcessedCssIntoMainCssAssets(missingRootBundle, {
      opts: {
        ...opts(),
        mainCssChunkMatcher: (file: string) => file === 'app.wxss',
      },
      getViteProcessedCssAssetResults: () => records.entries(),
      debug,
    })).toBe(0)

    expect(debug).toHaveBeenCalledWith('preserve mini-program css import shell asset: %s', 'app.wxss')
  })

  it('skips non-root explicit targets when records are missing or empty after import coverage', () => {
    const bundle: OutputBundle = {
      'pages/index.wxss': asset('pages/index.wxss', '@import "../shared.wxss";\n.page{color:black}'),
      'shared.wxss': asset('shared.wxss', '.shared{color:black}'),
    }
    const records = new Map<string, any>([
      ['src/no-output.css', { css: '.no-output{color:red}', injectIntoMain: true }],
      ['src/wrong.css', { css: '.wrong{color:red}', injectIntoMain: true, outputFile: 'pages/other.wxss' }],
      ['src/imported.css', { css: '.shared{color:black}', injectIntoMain: true, outputFile: 'pages/index.wxss' }],
    ])

    const injected = injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts: {
        ...opts(),
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: (file: string) => file === 'pages/index.wxss',
      },
      getViteProcessedCssAssetResults: () => records.entries(),
      debug: vi.fn(),
    })

    expect(injected).toBe(1)
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).toBe('@import "../shared.wxss";\n.page{color:black}')
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source)).not.toContain('.shared{color:black}')
  })

  it('records aliases for matching multi-marker processed css blocks', () => {
    const bundle: OutputBundle = {
      'pages/index.wxss': asset('pages/index.wxss', [
        createBundlerGeneratedCssMarker('vite', 'src/pages/index.css'),
        '.page{color:green}',
        createBundlerGeneratedCssMarker('vite', 'src/pages/other.css'),
        '.other{color:red}',
      ].join('\n')),
    }
    const records: Array<[string, any]> = []

    const collected = collectViteProcessedCssAssetResults(bundle, {
      opts: opts(),
      isViteProcessedCssAsset: (_asset, file) => file === 'pages/index.wxss',
      recordViteProcessedCssAssetResult(file, css, options) {
        records.push([file, { css, ...options }])
      },
      resolveViteProcessedCssOutputFile: file => file.replace(/^src\//, '').replace(/\.css$/, '.wxss'),
      debug: vi.fn(),
    })

    expect(collected).toBe(1)
    expect(String((bundle['pages/index.wxss'] as OutputAsset).source).trim()).toBe('.page{color:green}')
    expect(records.some(([file]) => file === 'src/pages/index.css')).toBe(true)
    expect(records.some(([file]) => file === 'pages/index.wxss')).toBe(true)
  })
})
