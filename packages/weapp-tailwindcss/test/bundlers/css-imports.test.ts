import { Buffer } from 'node:buffer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveTailwindcssImport, rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
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
      '@config "./tailwind.config.sub-normal.js";',
    ].join('\n'))
    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/repo/demo/mpx-tailwindcss-v4/src/sub-normal/pages/index.css',
      css: [
        '@import "tailwindcss" source(none);',
        '@config "./tailwind.config.sub-normal.js";',
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

    expect(result).toBe('@import "/virtual/weapp-tailwindcss/index.css";\n@config "./tailwind.config.js";')
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
