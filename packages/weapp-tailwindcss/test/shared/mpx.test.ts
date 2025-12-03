import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ensureMpxTailwindcssAliases,
  getTailwindcssCssEntry,
  injectMpxCssRewritePreRules,
  isMpx,
  patchMpxLoaderResolve,
  setupMpxTailwindcssRedirect,
} from '@/shared/mpx'

const installTailwindcssCssRedirectMock = vi.hoisted(() => vi.fn())
vi.mock('@/shared/tailwindcss-css-redirect', () => {
  return {
    installTailwindcssCssRedirect: installTailwindcssCssRedirectMock,
  }
})

const pkgDir = '/virtual/weapp-tailwindcss'

describe('shared/mpx helpers', () => {
  beforeEach(() => {
    installTailwindcssCssRedirectMock.mockClear()
  })

  it('detects mpx app types', () => {
    expect(isMpx('mpx')).toBe(true)
    expect(isMpx('uni-app' as any)).toBe(false)
    expect(isMpx(undefined)).toBe(false)
  })

  it('returns tailwindcss css entry', () => {
    expect(getTailwindcssCssEntry(pkgDir)).toBe(path.join(pkgDir, 'index.css'))
  })

  it('ensures aliases for object-style resolve config', () => {
    const compiler: any = { options: { resolve: { alias: { keep: 'value' } } } }
    const entry = ensureMpxTailwindcssAliases(compiler, pkgDir)
    expect(entry).toBe(path.join(pkgDir, 'index.css'))
    expect(compiler.options.resolve.alias.keep).toBe('value')
    expect(compiler.options.resolve.alias.tailwindcss).toBe(entry)
    expect(compiler.options.resolve.alias.tailwindcss$).toBe(entry)
  })

  it('ensures aliases for array-style resolve config', () => {
    const alias: any[] = []
    const compiler: any = { options: { resolve: { alias } } }
    const entry = ensureMpxTailwindcssAliases(compiler, pkgDir)
    expect(alias).toEqual([
      { name: 'tailwindcss', alias: entry },
      { name: 'tailwindcss$', alias: entry },
    ])
  })

  it('wraps loaderContext.resolve once and redirects tailwindcss requests', () => {
    const originalResolve = vi.fn((_context, request: string, callback: any) => callback(null, `resolved:${request}`))
    const loaderContext: any = { resolve: originalResolve }
    patchMpxLoaderResolve(loaderContext, pkgDir, true)
    const patchedResolve = loaderContext.resolve
    expect(patchedResolve).not.toBe(originalResolve)

    const results: Record<string, string> = {}
    patchedResolve({}, 'tailwindcss', (_err: any, value: string) => {
      results.tailwindcss = value
    })
    patchedResolve({}, 'tailwindcss$', (_err: any, value: string) => {
      results.tailwindcssDollar = value
    })
    patchedResolve({}, 'tailwindcss/plugin', (_err: any, value: string) => {
      results.tailwindcssSubpath = value
    })
    patchedResolve({}, 'lodash', (_err: any, value: string) => {
      results.other = value
    })

    const cssEntry = path.join(pkgDir, 'index.css')
    expect(results.tailwindcss).toBe(cssEntry)
    expect(results.tailwindcssDollar).toBe(cssEntry)
    expect(results.tailwindcssSubpath).toBe(path.join(pkgDir, 'plugin'))
    expect(results.other).toBe('resolved:lodash')
    expect(originalResolve).toHaveBeenCalledTimes(1)

    patchMpxLoaderResolve(loaderContext, pkgDir, true)
    expect(loaderContext.resolve).toBe(patchedResolve)
  })

  it('does not patch when disabled or resolve is missing', () => {
    const loaderContext: any = { resolve: vi.fn() }
    patchMpxLoaderResolve(loaderContext, pkgDir, false)
    expect(loaderContext.resolve).not.toHaveProperty('__weappTwPatched')

    const withoutResolve: any = {}
    expect(() => patchMpxLoaderResolve(withoutResolve, pkgDir, true)).not.toThrow()
  })

  it('sets up tailwindcss redirect only when enabled', () => {
    setupMpxTailwindcssRedirect(pkgDir, true)
    expect(installTailwindcssCssRedirectMock).toHaveBeenCalledTimes(1)
    expect(installTailwindcssCssRedirectMock).toHaveBeenCalledWith(pkgDir)
    setupMpxTailwindcssRedirect(pkgDir, false)
    expect(installTailwindcssCssRedirectMock).toHaveBeenCalledTimes(1)
  })

  it('injects pre rules for css rewrite when loader is provided', () => {
    const compiler: any = { options: { module: { rules: [{ test: /foo/ }] } } }
    const loaderOptions = { flag: true }
    injectMpxCssRewritePreRules(compiler, 'virtual-loader', loaderOptions)
    expect(compiler.options.module.rules[0]).toMatchObject({
      resourceQuery: /type=styles/,
      enforce: 'pre',
      use: [{ loader: 'virtual-loader', options: loaderOptions }],
    })
    expect(compiler.options.module.rules[1]).toMatchObject({
      test: /\.css$/i,
      enforce: 'pre',
      use: [{ loader: 'virtual-loader', options: loaderOptions }],
    })
    expect(compiler.options.module.rules[2]).toMatchObject({ test: /foo/ })
  })

  it('skips rule injection when loader is absent', () => {
    const compiler: any = { options: {} }
    injectMpxCssRewritePreRules(compiler, undefined, {})
    expect(compiler.options.module).toBeUndefined()
  })
})
