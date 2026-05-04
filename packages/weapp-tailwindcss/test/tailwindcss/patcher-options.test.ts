import type { NormalizedTailwindCssPatchOptions } from 'tailwindcss-patch'
import { describe, expect, it } from 'vitest'
import {
  normalizeExtendLengthUnits,
  normalizeTailwindcssPatcherOptions,
  resolveTailwindcssOptions,
  toModernTailwindcssPatchOptions,
} from '@/tailwindcss/patcher-options'

describe('tailwindcss patcher option normalization', () => {
  it('returns undefined for absent option objects', () => {
    expect(resolveTailwindcssOptions()).toBeUndefined()
    expect(normalizeTailwindcssPatcherOptions()).toBeUndefined()
    expect(toModernTailwindcssPatchOptions()).toBeUndefined()
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

  it('reads modern tailwindcss options from tailwindcss or legacy tailwind field', () => {
    expect(resolveTailwindcssOptions({
      tailwindcss: {
        config: 'tailwind.config.ts',
      },
    } as never)).toEqual({
      config: 'tailwind.config.ts',
    })

    expect(resolveTailwindcssOptions({
      tailwind: {
        config: 'tailwind.legacy.js',
      },
    } as never)).toEqual({
      config: 'tailwind.legacy.js',
    })
  })

  it('preserves normalized tailwind options from patcher runtime options', () => {
    const tailwind = {
      packageName: 'tailwindcss',
      versionHint: 4,
      cwd: '/project',
      v4: {
        base: '/project',
        configuredBase: '/project/src',
        cssEntries: ['app.css'],
        sources: [],
        hasUserDefinedSources: true,
      },
    } as unknown as NormalizedTailwindCssPatchOptions['tailwind']

    expect(resolveTailwindcssOptions({
      tailwind,
    })).toBe(tailwind)
  })

  it('converts legacy patch options into modern patch options', () => {
    const filter = (className: string) => className.startsWith('tw-')

    expect(normalizeTailwindcssPatcherOptions({
      cache: {
        enabled: true,
        strategy: 'overwrite',
      },
      patch: {
        overwrite: true,
        basedir: '/project',
        filter,
        resolve: {
          paths: ['/project/node_modules'],
        },
        tailwindcss: {
          version: 2,
          config: 'tailwind.config.js',
          resolve: {
            paths: ['/fallback/node_modules'],
          },
        },
        applyPatches: {
          exportContext: true,
          extendLengthUnits: {
            units: ['rpx'],
          } as never,
        },
        output: {
          filename: 'tw.json',
          loose: true,
          removeUniversalSelector: true,
        } as never,
      },
    })).toEqual({
      cache: {
        enabled: true,
        strategy: 'overwrite',
      },
      filter,
      projectRoot: '/project',
      tailwindcss: {
        version: 2,
        config: 'tailwind.config.js',
        packageName: '@tailwindcss/postcss7-compat',
        postcssPlugin: '@tailwindcss/postcss7-compat',
        resolve: {
          paths: ['/project/node_modules'],
        },
      },
      apply: {
        overwrite: true,
        exposeContext: true,
        extendLengthUnits: {
          enabled: true,
          units: ['rpx'],
        },
      },
      extract: {
        file: 'tw.json',
        pretty: 2,
        removeUniversalSelector: true,
      },
    })
  })

  it('preserves explicit modern options and fills legacy aliases only when missing', () => {
    expect(toModernTailwindcssPatchOptions({
      cache: false,
      cwd: '/cwd',
      overwrite: true,
      features: {
        exposeContext: true,
        extendLengthUnits: false,
      },
      output: {
        enabled: true,
        file: 'tokens.json',
        format: 'lines',
        pretty: false,
        removeUniversalSelector: false,
      },
      apply: {
        overwrite: false,
      },
      extract: {
        pretty: 2,
      },
      tailwind: {
        config: 'tailwind.config.cjs',
      },
    } as never)).toEqual({
      cache: false,
      projectRoot: '/cwd',
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
        format: 'lines',
        removeUniversalSelector: false,
      },
    })
  })
})
