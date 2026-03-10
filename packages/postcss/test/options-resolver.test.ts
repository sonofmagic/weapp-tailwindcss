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
    })
    const second = resolver.resolve({
      rem2rpx: true,
      px2rpx: false,
      unitsToPx: false,
      cssCalc: false,
      cssChildCombinatorReplaceValue: 'view',
      injectAdditionalCssVarScope: true,
      cssPreflight: false,
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
})
