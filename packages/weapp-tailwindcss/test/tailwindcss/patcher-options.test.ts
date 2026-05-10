import { describe, expect, it } from 'vitest'
import {
  normalizeExtendLengthUnits,
  normalizeTailwindcssPatcherOptions,
  resolveTailwindcssOptions,
} from '@/tailwindcss/patcher-options'

describe('tailwindcss patcher option normalization', () => {
  it('returns undefined for absent option objects', () => {
    expect(resolveTailwindcssOptions()).toBeUndefined()
    expect(normalizeTailwindcssPatcherOptions()).toBeUndefined()
  })

  it('normalizes extendLengthUnits feature values', () => {
    expect(normalizeExtendLengthUnits(false)).toBe(false)
    expect(normalizeExtendLengthUnits(true)).toEqual({ enabled: true })
    expect(normalizeExtendLengthUnits({ units: ['rpx'] } as never)).toEqual({
      enabled: true,
      units: ['rpx'],
    })
    expect(normalizeExtendLengthUnits(undefined)).toBeUndefined()
  })

  it('reads modern tailwindcss options from tailwindcss', () => {
    expect(resolveTailwindcssOptions({
      tailwindcss: {
        config: 'tailwind.config.ts',
      },
    })).toEqual({
      config: 'tailwind.config.ts',
    })
  })

  it('reads normalized runtime tailwind options from tailwind', () => {
    expect(resolveTailwindcssOptions({
      tailwind: {
        config: 'tailwind.config.ts',
        v4: {
          configuredBase: '/project',
          cssEntries: ['src/app.css'],
          sources: [],
        },
      },
    } as any)).toEqual({
      config: 'tailwind.config.ts',
      v4: {
        configuredBase: '/project',
        cssEntries: ['src/app.css'],
        sources: [],
      },
    })
  })

  it('returns modern patch options unchanged', () => {
    const options = {
      cache: false,
      projectRoot: '/project',
      tailwindcss: {
        config: 'tailwind.config.cjs',
      },
      apply: {
        overwrite: false,
        exposeContext: true,
        extendLengthUnits: false,
      },
      extract: {
        pretty: 2,
        write: true,
        file: 'tokens.json',
        format: 'lines' as const,
        removeUniversalSelector: false,
      },
    }

    expect(normalizeTailwindcssPatcherOptions(options)).toBe(options)
  })
})
