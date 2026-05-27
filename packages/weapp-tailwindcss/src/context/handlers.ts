import type { ICustomAttributesEntities, InternalUserDefinedOptions } from '@/types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS } from '@/constants'
import { createJsHandler } from '@/js'
import { resolveUniAppXOptions } from '@/uni-app-x/options'
import { createTemplateHandler } from '@/wxml'
import { resolveStyleOptionsFromContext } from './style-options'

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
    escapeMap,
    injectAdditionalCssVarScope,
    postcssOptions,
    uniAppX,
    arbitraryValues,
    jsPreserveClass,
    jsArbitraryValueFallback,
    babelParserOptions,
    ignoreCallExpressionIdentifiers,
    ignoreTaggedTemplateExpressionIdentifiers,
    inlineWxs,
    disabledDefaultTemplateHandler,
    replaceRuntimePackages,
  } = ctx
  const resolvedUniAppXOptions = resolveUniAppXOptions(uniAppX)
  const styleOptions = resolveStyleOptionsFromContext(ctx)
  const uniAppXEnabled = styleOptions.uniAppX === true

  const moduleSpecifierReplacements = resolveRuntimePackageReplacements(replaceRuntimePackages)

  const styleHandler = createStyleHandler({
    ...styleOptions,
    escapeMap,
    injectAdditionalCssVarScope,
    postcssOptions,
    uniAppXUnsupported: resolvedUniAppXOptions.uvueUnsupported,
    cssCalc: cssCalcOptions,
    majorVersion: tailwindcssMajorVersion,
  })

  const jsHandler = createJsHandler({
    escapeMap,
    arbitraryValues,
    jsPreserveClass,
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
