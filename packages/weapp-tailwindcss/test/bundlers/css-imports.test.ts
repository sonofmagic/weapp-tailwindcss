import { Buffer } from 'node:buffer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveTailwindcssImport, rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
import { rewriteLocalCssImportRequestsForOutput } from '@/bundlers/shared/generator-css/local-imports'
import loader, { transformCssImportRewriteSource } from '@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader'

function joinPosixPath(base: string, subpath: string) {
  return base.endsWith('/') ? `${base}${subpath}` : `${base}/${subpath}`
}

describe('bundlers/shared css-imports', () => {
  const pkgDir = '/virtual/weapp-tailwindcss'

  afterEach(() => {
    delete process.env.WEAPP_TW_LOADER_DEBUG
    vi.restoreAllMocks()
    vi.doUnmock('@/generator')
  })

  it('rewrites tailwindcss import to the package css entry for mpx', () => {
    const code = '@import "tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, {
      join: joinPosixPath,
      appType: 'mpx',
    })
    expect(rewritten).toBe(`@import "${pkgDir}/index.css";`)
  })

  it('keeps tailwindcss subpath resolution for mpx', () => {
    const code = '@import "tailwindcss/base";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, {
      join: joinPosixPath,
      appType: 'mpx',
    })
    expect(rewritten).toBe(`@import "${pkgDir}/base";`)
  })

  it('normalizes tailwindcss$ and ignores unrelated specifiers', () => {
    expect(resolveTailwindcssImport('tailwindcss$', pkgDir, { join: joinPosixPath })).toBe(`${pkgDir}/index.css`)
    expect(resolveTailwindcssImport('postcss', pkgDir)).toBeNull()
  })

  it('rewrites local source css imports to emitted mini-program style paths', () => {
    expect(rewriteLocalCssImportRequestsForOutput(
      '@import "./src/third-party-ui.css";\n.foo{color:red}',
      { styleOutputExtension: '.wxss' },
    )).toBe('@import "./third-party-ui.wxss";\n.foo{color:red}')
    expect(rewriteLocalCssImportRequestsForOutput(
      '@import "./styles/third-party-ui.css?inline";',
      { styleOutputExtension: 'acss' },
    )).toBe('@import "./styles/third-party-ui.acss?inline";')
  })

  it('rewrites buffer sources in loader for mpx', () => {
    const buf = Buffer.from('@import "tailwindcss";')
    const rewritten = transformCssImportRewriteSource(buf, {
      tailwindcssImportRewrite: {
        pkgDir,
        appType: 'mpx',
      },
    })
    expect(rewritten).toBe(`@import "${pkgDir}/index.css";`)
  })

  it('normalizes registered relative @config paths against the webpack loader resource file', async () => {
    const registerCssSource = vi.fn()
    const result = loader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          appType: 'mpx',
          registerCssSource,
        },
      }),
      resourcePath: '/repo/demo/mpx-tailwindcss-v4/src/sub-normal/pages/index.css',
      rootContext: '/repo/demo/mpx-tailwindcss-v4',
    } as any,
      [
        '@import "tailwindcss" source(none);',
        '@config "../../../tailwind.config.sub-normal.js";',
      ].join('\n'),
    )

    await Promise.resolve(result)

    expect(result).toBe([
      `@import "${pkgDir}/index.css" source(none);`,
      '@config "/repo/demo/mpx-tailwindcss-v4/tailwind.config.sub-normal.js";',
    ].join('\n'))
    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/repo/demo/mpx-tailwindcss-v4/src/sub-normal/pages/index.css',
      css: [
        '@import "tailwindcss" source(none);',
        '@config "/repo/demo/mpx-tailwindcss-v4/tailwind.config.sub-normal.js";',
      ].join('\n'),
    })
  })

  it('normalizes main package relative @config paths without depending on webpack rootContext', async () => {
    const registerCssSource = vi.fn()
    const result = loader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          appType: 'mpx',
          registerCssSource,
        },
      }),
      resourcePath: '/repo/demo/mpx-tailwindcss-v4/src/app.css',
      rootContext: '/repo/demo/mpx-tailwindcss-v4',
    } as any,
      [
        '@import "tailwindcss";',
        '@config "../tailwind.config.js";',
      ].join('\n'),
    )

    await Promise.resolve(result)

    expect(result).toBe([
      `@import "${pkgDir}/index.css";`,
      '@config "/repo/demo/mpx-tailwindcss-v4/tailwind.config.js";',
    ].join('\n'))
    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/repo/demo/mpx-tailwindcss-v4/src/app.css',
      css: [
        '@import "tailwindcss";',
        '@config "/repo/demo/mpx-tailwindcss-v4/tailwind.config.js";',
      ].join('\n'),
    })
  })

  it('keeps absolute and package import @config requests unchanged in the webpack loader', () => {
    expect(transformCssImportRewriteSource('@config "/repo/tailwind.config.js";', {
      tailwindcssImportRewrite: { pkgDir },
    })).toBe('@config "/repo/tailwind.config.js";')

    expect(transformCssImportRewriteSource('@config "#tw-config";', {
      tailwindcssImportRewrite: { pkgDir },
    })).toBe('@config "#tw-config";')
  })

  it('preserves original source when loader options are missing or unchanged', () => {
    const source = '@import "local.css";'
    const buffer = Buffer.from(source)

    expect(transformCssImportRewriteSource(source, undefined)).toBe(source)
    expect(transformCssImportRewriteSource(buffer, {
      tailwindcssImportRewrite: {
        pkgDir,
      },
    })).toBe(buffer)
  })

  it('supports url imports and trailing slash package directories', () => {
    const rewritten = transformCssImportRewriteSource('@import url("tailwindcss/theme.css");', {
      tailwindcssImportRewrite: {
        pkgDir: `${pkgDir}/`,
      },
    })

    expect(rewritten).toBe(`@import url("${pkgDir}/theme.css");`)
  })

  it('preserves original import when custom resolver returns empty', () => {
    const code = '@import "tailwindcss/base";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, {
      join: () => null as unknown as string,
    })

    expect(rewritten).toBeUndefined()
  })

  it('emits debug output and runs as a webpack loader', () => {
    process.env.WEAPP_TW_LOADER_DEBUG = '1'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    const rewritten = loader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
        },
      }),
      resourcePath: '/src/app.css',
    } as any, '@import "tailwindcss/base";')

    expect(rewritten).toBe(`@import "${pkgDir}/base";`)
    expect(write).toHaveBeenCalledWith(expect.stringContaining('executing for /src/app.css'))
    expect(write).toHaveBeenCalledWith(expect.stringContaining('rewritten import'))
  })

  it('registers tailwindcss root css sources from the webpack loader', async () => {
    const registerCssSource = vi.fn()
    const result = loader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          registerCssSource,
        },
      }),
      resourcePath: '/src/app.css',
    } as any, '@import "tailwindcss";\n@source inline("w-4");')

    await Promise.resolve(result)

    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/src/app.css',
      css: '@import "tailwindcss";\n@source inline("w-4");',
    })
  })

  it('emits generated css from webpack loader before postcss-loader runs', async () => {
    const { default: webpackLoader } = await import('@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader')
    const result = webpackLoader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
        },
      }),
      resourcePath: '/src/app.css',
      rootContext: '/src',
    } as any, '@import "tailwindcss";\n@config "./tailwind.config.js";')

    expect(result).toBe('@import "/virtual/weapp-tailwindcss/index.css";\n@config "/src/tailwind.config.js";')
  })

  it('expands Tailwind v4 mini-program css before postcss-loader can consume source(none)', async () => {
    vi.resetModules()
    const generateTailwindV4Css = vi.fn(async (options: any) => ({
      css: [
        '.bg-brand{background-color:#123456}',
        '.rounded-full{border-radius:9999px}',
        '.dark .text-foreground{color:#ffffff}',
      ].join('\n'),
      target: 'weapp',
      source: 'generator',
      classSet: new Set(['bg-brand', 'rounded-full', 'dark:text-foreground']),
      dependencies: ['/repo/tailwind.config.ts'],
      metadata: {
        file: options.file,
        majorVersion: 4,
        outputFile: options.outputFile,
      },
    }))
    vi.doMock('@/bundlers/shared/v4-generation-core', () => ({
      generateTailwindV4Css,
    }))
    const { default: webpackLoader } = await import('@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader')
    const registerCssSource = vi.fn()
    const registerCssSourceFile = vi.fn()
    const registerGeneratedCss = vi.fn()
    const markGeneratedCssSource = vi.fn()
    const addDependency = vi.fn()
    const source = [
      '@import "tailwindcss" source(none);',
      '@config "../../tailwind.config.ts";',
      '@theme {',
      '  --radius-full: 9999px;',
      '}',
      '@source "../../src/**/*.{js,jsx,ts,tsx,md,mdx}";',
      '@source "../../docs/**/*.{md,mdx}";',
      '@source "../../blog/**/*.{md,mdx}";',
      '@source "../../config/**/*.{ts,tsx}";',
      '@source "../../docusaurus.config.ts";',
      '@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));',
    ].join('\n')

    const result = await webpackLoader.call({
      addDependency,
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          appType: 'taro',
          compilerOptions: {
            appType: 'taro',
            generator: {},
            mainCssChunkMatcher: () => true,
            styleHandler: async (css: string) => ({ css }),
          },
          getRuntimeSet: async () => new Set(['bg-brand', 'rounded-full', 'dark:text-foreground']),
          markGeneratedCssSource,
          registerGeneratedCss,
          registerCssSource,
          registerCssSourceFile,
          runtimeState: {
            readyPromise: Promise.resolve(),
            tailwindRuntime: { majorVersion: 4 },
          },
        },
      }),
      resourcePath: '/repo/website/src/css/custom.css',
      rootContext: '/repo/website',
    } as any, source)

    expect(generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: expect.stringContaining('@import "tailwindcss" source(none);'),
      file: '/repo/website/src/css/custom.css',
      outputFile: '/repo/website/src/css/custom.css',
      cssHandlerOptions: expect.objectContaining({
        isMainChunk: true,
      }),
    }))
    expect(generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: expect.stringContaining('@config "/repo/website/tailwind.config.ts";'),
    }))
    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/repo/website/src/css/custom.css',
      css: expect.stringContaining('@config "/repo/website/tailwind.config.ts";'),
    })
    expect(registerCssSourceFile).toHaveBeenCalledWith(expect.objectContaining({
      file: '/repo/website/src/css/custom.css',
      processed: false,
      css: expect.stringContaining('@source "../../src/**/*.{js,jsx,ts,tsx,md,mdx}";'),
    }))
    expect(result).toContain(createBundlerGeneratedCssMarker('webpack', '/repo/website/src/css/custom.css'))
    expect(result).toContain('.bg-brand{background-color:#123456}')
    expect(result).not.toContain('@import "tailwindcss"')
    expect(result).not.toContain('@media source(none)')
    expect(result).not.toContain('source(none)')
    expect(result).not.toContain(':not(#\\#)')
    expect(result).not.toContain('@config')
    expect(result).not.toContain('@source')
    expect(addDependency).toHaveBeenCalledWith('/repo/tailwind.config.ts')
    expect(markGeneratedCssSource).toHaveBeenCalledWith('/repo/website/src/css/custom.css')
    expect(registerGeneratedCss).toHaveBeenCalledWith({
      classSet: new Set(['bg-brand', 'rounded-full', 'dark:text-foreground']),
      css: expect.stringContaining('.bg-brand{background-color:#123456}'),
      dependencies: ['/repo/tailwind.config.ts'],
      file: '/repo/website/src/css/custom.css',
    })
  })

  it('removes Tailwind source directives from generated webpack H5 css', async () => {
    vi.resetModules()
    const generateTailwindV4Css = vi.fn(async (options: any) => ({
      css: [
        '@import "tailwindcss" source(none);',
        '@config "/repo/demo/taro-webpack-react-tailwindcss-v4/tailwind.config.sub-normal.js";',
        '@source "./src/**/*.{tsx,css}";',
        '.bg-red-500 { background-color: red; }',
      ].join('\n'),
      target: 'web',
      source: 'generator',
      classSet: new Set(['bg-red-500']),
      dependencies: ['/repo/demo/taro-webpack-react-tailwindcss-v4/tailwind.config.sub-normal.js'],
      metadata: {
        file: options.file,
        majorVersion: 4,
        outputFile: options.outputFile,
      },
    }))
    vi.doMock('@/bundlers/shared/v4-generation-core', () => ({
      generateTailwindV4Css,
    }))
    const { default: webpackLoader } = await import('@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader')
    const registerCssSource = vi.fn()
    const registerCssSourceFile = vi.fn()
    const markGeneratedCssSource = vi.fn()
    const addDependency = vi.fn()
    const source = [
      '@import "tailwindcss" source(none);',
      '@config "../../../tailwind.config.sub-normal.js";',
      '@source "./src/**/*.{tsx,css}";',
    ].join('\n')

    const result = await webpackLoader.call({
      addDependency,
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          appType: 'taro',
          compilerOptions: {
            appType: 'taro',
            generator: { target: 'web' },
            mainCssChunkMatcher: () => false,
            styleHandler: async (css: string) => ({ css }),
          },
          getRuntimeSet: async () => new Set(['bg-red-500']),
          markGeneratedCssSource,
          registerCssSource,
          registerCssSourceFile,
          runtimeState: {
            readyPromise: Promise.resolve(),
            tailwindRuntime: { majorVersion: 4 },
          },
        },
      }),
      resourcePath: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/sub-normal/pages/index.css',
      rootContext: '/repo/demo/taro-webpack-react-tailwindcss-v4',
    } as any, source)

    expect(generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: expect.stringContaining('@config "/repo/demo/taro-webpack-react-tailwindcss-v4/tailwind.config.sub-normal.js";'),
    }))
    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/sub-normal/pages/index.css',
      css: expect.stringContaining('@config "/repo/demo/taro-webpack-react-tailwindcss-v4/tailwind.config.sub-normal.js";'),
    })
    expect(registerCssSourceFile).toHaveBeenCalledWith(expect.objectContaining({
      css: expect.stringContaining('@config "/repo/demo/taro-webpack-react-tailwindcss-v4/tailwind.config.sub-normal.js";'),
    }))
    expect(result).toContain(createBundlerGeneratedCssMarker('webpack', '/repo/demo/taro-webpack-react-tailwindcss-v4/src/sub-normal/pages/index.css'))
    expect(result).toContain('.bg-red-500 { background-color: red; }')
    expect(result).not.toContain('@config')
    expect(result).not.toContain('@source')
    expect(result).not.toContain('@import "tailwindcss"')
    expect(addDependency).toHaveBeenCalledWith('/repo/demo/taro-webpack-react-tailwindcss-v4/tailwind.config.sub-normal.js')
    expect(markGeneratedCssSource).toHaveBeenCalledWith('/repo/demo/taro-webpack-react-tailwindcss-v4/src/sub-normal/pages/index.css')
  })

  it('generates webpack H5 css for apply-only entries', async () => {
    vi.resetModules()
    const generateTailwindV4Css = vi.fn(async (options: any) => ({
      css: [
        '[data-tw-watch-web="marker"] {',
        '  background-color: rgb(18,52,86);',
        '  width: 88px;',
        '  height: 44px;',
        '}',
      ].join('\n'),
      target: 'web',
      source: 'generator',
      classSet: new Set(['bg-[#123456]', 'w-[88px]', 'h-[44px]']),
      dependencies: [],
      metadata: {
        file: options.file,
        majorVersion: 4,
        outputFile: options.outputFile,
      },
    }))
    vi.doMock('@/bundlers/shared/v4-generation-core', () => ({
      generateTailwindV4Css,
    }))
    const { default: webpackLoader } = await import('@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader')
    const registerCssSource = vi.fn()
    const registerCssSourceFile = vi.fn()
    const markGeneratedCssSource = vi.fn()
    const registerGeneratedCss = vi.fn()
    const source = '[data-tw-watch-web="marker"] { @apply bg-[#123456] w-[88px] h-[44px]; }'

    const result = await webpackLoader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          appType: 'taro',
          compilerOptions: {
            appType: 'taro',
            generator: { target: 'web' },
            mainCssChunkMatcher: () => false,
            styleHandler: async (css: string) => ({ css }),
          },
          getRuntimeSet: async () => new Set(['bg-[#123456]', 'w-[88px]', 'h-[44px]']),
          markGeneratedCssSource,
          registerGeneratedCss,
          registerCssSource,
          registerCssSourceFile,
          runtimeState: {
            readyPromise: Promise.resolve(),
            tailwindRuntime: { majorVersion: 4 },
          },
        },
      }),
      resourcePath: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css',
      rootContext: '/repo/demo/taro-webpack-react-tailwindcss-v4',
    } as any, source)

    expect(generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      rawSource: source,
      file: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css',
      outputFile: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css',
    }))
    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css',
      css: source,
    })
    expect(registerCssSourceFile).toHaveBeenCalledWith({
      file: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css',
      css: source,
      processed: false,
    })
    expect(result).toContain(createBundlerGeneratedCssMarker('webpack', '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css'))
    expect(result).toContain('[data-tw-watch-web="marker"]')
    expect(result).toContain('width: 88px;')
    expect(registerGeneratedCss).toHaveBeenCalledWith(expect.objectContaining({
      classSet: new Set(['bg-[#123456]', 'w-[88px]', 'h-[44px]']),
      css: expect.stringContaining('[data-tw-watch-web="marker"]'),
      file: '/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css',
    }))
    expect(markGeneratedCssSource).toHaveBeenCalledWith('/repo/demo/taro-webpack-react-tailwindcss-v4/src/app.css')
  })

  it('registers sanitized preprocessor root css sources from the webpack loader', async () => {
    const registerCssSource = vi.fn()
    const result = loader.call({
      getOptions: () => ({
        tailwindcssImportRewrite: {
          pkgDir,
          registerCssSource,
        },
      }),
      resourcePath: '/src/app.scss',
    } as any, [
      '// source comment',
      '$brand: #123456;',
      '@import "weapp-tailwindcss";',
      '@source inline("w-4");',
      '.card { color: $brand; }',
    ].join('\n'))

    await Promise.resolve(result)

    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/src/app.scss',
      css: '@import "tailwindcss";\n@source inline("w-4");',
    })
  })

  it('keeps legacy weapp-tailwindcss root imports resolvable as compatibility aliases', () => {
    const code = '@import "weapp-tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, { join: joinPosixPath })
    expect(rewritten).toBe(`@import "${pkgDir}/index.css";`)
  })

  it('rewrites tailwindcss import to package css entry for non-mpx', () => {
    const code = '@import "tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, { join: joinPosixPath })
    expect(rewritten).toBe(`@import "${pkgDir}/index.css";`)
  })
})
