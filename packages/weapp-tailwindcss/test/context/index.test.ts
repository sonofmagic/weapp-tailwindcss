import { mkdtemp, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createHandlersFromContext = vi.fn(() => ({
  styleHandler: Symbol('style'),
  jsHandler: Symbol('js'),
  templateHandler: Symbol('template'),
}))

const createTailwindcssPatcherFromContext = vi.fn()

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  },
  pc: {
    cyanBright: (value: string) => value,
    underline: (value: string) => value,
    bold: (value: string) => value,
    green: (value: string) => value,
  },
}))

vi.mock('@/cache', () => ({
  initializeCache: vi.fn(() => Symbol('cache')),
}))

vi.mock('@/defaults', () => ({
  getDefaultOptions: () => ({
    customReplaceDictionary: {},
    logLevel: 'silent',
    cssCalc: undefined,
    customAttributes: {},
    cache: undefined,
  }),
  resolveDefaultCssPreflight: (cssPreflight: any, majorVersion?: number) => {
    if (cssPreflight === false) {
      return false
    }
    return {
      ...(majorVersion === 4
        ? {
            'box-sizing': 'border-box',
            margin: '0',
            padding: '0',
            border: '0 solid',
          }
        : {
            'box-sizing': 'border-box',
            'border-width': '0',
            'border-style': 'solid',
            'border-color': 'currentColor',
          }),
      ...(cssPreflight ?? {}),
    }
  },
}))

vi.mock('@/context/custom-attributes', () => ({
  toCustomAttributesEntities: vi.fn(() => []),
}))

vi.mock('@/context/handlers', () => ({
  createHandlersFromContext,
}))

vi.mock('@/context/tailwindcss', () => ({
  createTailwindcssPatcherFromContext,
}))

describe('getCompilerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    createHandlersFromContext.mockClear()
    createTailwindcssPatcherFromContext.mockReset()
    const globalCacheHolder = globalThis as { __WEAPP_TW_COMPILER_CONTEXT_CACHE__?: Map<string, unknown> }
    globalCacheHolder.__WEAPP_TW_COMPILER_CONTEXT_CACHE__?.clear?.()
  })

  it('provides empty includeCustomProperties when tailwindcss v4 auto enables cssCalc', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.0.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext()

    const forwardedCalcOptions = (createHandlersFromContext.mock.calls[0] as any)?.[2]

    expect(forwardedCalcOptions).toEqual({
      includeCustomProperties: [],
    })
    expect(ctx.cssCalc).toEqual({
      includeCustomProperties: [],
    })
  })

  it('uses Tailwind v4 preflight defaults when the runtime is v4', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext()

    expect(ctx.cssPreflight).toEqual({
      'box-sizing': 'border-box',
      margin: '0',
      padding: '0',
      border: '0 solid',
    })
    expect((createHandlersFromContext.mock.calls[0] as any)?.[0]?.cssPreflight).toEqual(ctx.cssPreflight)
  })

  it('merges user cssPreflight overrides on top of Tailwind v4 defaults', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext({
      cssPreflight: {
        margin: false,
        background: 'black',
      },
    })

    expect(ctx.cssPreflight).toEqual({
      'box-sizing': 'border-box',
      margin: false,
      padding: '0',
      border: '0 solid',
      background: 'black',
    })
  })

  it('uses lightweight border preflight for Tailwind v4 uni-app x output', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext({
      uniAppX: true,
    })

    expect(ctx.cssPreflight).toEqual({
      'box-sizing': 'border-box',
      margin: '0',
      padding: '0',
      border: false,
      'border-width': '0',
      'border-style': false,
    })
    expect((createHandlersFromContext.mock.calls[0] as any)?.[0]?.cssPreflight).toEqual(ctx.cssPreflight)
  })

  it('keeps explicit uni-app x border preflight overrides', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext({
      uniAppX: true,
      cssPreflight: {
        border: '0 solid',
        'border-style': 'solid',
      },
    })

    expect(ctx.cssPreflight).toMatchObject({
      border: '0 solid',
      'border-width': '0',
      'border-style': 'solid',
    })
  })

  it('keeps Tailwind v3 preflight defaults when the runtime is v3', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '3.4.19' },
      majorVersion: 3,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext()

    expect(ctx.cssPreflight).toEqual({
      'box-sizing': 'border-box',
      'border-width': '0',
      'border-style': 'solid',
      'border-color': 'currentColor',
    })
  })

  it('keeps user provided arrays intact when no defaults defined', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext({
      cssCalc: ['--gap'],
    })

    const forwardedCalcOptions = (createHandlersFromContext.mock.calls[0] as any)?.[2]

    expect(forwardedCalcOptions).toEqual(['--gap'])
    expect(ctx.cssCalc).toEqual(['--gap'])
  })

  it('keeps user objects intact when spacing is already covered', async () => {
    const includeCustomProperties = [/^--spacing$/]
    const originalOptions = {
      includeCustomProperties,
      precision: 5,
    }

    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext({
      cssCalc: originalOptions,
    })

    const forwardedCalcOptions = (createHandlersFromContext.mock.calls[0] as any)?.[2]

    expect(forwardedCalcOptions).toBe(originalOptions)
    expect(ctx.cssCalc).toBe(originalOptions)
    expect(includeCustomProperties).toHaveLength(1)
    expect(includeCustomProperties[0]).toBeInstanceOf(RegExp)
  })

  it('warns when tailwindcss v4 is used without cssEntries', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0', rootPath: '/workspace/tailwindcss' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const { logger } = await import('@weapp-tailwindcss/logger')

    getCompilerContext()

    const warn = vi.mocked(logger.warn)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('cssEntries')
    expect(warn.mock.calls[0][0]).toContain('绝对路径')
  })

  it('does not warn when cssEntries are provided for tailwindcss v4', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0', rootPath: '/workspace/tailwindcss' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const { logger } = await import('@weapp-tailwindcss/logger')

    getCompilerContext({
      cssEntries: ['/absolute/path/to/app.css'],
    })

    expect(logger.warn).not.toHaveBeenCalled()
  })
})

