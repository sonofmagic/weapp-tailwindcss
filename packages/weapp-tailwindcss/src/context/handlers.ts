import type { ICustomAttributesEntities, InternalUserDefinedOptions } from '@/types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS } from '@/constants'
import { createJsHandler } from '@/js'
import { isUniAppXEnabled, resolveUniAppXOptions } from '@/uni-app-x/options'
import { createTemplateHandler } from '@/wxml'

function resolveRuntimePackageReplacements(
  option: InternalUserDefinedOptions['replaceRuntimePackages'],
) {
  if (!option) {
    return undefined
  }

  const mapping = option === true
    ? DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS
    : option

  const normalized: Record<string, string> = {}
  for (const [from, to] of Object.entries(mapping)) {
    if (!from || typeof to !== 'string' || to.length === 0) {
      continue
    }
    normalized[from] = to
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export function createHandlersFromContext(
  ctx: InternalUserDefinedOptions,
  customAttributesEntities: ICustomAttributesEntities,
  cssCalcOptions: InternalUserDefinedOptions['cssCalc'],
  tailwindcssMajorVersion?: number,
) {
  const {
    cssPreflight,
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
    unitsToPx,
    arbitraryValues,
    jsPreserveClass,
    staleClassNameFallback,
    jsArbitraryValueFallback,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    inlineWxs,
    disabledDefaultTemplateHandler,
    replaceRuntimePackages,
  } = ctx
  const uniAppXEnabled = isUniAppXEnabled(uniAppX)
  const resolvedUniAppXOptions = resolveUniAppXOptions(uniAppX)

  const moduleSpecifierReplacements = resolveRuntimePackageReplacements(replaceRuntimePackages)

  const styleHandler = createStyleHandler({
    cssPreflight,
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
    uniAppX: uniAppXEnabled,
    uniAppXUnsupported: resolvedUniAppXOptions.uvueUnsupported,
    cssCalc: cssCalcOptions,
    px2rpx,
    unitsToPx,
  })

  const jsHandler = createJsHandler({
    escapeMap,
    arbitraryValues,
    jsPreserveClass,
    staleClassNameFallback,
    jsArbitraryValueFallback: jsArbitraryValueFallback ?? 'auto',
    tailwindcssMajorVersion,
    generateMap: true,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    uniAppX: uniAppXEnabled,
    moduleSpecifierReplacements,
  })

  const templateHandler = createTemplateHandler({
    customAttributesEntities,
    escapeMap,
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
