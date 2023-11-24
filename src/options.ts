import type { InternalUserDefinedOptions, UserDefinedOptions, ICustomAttributes, ICustomAttributesEntities, ItemOrItemArray } from './types'
import { createJsHandler } from './js'
import { defaultOptions } from './defaults'
import { defuOverrideArray, isMap } from '@/utils'
import { createTemplateHandler } from '@/wxml/utils'
import { createStyleHandler } from '@/postcss/index'
import { createInjectPreflight } from '@/postcss/preflight'
import { SimpleMappingChars2String } from '@/escape'
import { createPatch } from '@/tailwindcss/patcher'
import { useMangleStore } from '@/mangle'
import { createCache } from '@/cache'

export function getOptions(options: UserDefinedOptions = {}): InternalUserDefinedOptions {
  if (options.customReplaceDictionary === undefined || options.customReplaceDictionary === 'simple') {
    options.customReplaceDictionary = SimpleMappingChars2String
  }

  const result = defuOverrideArray<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(
    options as InternalUserDefinedOptions,
    defaultOptions as InternalUserDefinedOptions,
    {}
  )

  const {
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    customAttributes,
    customReplaceDictionary,
    supportCustomLengthUnitsPatch,
    arbitraryValues,
    cssChildCombinatorReplaceValue,
    inlineWxs,
    injectAdditionalCssVarScope,
    jsPreserveClass,
    disabledDefaultTemplateHandler,
    cssSelectorReplacement
  } = result

  result.escapeMap = customReplaceDictionary
  const cssInjectPreflight = createInjectPreflight(cssPreflight)

  const customAttributesEntities: ICustomAttributesEntities = isMap(options.customAttributes)
    ? [...(options.customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries()]
    : Object.entries(customAttributes)

  // const custom = customAttributesEntities.length > 0
  const { escapeMap } = result
  const { initMangle, mangleContext, setMangleRuntimeSet } = useMangleStore()
  initMangle(options.mangle)
  const styleHandler = createStyleHandler({
    cssInjectPreflight,
    customRuleCallback,
    cssPreflightRange,
    escapeMap,
    mangleContext,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope,
    cssSelectorReplacement
  })
  result.styleHandler = styleHandler
  const jsHandler = createJsHandler({
    escapeMap,
    mangleContext,
    arbitraryValues,
    jsPreserveClass,
    generateMap: true
  })
  result.jsHandler = jsHandler

  const templateHandler = createTemplateHandler({
    customAttributesEntities,
    escapeMap,
    mangleContext,
    inlineWxs,
    jsHandler,
    disabledDefaultTemplateHandler
  })
  result.templateHandler = templateHandler

  result.patch = createPatch(supportCustomLengthUnitsPatch)
  // result.initMangle = initMangle
  result.setMangleRuntimeSet = setMangleRuntimeSet

  result.cache = createCache()

  return result
}
