import { beforeEach, describe, expect, it, vi } from 'vitest'

const styleHandlerFactory = vi.fn(() => vi.fn())
const jsHandlerFactory = vi.fn(() => vi.fn())
const templateHandlerFactory = vi.fn(() => vi.fn())

vi.mock('@weapp-tailwindcss/postcss', () => ({
  createStyleHandler: styleHandlerFactory,
}))

vi.mock('@/js', () => ({
  createJsHandler: jsHandlerFactory,
}))

vi.mock('@/wxml', () => ({
  createTemplateHandler: templateHandlerFactory,
}))

type InternalUserDefinedOptions = import('@/types').InternalUserDefinedOptions
type Px2rpxOption = InternalUserDefinedOptions['px2rpx']
type UnitsToPxOption = InternalUserDefinedOptions['unitsToPx']
type UnitConversionOption = InternalUserDefinedOptions['unitConversion']

const customAttributesEntities: import('@/types').ICustomAttributesEntities = [
  ['view', ['class']],
]

function createContext(
  px2rpx?: Px2rpxOption,
  unitsToPx?: UnitsToPxOption,
  unitConversion?: UnitConversionOption,
): InternalUserDefinedOptions {
  return {
    cssPreflight: {},
    cssPreflightRange: 'all' as const,
    escapeMap: { '&': '_amp' },
    cssChildCombinatorReplaceValue: 'view + view',
    injectAdditionalCssVarScope: true,
    cssSelectorReplacement: { root: '.app', universal: false },
    rem2rpx: false,
    postcssOptions: {},
    cssOptions: {
      tailwindcssV4GradientFallback: false,
    },
    cssRemoveProperty: true,
    cssRemoveHoverPseudoClass: false,
    cssPresetEnv: { stage: 0 },
    autoprefixer: false,
    uniAppX: true,
    px2rpx,
    unitsToPx,
    unitConversion,
    arbitraryValues: { allowDoubleQuotes: true },
    jsPreserveClass: vi.fn(),
    babelParserOptions: { sourceType: 'module' },
    ignoreCallExpressionIdentifiers: [/^tw/],
    ignoreTaggedTemplateExpressionIdentifiers: ['twMerge'],
    inlineWxs: true,
    disabledDefaultTemplateHandler: true,
  } as unknown as InternalUserDefinedOptions
}

describe('createHandlersFromContext', () => {
  beforeEach(() => {
    styleHandlerFactory.mockClear()
    jsHandlerFactory.mockClear()
    templateHandlerFactory.mockClear()
  })

  it('builds style, js and template handlers with the expected context', async () => {
    const { createHandlersFromContext } = await import('@/context/handlers')

    const styleHandler = vi.fn()
    const jsHandler = vi.fn()
    const templateHandler = vi.fn()

    styleHandlerFactory.mockReturnValueOnce(styleHandler)
    jsHandlerFactory.mockReturnValueOnce(jsHandler)
    templateHandlerFactory.mockReturnValueOnce(templateHandler)

    const ctx = createContext({ selectorBlackList: ['van-'] })

    const result = createHandlersFromContext(
      ctx,
      customAttributesEntities,
      true,
    )

    expect(styleHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      cssCalc: true,
      platform: ctx.platform,
      px2rpx: ctx.px2rpx,
      unitsToPx: ctx.unitsToPx,
      cssPresetEnv: ctx.cssPresetEnv,
      autoprefixer: false,
      uniAppXUnsupported: 'warn',
    }))

    expect(jsHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      escapeMap: ctx.escapeMap,
      arbitraryValues: ctx.arbitraryValues,
    }))

    expect(templateHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      customAttributesEntities,
      jsHandler,
      inlineWxs: ctx.inlineWxs,
    }))

    expect(result).toEqual({
      styleHandler,
      jsHandler,
      templateHandler,
    })
  })

  it.each([
    ['enabled', true],
    ['disabled', false],
    ['omitted', undefined],
  ] as const)('forwards px2rpx when %s', async (_label, px2rpx) => {
    const { createHandlersFromContext } = await import('@/context/handlers')

    const styleHandler = vi.fn()
    styleHandlerFactory.mockReturnValueOnce(styleHandler)
    jsHandlerFactory.mockReturnValueOnce(vi.fn())
    templateHandlerFactory.mockReturnValueOnce(vi.fn())

    createHandlersFromContext(
      createContext(px2rpx),
      customAttributesEntities,
      true,
    )

    expect(styleHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      px2rpx,
    }))
  })

  it.each([
    ['enabled', true],
    ['disabled', false],
    ['omitted', undefined],
  ] as const)('forwards unitsToPx when %s', async (_label, unitsToPx) => {
    const { createHandlersFromContext } = await import('@/context/handlers')

    const styleHandler = vi.fn()
    styleHandlerFactory.mockReturnValueOnce(styleHandler)
    jsHandlerFactory.mockReturnValueOnce(vi.fn())
    templateHandlerFactory.mockReturnValueOnce(vi.fn())

    createHandlersFromContext(
      createContext(undefined, unitsToPx),
      customAttributesEntities,
      true,
    )

    expect(styleHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      unitsToPx,
    }))
  })

  it('forwards unitConversion to the style handler', async () => {
    const { createHandlersFromContext } = await import('@/context/handlers')
    const unitConversion: UnitConversionOption = {
      platforms: {
        weapp: {
          rules: [
            { from: 'px', to: 'rpx', factor: 2 },
          ],
        },
      },
    }

    styleHandlerFactory.mockReturnValueOnce(vi.fn())
    jsHandlerFactory.mockReturnValueOnce(vi.fn())
    templateHandlerFactory.mockReturnValueOnce(vi.fn())

    createHandlersFromContext(
      createContext(undefined, undefined, unitConversion),
      customAttributesEntities,
      true,
    )

    expect(styleHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      unitConversion,
    }))
  })

  it('forwards Tailwind major version to the style handler', async () => {
    const { createHandlersFromContext } = await import('@/context/handlers')

    styleHandlerFactory.mockReturnValueOnce(vi.fn())
    jsHandlerFactory.mockReturnValueOnce(vi.fn())
    templateHandlerFactory.mockReturnValueOnce(vi.fn())

    createHandlersFromContext(
      createContext(),
      customAttributesEntities,
      true,
      4,
    )

    expect(styleHandlerFactory).toHaveBeenCalledWith(expect.objectContaining({
      majorVersion: 4,
    }))
  })
})

