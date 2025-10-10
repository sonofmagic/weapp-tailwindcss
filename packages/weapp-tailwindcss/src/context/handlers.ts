import type { IMangleScopeContext } from '@weapp-tailwindcss/mangle'
import type { ICustomAttributesEntities, InternalUserDefinedOptions } from '@/types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { createJsHandler } from '@/js'
import { createTemplateHandler } from '@/wxml'

export function createHandlersFromContext(
  ctx: InternalUserDefinedOptions,
  mangleContext: IMangleScopeContext,
  customAttributesEntities: ICustomAttributesEntities,
  cssCalcOptions: InternalUserDefinedOptions['cssCalc'],
) {
  const {
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    escapeMap,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope,
    cssSelectorReplacement,
    rem2rpx,
    postcssOptions,
    cssRemoveProperty,
    cssRemoveHoverPseudoClass,
    cssPresetEnv,
    uniAppX,
    px2rpx,
    arbitraryValues,
    jsPreserveClass,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    inlineWxs,
    disabledDefaultTemplateHandler,
  } = ctx

  const styleHandler = createStyleHandler({
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    escapeMap,
    mangleContext,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope,
    cssSelectorReplacement,
    rem2rpx,
    postcssOptions,
    cssRemoveProperty,
    cssRemoveHoverPseudoClass,
    cssPresetEnv,
    uniAppX,
    cssCalc: cssCalcOptions,
    px2rpx,
  })

  const jsHandler = createJsHandler({
    escapeMap,
    mangleContext,
    arbitraryValues,
    jsPreserveClass,
    generateMap: true,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    uniAppX,
  })

  const templateHandler = createTemplateHandler({
    customAttributesEntities,
    escapeMap,
    mangleContext,
    inlineWxs,
    jsHandler,
    disabledDefaultTemplateHandler,
  })

  return {
    styleHandler,
    jsHandler,
    templateHandler,
  }
}