describe('clearTailwindcssPatcherCache', () => {
  it('skips missing and disabled patchers', async () => {
    const { clearTailwindcssPatcherCache } = await import('@/context')
    const clearCache = vi.fn()

    await expect(clearTailwindcssPatcherCache(undefined)).resolves.toBeUndefined()
    await expect(clearTailwindcssPatcherCache({
      clearCache,
      options: {
        cache: {
          enabled: false,
        },
      },
    } as never)).resolves.toBeUndefined()
    await expect(clearTailwindcssPatcherCache({
      clearCache,
      options: {
        cache: null,
      },
    } as never)).resolves.toBeUndefined()

    expect(clearCache).not.toHaveBeenCalled()
  })

  it('clears patcher cache and removes configured cache paths', async () => {
    const { clearTailwindcssPatcherCache } = await import('@/context')
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-clear-cache-'))
    const cacheFile = path.join(root, 'cache.json')
    const privateCacheFile = path.join(root, 'private.json')
    const cacheDir = path.join(root, 'dir')

    await import('node:fs/promises').then(async fs => Promise.all([
      fs.writeFile(cacheFile, '{}'),
      fs.writeFile(privateCacheFile, '{}'),
      fs.mkdir(cacheDir),
    ]))

    const clearCache = vi.fn(async () => {})
    await clearTailwindcssPatcherCache({
      clearCache,
      options: {
        cache: {
          path: cacheFile,
          dir: cacheDir,
        },
      },
      cacheStore: {
        options: {
          path: privateCacheFile,
        },
      },
    } as never, {
      removeDirectory: true,
    })

    await expect(stat(cacheFile)).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(stat(privateCacheFile)).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(stat(cacheDir)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(clearCache).toHaveBeenCalledWith({ scope: 'all' })
  })

  it('continues when patcher clearCache throws', async () => {
    const { clearTailwindcssPatcherCache } = await import('@/context')
    const { logger } = await import('@weapp-tailwindcss/logger')

    await expect(clearTailwindcssPatcherCache({
      clearCache: vi.fn(async () => {
        throw new Error('clear failed')
      }),
      options: {
        cache: true,
      },
    } as never)).resolves.toBeUndefined()

    expect(logger.debug).toHaveBeenCalledWith(
      'failed to clear tailwindcss patcher cache via clearCache(): %O',
      expect.any(Error),
    )
  })
})
