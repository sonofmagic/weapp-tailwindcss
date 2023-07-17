import { isMatch } from 'micromatch'
import type { InternalUserDefinedOptions, UserDefinedOptions, GlobOrFunctionMatchers, ICustomAttributes, ICustomAttributesEntities, ItemOrItemArray } from './types'
import { createjsHandler } from './js'
import { defaultOptions } from './defaults'
import { defu, isMap } from '@/utils'
import { createTempleteHandler } from '@/wxml/utils'
import { createStyleHandler } from '@/postcss/index'
import { createInjectPreflight } from '@/postcss/preflight'
import { SimpleMappingChars2String, MappingChars2String } from '@/dic'
import { createPatch } from '@/tailwindcss/patcher'
import { isProd } from '@/env'
import { useMangleStore } from '@/mangle'

// import { mangleClassRegex } from '@/mangle/expose'

function createGlobMatcher(pattern: string | string[]) {
  return function (file: string) {
    return isMatch(file, pattern)
  }
}

function normalizeMatcher(options: UserDefinedOptions, key: GlobOrFunctionMatchers) {
  if (typeof options[key] === 'string' || Array.isArray(options[key])) {
    options[key] = createGlobMatcher(options[key] as string | string[])
  }
}

export function getOptions(options: UserDefinedOptions = {}): InternalUserDefinedOptions {
  if (options.supportCustomLengthUnitsPatch === true) {
    options.supportCustomLengthUnitsPatch = undefined
  }

  if (options.customReplaceDictionary === 'simple') {
    options.customReplaceDictionary = SimpleMappingChars2String
  } else if (options.customReplaceDictionary === 'complex') {
    options.customReplaceDictionary = MappingChars2String
  }

  normalizeMatcher(options, 'cssMatcher')
  normalizeMatcher(options, 'htmlMatcher')
  normalizeMatcher(options, 'jsMatcher')
  normalizeMatcher(options, 'wxsMatcher')
  normalizeMatcher(options, 'mainCssChunkMatcher')

  const result = defu<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(options, defaultOptions as InternalUserDefinedOptions, {
    minifiedJs: isProd()
  })

  const {
    cssPreflight,
    customRuleCallback,
    cssPreflightRange,
    replaceUniversalSelectorWith,
    customAttributes,
    customReplaceDictionary,
    supportCustomLengthUnitsPatch,
    arbitraryValues,
    cssChildCombinatorReplaceValue,
    inlineWxs,
    injectAdditionalCssVarScope,
    jsPreserveClass
  } = result

  result.escapeMap = customReplaceDictionary
  const cssInjectPreflight = createInjectPreflight(cssPreflight)

  const customAttributesEntities: ICustomAttributesEntities = isMap(options.customAttributes)
    ? [...(options.customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries()]
    : Object.entries(customAttributes)

  // const custom = customAttributesEntities.length > 0
  const { escapeMap, minifiedJs } = result
  const { initMangle, mangleContext, setMangleRuntimeSet } = useMangleStore()
  initMangle(options.mangle)
  const styleHandler = createStyleHandler({
    cssInjectPreflight,
    customRuleCallback,
    cssPreflightRange,
    replaceUniversalSelectorWith,
    escapeMap,
    mangleContext,
    cssChildCombinatorReplaceValue,
    injectAdditionalCssVarScope
  })
  result.styleHandler = styleHandler
  const jsHandler = createjsHandler({
    minifiedJs,
    escapeMap,
    mangleContext,
    arbitraryValues,
    jsPreserveClass
  })
  result.jsHandler = jsHandler

  const templeteHandler = createTempleteHandler({
    customAttributesEntities,
    escapeMap,
    mangleContext,
    inlineWxs,
    jsHandler
  })
  result.templeteHandler = templeteHandler

  result.patch = createPatch(supportCustomLengthUnitsPatch)
  // result.initMangle = initMangle
  result.setMangleRuntimeSet = setMangleRuntimeSet
  return result
}
