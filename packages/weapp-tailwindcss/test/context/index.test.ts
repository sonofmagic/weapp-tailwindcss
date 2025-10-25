import { beforeEach, describe, expect, it, vi } from 'vitest'

const createHandlersFromContext = vi.fn(() => ({
  styleHandler: Symbol('style'),
  jsHandler: Symbol('js'),
  templateHandler: Symbol('template'),
}))

const createTailwindcssPatcherFromContext = vi.fn()

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: {
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

vi.mock('@weapp-tailwindcss/mangle', () => ({
  useMangleStore: () => ({
    initMangle: vi.fn(),
    mangleContext: Symbol('mangleContext'),
    setMangleRuntimeSet: vi.fn(),
  }),
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
    mangle: undefined,
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
    vi.resetModules()
    createHandlersFromContext.mockClear()
    createTailwindcssPatcherFromContext.mockReset()
  })

  it('injects --spacing into includeCustomProperties when tailwindcss v4 auto enables cssCalc', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.0.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext()

    const forwardedCalcOptions = (createHandlersFromContext.mock.calls[0] as any)?.[3]

    expect(forwardedCalcOptions).toEqual({
      includeCustomProperties: ['--spacing'],
    })
    expect(ctx.cssCalc).toEqual({
      includeCustomProperties: ['--spacing'],
    })
  })

  it('appends --spacing to user provided arrays', async () => {
    createTailwindcssPatcherFromContext.mockReturnValue({
      packageInfo: { version: '4.1.0' },
      majorVersion: 4,
    })

    const { getCompilerContext } = await import('@/context')
    const ctx = getCompilerContext({
      cssCalc: ['--gap'],
    })

    const forwardedCalcOptions = (createHandlersFromContext.mock.calls[0] as any)?.[3]

    expect(forwardedCalcOptions).toEqual(['--gap', '--spacing'])
    expect(ctx.cssCalc).toEqual(['--gap', '--spacing'])
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

    const forwardedCalcOptions = (createHandlersFromContext.mock.calls[0] as any)?.[3]

    expect(forwardedCalcOptions).toBe(originalOptions)
    expect(ctx.cssCalc).toBe(originalOptions)
    expect(includeCustomProperties).toHaveLength(1)
    expect(includeCustomProperties[0]).toBeInstanceOf(RegExp)
  })
})
