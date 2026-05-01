import type { IStyleHandlerOptions } from '@/types'
import { describe, expect, it } from 'vitest'
import { createOptionsResolver } from '@/options-resolver'

function createBaseOptions(): IStyleHandlerOptions {
  return {
    isMainChunk: false,
    cssInjectPreflight: () => [],
    cssSelectorReplacement: {
      universal: 'view',
    },
    cssPreflightRange: 'all',
  }
}

describe('options resolver', () => {
  it('returns base options for missing and empty overrides', () => {
    const baseOptions = createBaseOptions()
    const resolver = createOptionsResolver(baseOptions)
    const emptyOverride = {}

    expect(resolver.resolve()).toBe(baseOptions)
    expect(resolver.resolve(emptyOverride)).toBe(baseOptions)
    expect(resolver.resolve(emptyOverride)).toBe(baseOptions)
  })

  it('reuses cached merged options for fresh simple override literals', () => {
    const resolver = createOptionsResolver(createBaseOptions())

    const first = resolver.resolve({
      isMainChunk: true,
      majorVersion: 4,
    })
    const second = resolver.resolve({
      isMainChunk: true,
      majorVersion: 4,
    })

    expect(first).toBe(second)
    expect(first).toMatchObject({
      isMainChunk: true,
      majorVersion: 4,
    })
  })

  it('reuses cached merged options for simple postcss boolean and string overrides', () => {
    const resolver = createOptionsResolver(createBaseOptions())

    const first = resolver.resolve({
      rem2rpx: true,
      px2rpx: false,
      unitsToPx: false,
      cssCalc: false,
      cssChildCombinatorReplaceValue: 'view',
      injectAdditionalCssVarScope: true,
      cssPreflight: false,
      autoprefixer: false,
    })
    const second = resolver.resolve({
      rem2rpx: true,
      px2rpx: false,
      unitsToPx: false,
      cssCalc: false,
      cssChildCombinatorReplaceValue: 'view',
      injectAdditionalCssVarScope: true,
      cssPreflight: false,
      autoprefixer: false,
    })

    expect(first).toBe(second)
    expect(second).toMatchObject({
      rem2rpx: true,
      px2rpx: false,
      unitsToPx: false,
      cssCalc: false,
      cssChildCombinatorReplaceValue: 'view',
      injectAdditionalCssVarScope: true,
      cssPreflight: false,
      autoprefixer: false,
    })
  })

  it('keeps nested override references reactive to in-place mutations', () => {
    const resolver = createOptionsResolver(createBaseOptions())
    const override = {
      postcssOptions: {
        options: {
          map: false,
        },
      },
    } satisfies Partial<IStyleHandlerOptions>

    const first = resolver.resolve(override)
    override.postcssOptions.options.extra = 'value'
    const second = resolver.resolve(override)

    expect(first).toBe(second)
    expect(second.postcssOptions?.options).toMatchObject({
      map: false,
      extra: 'value',
    })
  })

  it('falls back to fingerprint cache when simple override keys use complex values', () => {
    const resolver = createOptionsResolver(createBaseOptions())
    const complexOverrides: Array<Partial<IStyleHandlerOptions>> = [
      { isMainChunk: 'true' as any },
      { majorVersion: '4' as any },
      { cssRemoveProperty: 'true' as any },
      { cssRemoveHoverPseudoClass: 'true' as any },
      { uniAppX: 'true' as any },
      { cssPreflightRange: true as any },
      { injectAdditionalCssVarScope: 'true' as any },
      { rem2rpx: { rootValue: 16 } as any },
      { px2rpx: { unitPrecision: 5 } as any },
      { unitsToPx: { to: 'px' } as any },
      { cssCalc: { includeCustomProperties: ['--tw-space'] } },
      { cssChildCombinatorReplaceValue: ['view'] },
      { cssPreflight: { boxSizing: 'border-box' } },
      { autoprefixer: { add: true } as any },
      { postcssOptions: { plugins: [] } },
    ]

    for (const override of complexOverrides) {
      const first = resolver.resolve(override)
      const second = resolver.resolve({ ...override })
      expect(second).toBe(first)
    }
  })
})
