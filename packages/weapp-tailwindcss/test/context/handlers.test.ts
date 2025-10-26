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

    const ctx = {
      cssPreflight: {},
      customRuleCallback: vi.fn(),
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
      px2rpx: { selectorBlackList: ['van-'] },
      arbitraryValues: { allowDoubleQuotes: true },
      jsPreserveClass: vi.fn(),
      babelParserOptions: { sourceType: 'module' },
      ignoreCallExpressionIdentifiers: [/^tw/],
      ignoreTaggedTemplateExpressionIdentifiers: ['twMerge'],
      inlineWxs: true,
      disabledDefaultTemplateHandler: true,
    } as unknown as import('@/types').InternalUserDefinedOptions

    const customAttributesEntities: import('@/types').ICustomAttributesEntities = [
      ['view', ['class']],
    ]

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
})
