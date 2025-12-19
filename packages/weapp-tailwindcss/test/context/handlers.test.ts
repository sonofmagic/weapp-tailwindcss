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

const customAttributesEntities: import('@/types').ICustomAttributesEntities = [
  ['view', ['class']],
]

function createContext(px2rpx?: Px2rpxOption): InternalUserDefinedOptions {
  return {
    cssPreflight: {},
    cssPreflightRange: 'all' as const,
    escapeMap: { '&': '_amp' },
    cssChildCombinatorReplaceValue: 'view + view',
    injectAdditionalCssVarScope: true,
    cssSelectorReplacement: { root: '.app', universal: false },
    rem2rpx: false,
    postcssOptions: {},
    cssRemoveProperty: true,
    cssRemoveHoverPseudoClass: false,
    cssPresetEnv: { stage: 0 },
    uniAppX: true,
    px2rpx,
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
      px2rpx: ctx.px2rpx,
      cssPresetEnv: ctx.cssPresetEnv,
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
})
