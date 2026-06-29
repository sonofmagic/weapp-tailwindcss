import type { Plugin, ResolvedConfig } from 'vite'
import type { Compiler } from 'webpack'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveConfig } from 'vite'
import { createTaroSubPackageImportResolver } from '@/taro'
import weappStyleInjector from '@/vite'
import { StyleInjector as TaroStyleInjector } from '@/vite/taro'
import { StyleInjector as UniAppStyleInjector } from '@/vite/uni-app'
import { weappStyleInjectorWebpack } from '@/webpack'
import { StyleInjector as TaroStyleInjectorWebpack } from '@/webpack/taro'
import { StyleInjector as UniAppStyleInjectorWebpack } from '@/webpack/uni-app'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const uniAppFixturesRoot = fileURLToPath(new URL('./fixtures/uni-app', import.meta.url))
const taroFixturesRoot = fileURLToPath(new URL('./fixtures/taro', import.meta.url))

type AssetSource = string | Uint8Array

interface TestOutputAsset {
  type: 'asset'
  fileName: string
  name: string
  source?: AssetSource
}

type TestBundle = Record<string, TestOutputAsset>

function createAsset(source: AssetSource, fileName: string): TestOutputAsset {
  return {
    type: 'asset',
    fileName,
    name: fileName,
    source,
  }
}

let cachedResolvedConfig: ResolvedConfig | null = null

async function getResolvedViteConfig(): Promise<ResolvedConfig> {
  if (cachedResolvedConfig) {
    return cachedResolvedConfig
  }

  cachedResolvedConfig = await resolveConfig({
    root: packageRoot,
    logLevel: 'silent',
  }, 'build')

  return cachedResolvedConfig
}

async function invokeGenerateBundle(pluginOrPlugins: Plugin | Plugin[] | undefined, bundle: TestBundle) {
  if (!pluginOrPlugins) {
    return
  }

  const plugins = (Array.isArray(pluginOrPlugins) ? pluginOrPlugins : [pluginOrPlugins]).filter(Boolean)

  let resolvedConfig: ResolvedConfig | null = null

  for (const plugin of plugins) {
    if (plugin && typeof plugin.configResolved === 'function') {
      resolvedConfig ??= await getResolvedViteConfig()
      await (plugin.configResolved as unknown as (this: unknown, config: ResolvedConfig) => unknown).call(plugin, resolvedConfig)
    }
  }

  for (const plugin of plugins) {
    if (!plugin || typeof plugin.buildStart !== 'function') {
      continue
    }
    await (plugin.buildStart as unknown as (this: unknown) => unknown).call({
      addWatchFile() {},
    })
  }

  for (const plugin of plugins) {
    if (!plugin) {
      continue
    }

    const hook = plugin.generateBundle as unknown
    if (!hook) {
      continue
    }

    type GenerateBundleHandler = (this: unknown, options: unknown, bundle: TestBundle, isWrite: boolean) => unknown

    let handler: GenerateBundleHandler | undefined

    if (typeof hook === 'function') {
      handler = hook as GenerateBundleHandler
    }
    else if (hook && typeof hook === 'object' && 'handler' in hook && typeof (hook as { handler?: unknown }).handler === 'function') {
      handler = (hook as { handler: GenerateBundleHandler }).handler
    }

    if (!handler) {
      continue
    }

    await handler.call({
      emitFile(emittedFile: { type: 'asset', fileName?: string, name?: string, source?: AssetSource }) {
        if (emittedFile.type !== 'asset') {
          return ''
        }
        const fileName = emittedFile.fileName ?? emittedFile.name
        if (!fileName) {
          return ''
        }
        bundle[fileName] = createAsset(emittedFile.source ?? '', fileName)
        return fileName
      },
    } as unknown, {} as unknown, bundle, false)
  }
}

describe('package exports', () => {
  it('only exposes application-facing entry points', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
    ) as { exports: Record<string, unknown> }

    expect(Object.keys(packageJson.exports).sort()).toEqual([
      '.',
      './vite',
      './vite/taro',
      './vite/uni-app',
      './webpack',
      './webpack/taro',
      './webpack/uni-app',
    ])
  })
})

