import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const logger = {
  warn: vi.fn(),
}

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger,
}))

function createCtx(overrides: Partial<InternalUserDefinedOptions> = {}): InternalUserDefinedOptions {
  return {
    tailwindcssBasedir: process.cwd(),
    supportCustomLengthUnitsPatch: true,
    tailwindcss: undefined,
    tailwindcssPatcherOptions: undefined,
    cssEntries: undefined,
    appType: 'taro',
    customReplaceDictionary: {},
    logLevel: 'silent',
    customAttributes: {},
    cssCalc: undefined,
    ...overrides,
  } as InternalUserDefinedOptions
}

function createPatcher(majorVersion?: number): TailwindcssPatcherLike {
  return {
    majorVersion,
  } as unknown as TailwindcssPatcherLike
}

async function loadModule() {
  return import('@/tailwindcss/v4/config')
}

describe('tailwindcss/v4/config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('warns once when tailwindcss@4 has no cssEntries', async () => {
    const ctx = createCtx()
    const patcher = createPatcher(4)

    const { warnMissingCssEntries } = await loadModule()
    warnMissingCssEntries(ctx, patcher)
    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0]).toContain('cssEntries')
  })

  it('skips warning for non-v4 patchers', async () => {
    const ctx = createCtx()
    const patcher = createPatcher(3)
    const { warnMissingCssEntries } = await loadModule()

    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('skips warning when cssEntries are provided via options', async () => {
    const ctx = createCtx({
      tailwindcssPatcherOptions: {
        patch: {
          tailwindcss: {
            v4: {
              cssEntries: ['/abs/app.css'],
            },
          },
        },
      },
    })
    const patcher = createPatcher(4)

    const { warnMissingCssEntries } = await loadModule()
    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('skips warning when tailwindcss v4 cssEntries are present on context', async () => {
    const ctx = createCtx({
      tailwindcss: {
        v4: {
          cssEntries: ['/ctx/app.css'],
        },
      },
    })
    const patcher = createPatcher(4)
    const { warnMissingCssEntries } = await loadModule()

    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('warns when legacy patch options omit cssEntries', async () => {
    const ctx = createCtx({
      tailwindcssPatcherOptions: {
        patch: {
          tailwindcss: {},
        },
      },
    })
    const patcher = createPatcher(4)
    const { warnMissingCssEntries } = await loadModule()

    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).toHaveBeenCalledTimes(1)
  })

  it('skips warning when cssEntries are set on the context root', async () => {
    const ctx = createCtx({
      cssEntries: ['/ctx/root.css'],
    })
    const patcher = createPatcher(4)
    const { warnMissingCssEntries } = await loadModule()

    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('skips warning when cssEntries are provided via modern tailwind patcher options', async () => {
    const ctx = createCtx({
      tailwindcssPatcherOptions: {
        tailwind: {
          v4: {
            cssEntries: ['/modern/path.css'],
          },
        },
      },
    })
    const patcher = createPatcher(4)
    const { warnMissingCssEntries } = await loadModule()

    warnMissingCssEntries(ctx, patcher)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('applies cssCalc defaults when tailwindcss@4 is detected', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults } = await loadModule()

    const result = applyV4CssCalcDefaults(undefined, patcher)

    expect(result).toEqual({ includeCustomProperties: [] })
  })

  it('merges missing custom properties when defaults are provided', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()

    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.push('--spacing')
    try {
      const result = applyV4CssCalcDefaults({
        includeCustomProperties: ['--gap'],
      }, patcher) as { includeCustomProperties: string[] }

      expect(result.includeCustomProperties).toEqual(['--gap', '--spacing'])
    }
    finally {
      DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0
    }
  })

  it('fills includeCustomProperties when provided value is an object without array', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()
    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.push(/^--foo$/)

    try {
      const result = applyV4CssCalcDefaults({
        precision: 4,
      } as any, patcher) as { includeCustomProperties: RegExp[] }

      expect(result.includeCustomProperties).toEqual([/^--foo$/])
    }
    finally {
      DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0
    }
  })

  it('keeps object cssCalc untouched when defaults are empty', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()
    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0

    const cssCalc = { includeCustomProperties: ['--keep'] }
    expect(applyV4CssCalcDefaults(cssCalc as any, patcher)).toBe(cssCalc)
  })

  it('respects regex and string matching when merging defaults', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()
    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.push('match-me', /^--bar$/)

    try {
      const result = applyV4CssCalcDefaults({
        includeCustomProperties: [/match-me/, '--bar'],
      }, patcher) as { includeCustomProperties: (string | RegExp)[] }

      expect(result.includeCustomProperties).toEqual([/match-me/, '--bar'])
    }
    finally {
      DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0
    }
  })

  it('returns original cssCalc when patcher is not v4', async () => {
    const patcher = createPatcher(3)
    const { applyV4CssCalcDefaults } = await loadModule()

    expect(applyV4CssCalcDefaults(false, patcher)).toBe(false)
  })

  it('returns user provided cssCalc string when tailwindcss@4', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults } = await loadModule()

    expect(applyV4CssCalcDefaults('inline-calc' as any, patcher)).toBe('inline-calc')
  })

  it('keeps array cssCalc unchanged when no defaults exist', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults } = await loadModule()

    const cssCalc = ['--gap']
    expect(applyV4CssCalcDefaults(cssCalc as any, patcher)).toBe(cssCalc)
  })

  it('merges defaults for array cssCalc entries', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()
    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.push('token-array')

    try {
      const cssCalc = [/token-array/]
      expect(applyV4CssCalcDefaults(cssCalc as any, patcher)).toEqual(cssCalc)
    }
    finally {
      DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0
    }
  })

  it('appends missing defaults for array cssCalc entries', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()
    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.push('append-me')

    try {
      const result = applyV4CssCalcDefaults([] as any, patcher) as string[]
      expect(result).toEqual(['append-me'])
    }
    finally {
      DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0
    }
  })

  it('normalizes cssEntries config from different shapes', async () => {
    const { normalizeCssEntriesConfig } = await loadModule()

    expect(normalizeCssEntriesConfig('  app.css  ')).toEqual(['app.css'])
    expect(normalizeCssEntriesConfig(['', 'main.css', ' '])).toEqual(['main.css'])
    expect(normalizeCssEntriesConfig(42)).toBeUndefined()
    expect(normalizeCssEntriesConfig('   ')).toBeUndefined()
    expect(normalizeCssEntriesConfig([' a.css ', 123 as any])).toEqual(['a.css'])
    expect(normalizeCssEntriesConfig([])).toBeUndefined()
  })

  it('avoids duplicating regex defaults when already provided', async () => {
    const patcher = createPatcher(4)
    const { applyV4CssCalcDefaults, DEFAULT_CSS_CALC_CUSTOM_PROPERTIES } = await loadModule()
    DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.push(/token-regex/i)

    try {
      const cssCalc = [/token-regex/i]
      expect(applyV4CssCalcDefaults(cssCalc as any, patcher)).toBe(cssCalc)
    }
    finally {
      DEFAULT_CSS_CALC_CUSTOM_PROPERTIES.length = 0
    }
  })
})
