import { beforeEach, describe, expect, it, vi } from 'vitest'

const createHandlersFromContext = vi.fn(() => ({
  styleHandler: Symbol('style'),
  jsHandler: Symbol('js'),
  templateHandler: Symbol('template'),
}))

const createTailwindcssPatcherFromContext = vi.fn()

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: {
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