describe('resolveStyleOptionsFromContext', () => {
  it('extracts shared style options without handler-only fields', async () => {
    const { resolveStyleOptionsFromContext } = await import('@/context/style-options')
    const ctx = createContext(true, false, {
      rules: [
        { from: 'px', to: 'rpx', factor: 2 },
      ],
    })

    const styleOptions = resolveStyleOptionsFromContext(ctx)

    expect(styleOptions).toEqual(expect.objectContaining({
      cssPreflight: ctx.cssPreflight,
      cssPreflightRange: ctx.cssPreflightRange,
      cssChildCombinatorReplaceValue: ctx.cssChildCombinatorReplaceValue,
      cssSelectorReplacement: ctx.cssSelectorReplacement,
      rem2rpx: ctx.rem2rpx,
      px2rpx: ctx.px2rpx,
      unitsToPx: ctx.unitsToPx,
      unitConversion: ctx.unitConversion,
      cssOptions: ctx.cssOptions,
      cssRemoveProperty: ctx.cssRemoveProperty,
      cssRemoveHoverPseudoClass: ctx.cssRemoveHoverPseudoClass,
      cssPresetEnv: ctx.cssPresetEnv,
      autoprefixer: ctx.autoprefixer,
      cssCalc: ctx.cssCalc,
      uniAppX: true,
      platform: ctx.platform,
    }))
    expect(styleOptions).not.toHaveProperty('escapeMap')
    expect(styleOptions).not.toHaveProperty('postcssOptions')
    expect(styleOptions).not.toHaveProperty('injectAdditionalCssVarScope')
    expect(styleOptions).not.toHaveProperty('majorVersion')
  })

  it('prefers cssOptions over top-level Tailwind CSS v4 gradient fallback', async () => {
    const { resolveStyleOptionsFromContext } = await import('@/context/style-options')
    const ctx = {
      ...createContext(),
      cssOptions: {
        tailwindcssV4GradientFallback: false,
      },
      tailwindcssV4GradientFallback: true,
    } as unknown as InternalUserDefinedOptions

    expect(resolveStyleOptionsFromContext(ctx).tailwindcssV4GradientFallback).toBe(false)
  })

  it('keeps top-level Tailwind CSS v4 gradient fallback compatibility', async () => {
    const { resolveStyleOptionsFromContext } = await import('@/context/style-options')
    const ctx = {
      ...createContext(),
      cssOptions: undefined,
      tailwindcssV4GradientFallback: true,
    } as unknown as InternalUserDefinedOptions

    expect(resolveStyleOptionsFromContext(ctx).tailwindcssV4GradientFallback).toBe(true)
  })
})

describe('resolveRuntimePackageReplacements', () => {
  it('uses default runtime package replacements when enabled', async () => {
    const { DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS } = await import('@/constants')
    const { resolveRuntimePackageReplacements } = await import('@/context/runtime-package-replacements')

    expect(resolveRuntimePackageReplacements(true)).toEqual(DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS)
  })

  it('normalizes custom runtime package replacements', async () => {
    const { resolveRuntimePackageReplacements } = await import('@/context/runtime-package-replacements')

    expect(resolveRuntimePackageReplacements({
      'tailwind-merge': '@scope/tw-merge',
      'class-variance-authority': '',
      '': '@scope/ignored',
    })).toEqual({
      'tailwind-merge': '@scope/tw-merge',
    })
  })

  it('returns undefined when runtime package replacements are empty', async () => {
    const { resolveRuntimePackageReplacements } = await import('@/context/runtime-package-replacements')

    expect(resolveRuntimePackageReplacements(false)).toBeUndefined()
    expect(resolveRuntimePackageReplacements(undefined)).toBeUndefined()
    expect(resolveRuntimePackageReplacements({})).toBeUndefined()
  })
})
