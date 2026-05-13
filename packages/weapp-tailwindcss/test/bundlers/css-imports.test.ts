import { Buffer } from 'node:buffer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveTailwindcssImport, rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import loader, { transformCssImportRewriteSource } from '@/bundlers/webpack/loaders/weapp-tw-css-import-rewrite-loader'

function joinPosixPath(base: string, subpath: string) {
  return base.endsWith('/') ? `${base}${subpath}` : `${base}/${subpath}`
}

describe('bundlers/shared css-imports', () => {
  const pkgDir = '/virtual/weapp-tailwindcss'

  afterEach(() => {
    delete process.env.WEAPP_TW_LOADER_DEBUG
    vi.restoreAllMocks()
  })

  it('rewrites tailwindcss import to weapp entry for mpx', () => {
    const code = '@import "tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, {
      join: joinPosixPath,
      appType: 'mpx',
    })
    expect(rewritten).toBe('@import "weapp-tailwindcss/index.css";')
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
    expect(resolveTailwindcssImport('tailwindcss$', pkgDir)).toBe('weapp-tailwindcss/index.css')
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
    expect(rewritten).toBe('@import "weapp-tailwindcss/index.css";')
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
      query: {
        tailwindcssImportRewrite: {
          pkgDir,
        },
      },
      resourcePath: '/src/app.css',
    } as any, '@import "tailwindcss/base";')

    expect(rewritten).toBe(`@import "${pkgDir}/base";`)
    expect(write).toHaveBeenCalledWith(expect.stringContaining('executing for /src/app.css'))
    expect(write).toHaveBeenCalledWith(expect.stringContaining('rewritten import'))
  })

  it('registers tailwindcss root css sources from the webpack loader', async () => {
    const registerCssSource = vi.fn()
    const result = loader.call({
      query: {
        tailwindcssImportRewrite: {
          pkgDir,
          registerCssSource,
        },
      },
      resourcePath: '/src/app.css',
    } as any, '@import "tailwindcss";\n@source inline("w-4");')

    await Promise.resolve(result)

    expect(registerCssSource).toHaveBeenCalledWith({
      file: '/src/app.css',
      css: '@import "tailwindcss";\n@source inline("w-4");',
    })
  })

  it('rewrites tailwindcss import to weapp entry for non-mpx', () => {
    const code = '@import "tailwindcss";'
    const rewritten = rewriteTailwindcssImportsInCode(code, pkgDir, { join: joinPosixPath })
    expect(rewritten).toBe('@import "weapp-tailwindcss/index.css";')
  })
})
