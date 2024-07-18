import type {
  ICustomAttributes,
  ICustomAttributesEntities,
  InternalUserDefinedOptions,
  ItemOrItemArray,
  UserDefinedOptions,
} from './types'
import { createJsHandler } from './js'
import { defaultOptions } from './defaults'
import { defuOverrideArray, isMap } from '@/utils'
import { createTemplateHandler } from '@/wxml/utils'
import { createStyleHandler } from '@/postcss/index'
import { createInjectPreflight } from '@/postcss/preflight'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { useMangleStore } from '@/mangle'
import { createCache } from '@/cache'

export function getOptions(opts?: UserDefinedOptions): InternalUserDefinedOptions {
  const result = defuOverrideArray<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(
    opts as InternalUserDefinedOptions,
    defaultOptions as InternalUserDefinedOptions,
    {},
  )

  result.escapeMap = result.customReplaceDictionary

  const {
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    customAttributes,
    supportCustomLengthUnitsPatch,
    arbitraryValues,
    cssChildCombinatorReplaceValue,
    inlineWxs,
    injectAdditionalCssVarScope,
    jsPreserveClass,
    disabledDefaultTemplateHandler,
    cssSelectorReplacement,
    rem2rpx,
    cache,
    jsAstTool,
    babelParserOptions,
    postcssOptions,
    cssRemoveHoverPseudoClass,
    escapeMap,
    mangle,
    tailwindcssBasedir,
    appType,
  } = result

  const cssInjectPreflight = createInjectPreflight(cssPreflight)

  const customAttributesEntities: ICustomAttributesEntities = isMap(customAttributes)
    ? [...(customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries()]
    : Object.entries(customAttributes)

  const { initMangle, mangleContext, setMangleRuntimeSet } = useMangleStore()
  initMangle(mangle)

  const styleHandler = createStyleHandler({
    cssInjectPreflight,
    customRuleCallback,
    cssPreflightRange,
    escapeMap,
    mangleContext,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope,
    cssSelectorReplacement,
    rem2rpx,
    postcssOptions,
    cssRemoveHoverPseudoClass,
  })

  const jsHandler = createJsHandler({
    escapeMap,
    mangleContext,
    arbitraryValues,
    jsPreserveClass,
    generateMap: true,
    jsAstTool,
    babelParserOptions,
  })

  const templateHandler = createTemplateHandler({
    customAttributesEntities,
    escapeMap,
    mangleContext,
    inlineWxs,
    jsHandler,
    disabledDefaultTemplateHandler,
  })

  result.styleHandler = styleHandler
  result.jsHandler = jsHandler
  result.templateHandler = templateHandler

  const twPatcher = createTailwindcssPatcher(tailwindcssBasedir, appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined, supportCustomLengthUnitsPatch)
  result.patch = twPatcher.patch
  result.setMangleRuntimeSet = setMangleRuntimeSet
  result.cache = cache === undefined || typeof cache === 'boolean' ? createCache(cache) : cache
  result.twPatcher = twPatcher
  return result
}