describe('weapp-style-injector plugin', () => {
  async function runPlugin(bundle: TestBundle, options = {}) {
    const plugin = weappStyleInjector({
      imports: ['shared/common.wxss'],
      ...options,
    })

    await invokeGenerateBundle(plugin, bundle)
  }

  it('injects @import statements into matching assets', async () => {
    const bundle = {
      'app.wxss': createAsset('.btn { color: red; }', 'app.wxss'),
    }

    await runPlugin(bundle)

    expect(bundle['app.wxss'].source).toBe(`@import "shared/common.wxss";\n.btn { color: red; }`)
  })

  it('skips files that do not match include patterns', async () => {
    const bundle = {
      'app.js': createAsset('console.log("noop")', 'app.js'),
    }

    await runPlugin(bundle)

    expect(bundle['app.js'].source).toBe('console.log("noop")')
  })

  it('supports custom include and exclude patterns', async () => {
    const bundle = {
      'styles/page.wxss': createAsset('.foo {}', 'styles/page.wxss'),
      'styles/ignore.wxss': createAsset('.bar {}', 'styles/ignore.wxss'),
    }

    await runPlugin(bundle, {
      include: ['styles/**/*.wxss'],
      exclude: ['**/ignore.wxss'],
    })

    expect(bundle['styles/page.wxss'].source).toBe(`@import "shared/common.wxss";\n.foo {}`)
    expect(bundle['styles/ignore.wxss'].source).toBe('.bar {}')
  })

  it('dedupes imports by default', async () => {
    const bundle = {
      'app.wxss': createAsset(`@import "shared/common.wxss";\n.page {}`, 'app.wxss'),
    }

    await runPlugin(bundle)

    expect(bundle['app.wxss'].source).toBe(`@import "shared/common.wxss";\n.page {}`)
  })

  it('allows injecting raw @import statements', async () => {
    const bundle = {
      'app.wxss': createAsset('.page {}', 'app.wxss'),
    }

    const plugin = weappStyleInjector({
      imports: ['@import url("https://cdn.example.com/theme.css")'],
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['app.wxss'].source).toBe(`@import url("https://cdn.example.com/theme.css");\n.page {}`)
  })

  it('can disable dedupe to force duplicate statements', async () => {
    const bundle = {
      'app.wxss': createAsset(`@import "shared/common.wxss";`, 'app.wxss'),
    }

    await runPlugin(bundle, {
      dedupe: false,
    })

    expect(bundle['app.wxss'].source).toBe(`@import "shared/common.wxss";\n@import "shared/common.wxss";`)
  })

  it('injects sub-package index imports discovered from uni-app pages.json', async () => {
    const bundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
      'sub-packages/pages/detail/item.wxss': createAsset('.item {}', 'sub-packages/pages/detail/item.wxss'),
      'sub-packages/index.wxss': createAsset('.root {}', 'sub-packages/index.wxss'),
    }

    const plugin = weappStyleInjector({
      uniAppSubPackages: {
        pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']!.source).toBe(`@import "../index.wxss";\n.home {}`)
    expect(bundle['sub-packages/pages/detail/item.wxss']!.source).toBe(`@import "../../index.wxss";\n.item {}`)
    // the index file should not import itself
    expect(bundle['sub-packages/index.wxss'].source).toBe('.root {}')
  })

  it('supports custom uni-app sub-package index file names', async () => {
    const bundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
      'sub-packages/index.css': createAsset('.root {}', 'sub-packages/index.css'),
    }

    const plugin = weappStyleInjector({
      uniAppSubPackages: {
        pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
        indexFileName: 'index.css',
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']!.source).toBe(`@import "../index.wxss";\n.home {}`)
    expect(bundle['sub-packages/index.css']!.source).toBe('.root {}')
  })

  it('generates scoped page style assets when sub-package pages have no style file', async () => {
    const bundle = {
      'sub-packages/pages/home.js': createAsset('console.log("home")', 'sub-packages/pages/home.js'),
      'sub-packages/pages/home.json': createAsset('{}', 'sub-packages/pages/home.json'),
    }

    const plugin = weappStyleInjector({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/index.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/index.css'),
          outputName: 'index',
          preprocess: false,
          framework: 'test',
          files: ['sub-packages/pages/home.wxss'],
        },
      ],
      generateSubpackageStyle() {
        return '.root {}'
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']?.source).toBe('@import "../index.wxss";')
    expect(bundle['sub-packages/index.wxss']?.source).toBe('.root {}')
    expect(bundle['sub-packages/pages/home.js'].source).toBe('console.log("home")')
  })

  it('generates css page style assets for h5-like bundles and preserves source css', async () => {
    const sourceAbsolutePath = path.join(uniAppFixturesRoot, 'sub-packages/pages/home.css')
    const bundle = {
      'sub-packages/pages/home.js': createAsset('console.log("home")', 'sub-packages/pages/home.js'),
    }

    const plugin = weappStyleInjector({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/index.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/index.css'),
          outputName: 'index',
          preprocess: false,
          framework: 'test',
          targetFiles: ['sub-packages/pages/home'],
          targetSourceFiles: [
            {
              fileName: 'sub-packages/pages/home.css',
              sourceAbsolutePath,
            },
          ],
        },
      ],
      loadSubpackageTargetStyle(_fileName, targetSourceAbsolutePath) {
        return fs.readFileSync(targetSourceAbsolutePath, 'utf8')
      },
      generateSubpackageStyle() {
        return '.root {}'
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']).toBeUndefined()
    expect(bundle['sub-packages/pages/home.css']?.source).toBe(
      `@import "../index.css";\n${fs.readFileSync(sourceAbsolutePath, 'utf8')}`,
    )
    expect(bundle['sub-packages/index.css']?.source).toBe('.root {}')
  })

  it('respects scoped exclude rules when generating page style assets', async () => {
    const bundle = {
      'sub-packages/pages/home.js': createAsset('console.log("home")', 'sub-packages/pages/home.js'),
      'sub-packages/pages/detail.js': createAsset('console.log("detail")', 'sub-packages/pages/detail.js'),
    }

    const plugin = weappStyleInjector({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/index.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/index.css'),
          outputName: 'index',
          preprocess: false,
          framework: 'test',
          files: ['sub-packages/pages/home.wxss', 'sub-packages/pages/detail.wxss'],
          exclude: ['pages/detail.wxss'],
        },
      ],
      generateSubpackageStyle() {
        return '.root {}'
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']?.source).toBe('@import "../index.wxss";')
    expect(bundle['sub-packages/pages/detail.wxss']).toBeUndefined()
  })

  it('supports multiple style entries in the same sub-package scope', async () => {
    const bundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
      'sub-packages/components/card.wxss': createAsset('.card {}', 'sub-packages/components/card.wxss'),
    }

    const plugin = weappStyleInjector({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/page.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/page.css'),
          outputName: 'page',
          preprocess: false,
          framework: 'test',
          include: ['pages/**/*.wxss'],
        },
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/component.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/component.css'),
          outputName: 'component',
          preprocess: false,
          framework: 'test',
          include: ['components/**/*.wxss'],
        },
      ],
      generateSubpackageStyle(context) {
        return path.basename(context.sourcePath) === 'page.css'
          ? '.fixture-page-entry {}'
          : '.fixture-component-entry {}'
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']?.source).toBe('@import "../page.wxss";\n.home {}')
    expect(bundle['sub-packages/components/card.wxss']?.source).toBe('@import "../component.wxss";\n.card {}')
    expect(bundle['sub-packages/page.wxss']?.source).toBe('.fixture-page-entry {}')
    expect(bundle['sub-packages/component.wxss']?.source).toBe('.fixture-component-entry {}')
    expect(bundle['sub-packages/page.wxss']?.source).not.toContain('@import')
    expect(bundle['sub-packages/component.wxss']?.source).not.toContain('@import')
  })
})

describe('vite presets', () => {
  it('injects sub-package imports via uni-app preset', async () => {
    const bundle: TestBundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
      'sub-packages/pages/detail/item.wxss': createAsset('.item {}', 'sub-packages/pages/detail/item.wxss'),
    }

    const plugin = UniAppStyleInjector({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
    })

    await invokeGenerateBundle(plugin, bundle)

    const generatedIndex = bundle['sub-packages/index.wxss']

    expect(bundle['sub-packages/pages/home.wxss']!.source).toBe(`@import "../index.wxss";\n.home {}`)
    expect(bundle['sub-packages/pages/detail/item.wxss']!.source).toBe(`@import "../../index.wxss";\n.item {}`)
    expect(generatedIndex).toBeDefined()
    expect(generatedIndex?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/index.wxss'), 'utf8'),
    )
  })

  it('generates h5 css page style assets via uni-app preset', async () => {
    const bundle: TestBundle = {
      'sub-packages/pages/home.js': createAsset('console.log("home")', 'sub-packages/pages/home.js'),
    }

    const plugin = UniAppStyleInjector({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      indexFileName: 'index.css',
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']).toBeUndefined()
    expect(bundle['sub-packages/pages/home.css']?.source).toBe(
      `@import "../index.css";\n${fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/pages/home.css'), 'utf8')}`,
    )
    expect(bundle['sub-packages/index.css']?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/index.css'), 'utf8'),
    )
  })

  it('resolves multiple style entries via uni-app preset', async () => {
    const bundle: TestBundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
    }

    const plugin = UniAppStyleInjector({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      subPackages: {
        pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
        styleEntries: [
          {
            sourceFileName: 'page.css',
            include: ['pages/**/*.wxss'],
          },
          {
            sourceFileName: 'component.css',
            include: ['components/**/*.wxss'],
          },
          {
            sourceFileName: 'weapp.css',
            sourceInclude: ['pages/**/*.weapp.vue'],
          },
          {
            sourceFileName: 'ali.css',
            sourceInclude: ['pages/**/*.ali.vue'],
          },
        ],
        preprocess: false,
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']?.source).toBe('@import "../page.wxss";\n.home {}')
    expect(bundle['sub-packages/components/card.wxss']?.source).toBe(
      `@import "../component.wxss";\n${fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/components/card.css'), 'utf8')}`,
    )
    expect(bundle['sub-packages/page.wxss']?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/page.css'), 'utf8'),
    )
    expect(bundle['sub-packages/component.wxss']?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/component.css'), 'utf8'),
    )
    expect(bundle['sub-packages/pages/home.weapp.wxss']?.source).toBe('@import "../weapp.wxss";')
    expect(bundle['sub-packages/pages/home.ali.wxss']?.source).toBe('@import "../ali.wxss";')
    expect(bundle['sub-packages/weapp.wxss']?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/weapp.css'), 'utf8'),
    )
    expect(bundle['sub-packages/ali.wxss']?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/ali.css'), 'utf8'),
    )
  })

  it('supports custom index file names via uni-app preset', async () => {
    const bundle: TestBundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
    }

    const plugin = UniAppStyleInjector({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      indexFileName: 'index.css',
    })

    await invokeGenerateBundle(plugin, bundle)

    const generatedIndex = bundle['sub-packages/index.wxss']

    expect(bundle['sub-packages/pages/home.wxss']!.source).toBe(`@import "../index.wxss";\n.home {}`)
    expect(generatedIndex).toBeDefined()
    expect(generatedIndex?.source).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/index.css'), 'utf8'),
    )
  })

  it('injects manual style scopes via uni-app preset', async () => {
    const bundle: TestBundle = {
      'custom/pages/home.wxss': createAsset('.home {}', 'custom/pages/home.wxss'),
      'custom/pages/detail.wxss': createAsset('.detail {}', 'custom/pages/detail.wxss'),
    }

    const plugin = UniAppStyleInjector({
      styleScopes: {
        type: 'manual',
        style: path.join(uniAppFixturesRoot, 'custom/global.scss'),
        scope: 'custom',
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    const generatedIndex = bundle['custom/global.wxss']

    expect(bundle['custom/pages/home.wxss']!.source).toBe(`@import "../global.wxss";\n.home {}`)
    expect(bundle['custom/pages/detail.wxss']!.source).toBe(`@import "../global.wxss";\n.detail {}`)
    expect(generatedIndex).toBeDefined()
    expect(generatedIndex?.source).toBe('.global {\n  color: #10b981;\n}')
  })

  it('compiles sass sub-package indexes via uni-app preset', async () => {
    const bundle: TestBundle = {
      'sub-packages-scss/pages/home.wxss': createAsset('.home {}', 'sub-packages-scss/pages/home.wxss'),
    }

    const plugin = UniAppStyleInjector({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages-scss.json'),
    })

    await invokeGenerateBundle(plugin, bundle)

    const generatedIndex = bundle['sub-packages-scss/index.wxss']

    expect(bundle['sub-packages-scss/pages/home.wxss']!.source).toBe(`@import "../index.wxss";\n.home {}`)
    expect(generatedIndex).toBeDefined()
    expect(generatedIndex?.source).toBe('.root {\n  color: #1c64f2;\n}')
  })

  it('supports generated sub-package style entries with custom output names', async () => {
    const bundle: TestBundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
    }

    const plugin = UniAppStyleInjector({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      subPackages: {
        pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
        outputName: 'tailwind',
        generate(context) {
          return `.generated { content: "${context.outputFileName}"; }`
        },
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/pages/home.wxss']!.source).toBe(`@import "../tailwind.wxss";\n.home {}`)
    expect(bundle['sub-packages/tailwind.wxss']?.source).toBe('.generated { content: "sub-packages/tailwind.wxss"; }')
  })

  it('injects sub-package imports via taro preset', async () => {
    const bundle = {
      'taro-sub/pages/home.css': createAsset('.home {}', 'taro-sub/pages/home.css'),
      'taro-missing/pages/detail.css': createAsset('.detail {}', 'taro-missing/pages/detail.css'),
      'legacy-sub/pages/main.css': createAsset('.legacy {}', 'legacy-sub/pages/main.css'),
      'taro-sub/index.scss': createAsset('.root {}', 'taro-sub/index.scss'),
      'legacy-sub/index.css': createAsset('.legacy-root {}', 'legacy-sub/index.css'),
    }

    const resolver = createTaroSubPackageImportResolver({
      appConfigPath: path.join(taroFixturesRoot, 'app.config.ts'),
    })

    expect(resolver?.('taro-sub/pages/home.css')).toEqual(['../index.css'])

    const plugin = TaroStyleInjector({
      appConfigPath: path.join(taroFixturesRoot, 'app.config.ts'),
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['taro-sub/pages/home.css'].source).toBe(`@import "../index.css";\n.home {}`)
    expect(bundle['legacy-sub/pages/main.css'].source).toBe(`@import "../index.css";\n.legacy {}`)
    expect(bundle['taro-missing/pages/detail.css'].source).toBe('.detail {}')
    expect(bundle['taro-sub/index.scss'].source).toBe('.root {}')
    expect(bundle['legacy-sub/index.css'].source).toBe(
      fs.readFileSync(path.join(taroFixturesRoot, 'legacy-sub/index.css'), 'utf8'),
    )
  })

  it('does not generate sub-package style entries from non-style assets', async () => {
    const bundle: TestBundle = {
      'sub-packages/pages/home.wxss': createAsset('.home {}', 'sub-packages/pages/home.wxss'),
      'sub-packages/pages/home.js': createAsset('console.log("home")', 'sub-packages/pages/home.js'),
    }

    const plugin = weappStyleInjector({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/index.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/index.css'),
          outputName: 'index',
          preprocess: false,
          framework: 'test',
        },
      ],
      generateSubpackageStyle() {
        return '.root {}'
      },
    })

    await invokeGenerateBundle(plugin, bundle)

    expect(bundle['sub-packages/index.wxss']?.source).toBe('.root {}')
    expect(bundle['sub-packages/index.js']).toBeUndefined()
    expect(bundle['sub-packages/pages/home.js'].source).toBe('console.log("home")')
  })
})

describe('weapp-style-injector webpack plugin', () => {
  class RawSource {
    constructor(private readonly value: string) {}

    source() {
      return this.value
    }

    size() {
      return this.value.length
    }
  }

  function createCompiler(stubAssets: Record<string, string>) {
    const assets: Record<string, RawSource> = Object.fromEntries(
      Object.entries(stubAssets).map(([name, value]) => [name, new RawSource(value)]),
    )

    const compilation: any = {
      hooks: {
        processAssets: {
          tap(_options: unknown, handler: () => void) {
            handler()
          },
        },
      },
      getAssets() {
        return Object.entries(assets).map(([name, source]) => ({ name, source }))
      },
      getAsset(name: string) {
        const source = assets[name]
        return source ? { name, source } : undefined
      },
      emitAsset(name: string, source: RawSource) {
        assets[name] = source
      },
      updateAsset(name: string, factory: ((source: RawSource) => RawSource) | RawSource) {
        const current = assets[name]
        if (!current) {
          throw new Error(`Called Compilation.updateAsset for not existing filename ${name}`)
        }
        assets[name] = typeof factory === 'function' ? factory(current) : factory
      },
    }

    const compiler: any = {
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: 1000,
          PROCESS_ASSETS_STAGE_ADDITIONS: 2000,
        },
        sources: {
          RawSource,
        },
      },
      hooks: {
        thisCompilation: {
          tap(_name: string, callback: (compilation: unknown) => void) {
            callback(compilation)
          },
        },
      },
    }

    return {
      compiler: compiler as unknown as Compiler,
      getAsset(name: string) {
        return assets[name]?.source()
      },
    }
  }

  it('injects @import statements into matching assets', () => {
    const { compiler, getAsset } = createCompiler({
      'app.wxss': '.btn { color: red; }',
    })

    const plugin = weappStyleInjectorWebpack({
      imports: ['shared/common.wxss'],
    })

    plugin.apply(compiler)

    expect(getAsset('app.wxss')).toBe(`@import "shared/common.wxss";\n.btn { color: red; }`)
  })

  it('respects include and exclude patterns', () => {
    const { compiler, getAsset } = createCompiler({
      'styles/page.wxss': '.foo {}',
      'styles/ignore.wxss': '.bar {}',
    })

    const plugin = weappStyleInjectorWebpack({
      imports: ['shared/common.wxss'],
      include: ['styles/**/*.wxss'],
      exclude: ['**/ignore.wxss'],
    })

    plugin.apply(compiler)

    expect(getAsset('styles/page.wxss')).toBe(`@import "shared/common.wxss";\n.foo {}`)
    expect(getAsset('styles/ignore.wxss')).toBe('.bar {}')
  })

  it('can disable dedupe to allow repeated statements', () => {
    const { compiler, getAsset } = createCompiler({
      'app.wxss': `@import "shared/common.wxss";`,
    })

    const plugin = weappStyleInjectorWebpack({
      imports: ['shared/common.wxss'],
      dedupe: false,
    })

    plugin.apply(compiler)

    expect(getAsset('app.wxss')).toBe(`@import "shared/common.wxss";\n@import "shared/common.wxss";`)
  })

  it('injects sub-package index imports discovered from uni-app pages.json', () => {
    const { compiler, getAsset } = createCompiler({
      'sub-packages/pages/home.wxss': '.home {}',
      'sub-packages/pages/detail/item.wxss': '.item {}',
      'sub-packages/index.wxss': '.root {}',
    })

    const plugin = weappStyleInjectorWebpack({
      uniAppSubPackages: {
        pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      },
    })

    plugin.apply(compiler)

    expect(getAsset('sub-packages/pages/home.wxss')).toBe(`@import "../index.wxss";\n.home {}`)
    expect(getAsset('sub-packages/pages/detail/item.wxss')).toBe(`@import "../../index.wxss";\n.item {}`)
    expect(getAsset('sub-packages/index.wxss')).toBe('.root {}')
  })

  it('supports custom uni-app sub-package index file names in webpack plugin', () => {
    const { compiler, getAsset } = createCompiler({
      'sub-packages/pages/home.wxss': '.home {}',
      'sub-packages/index.css': '.root {}',
    })

    const plugin = weappStyleInjectorWebpack({
      uniAppSubPackages: {
        pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
        indexFileName: 'index.css',
      },
    })

    plugin.apply(compiler)

    expect(getAsset('sub-packages/pages/home.wxss')).toBe(`@import "../index.wxss";\n.home {}`)
    expect(getAsset('sub-packages/index.css')).toBe('.root {}')
  })

  it('generates webpack scoped page style assets when sub-package pages have no style file', () => {
    const { compiler, getAsset } = createCompiler({
      'sub-packages/pages/home.js': 'console.log("home")',
      'sub-packages/pages/home.json': '{}',
    })

    const plugin = weappStyleInjectorWebpack({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/index.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/index.css'),
          outputName: 'index',
          preprocess: false,
          framework: 'test',
          files: ['sub-packages/pages/home.wxss'],
        },
      ],
      generateSubpackageStyle() {
        return '.root {}'
      },
    })

    plugin.apply(compiler)

    expect(getAsset('sub-packages/pages/home.wxss')).toBe('@import "../index.wxss";')
    expect(getAsset('sub-packages/index.wxss')).toBe('.root {}')
    expect(getAsset('sub-packages/pages/home.js')).toBe('console.log("home")')
  })

  it('injects sub-package imports via uni-app webpack preset', () => {
    const { compiler, getAsset } = createCompiler({
      'sub-packages/pages/home.wxss': '.home {}',
      'sub-packages/pages/detail/item.wxss': '.item {}',
      'sub-packages/index.wxss': '.root {}',
    })

    const plugin = UniAppStyleInjectorWebpack({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
    })

    plugin.apply(compiler)

    expect(getAsset('sub-packages/pages/home.wxss')).toBe(`@import "../index.wxss";\n.home {}`)
    expect(getAsset('sub-packages/pages/detail/item.wxss')).toBe(`@import "../../index.wxss";\n.item {}`)
    expect(getAsset('sub-packages/index.wxss')).toBe(
      fs.readFileSync(path.join(uniAppFixturesRoot, 'sub-packages/index.wxss'), 'utf8'),
    )
  })

  it('supports custom index file names via uni-app webpack preset', () => {
    const { compiler, getAsset } = createCompiler({
      'sub-packages/pages/home.wxss': '.home {}',
      'sub-packages/index.css': '.root {}',
    })

    const plugin = UniAppStyleInjectorWebpack({
      pagesJsonPath: path.join(uniAppFixturesRoot, 'pages.json'),
      indexFileName: 'index.css',
    })

    plugin.apply(compiler)

    expect(getAsset('sub-packages/pages/home.wxss')).toBe(`@import "../index.wxss";\n.home {}`)
    expect(getAsset('sub-packages/index.css')).toBe('.root {}')
  })

  it('injects sub-package imports via taro webpack preset', () => {
    const { compiler, getAsset } = createCompiler({
      'taro-sub/pages/home.css': '.home {}',
      'taro-missing/pages/detail.css': '.detail {}',
      'legacy-sub/pages/main.css': '.legacy {}',
      'taro-sub/index.scss': '.root {}',
      'legacy-sub/index.css': '.legacy-root {}',
    })

    const plugin = TaroStyleInjectorWebpack({
      appConfigPath: path.join(taroFixturesRoot, 'app.config.ts'),
    })

    plugin.apply(compiler)

    expect(getAsset('taro-sub/pages/home.css')).toBe(`@import "../index.css";\n.home {}`)
    expect(getAsset('legacy-sub/pages/main.css')).toBe(`@import "../index.css";\n.legacy {}`)
    expect(getAsset('taro-missing/pages/detail.css')).toBe('.detail {}')
    expect(getAsset('taro-sub/index.scss')).toBe('.root {}')
    expect(getAsset('legacy-sub/index.css')).toBe(
      fs.readFileSync(path.join(taroFixturesRoot, 'legacy-sub/index.css'), 'utf8'),
    )
  })

  it('does not generate webpack sub-package style entries from non-style assets', () => {
    const { compiler, getAsset } = createCompiler({
      'sub-packages/pages/home.wxss': '.home {}',
      'sub-packages/pages/home.js': 'console.log("home")',
    })

    const plugin = weappStyleInjectorWebpack({
      subpackageStyleScopes: [
        {
          root: 'sub-packages',
          sourceRelativePath: 'sub-packages/index.css',
          sourceAbsolutePath: path.join(uniAppFixturesRoot, 'sub-packages/index.css'),
          outputName: 'index',
          preprocess: false,
          framework: 'test',
        },
      ],
      generateSubpackageStyle() {
        return '.root {}'
      },
    })

    plugin.apply(compiler)

    expect(getAsset('sub-packages/index.wxss')).toBe('.root {}')
    expect(getAsset('sub-packages/index.js')).toBeUndefined()
    expect(getAsset('sub-packages/pages/home.js')).toBe('console.log("home")')
  })
})
