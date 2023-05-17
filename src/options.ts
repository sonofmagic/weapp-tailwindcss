import { defu, isMap } from '@/utils'
import type { InternalUserDefinedOptions, UserDefinedOptions, GlobOrFunctionMatchers, ICustomAttributes, ICustomAttributesEntities, ItemOrItemArray } from './types'
import { isMatch } from 'micromatch'
import { createTempleteHandler } from '@/wxml/utils'
import { createStyleHandler } from '@/postcss/index'
import { createInjectPreflight } from '@/postcss/preflight'
import { SimpleMappingChars2String, MappingChars2String } from '@/dic'
import { createPatch } from '@/tailwindcss/patcher'
import { createjsHandler } from './js'
import { defaultOptions } from './defaults'
import { isProd } from '@/env'

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

type IModules = readonly ('js' | 'style' | 'templete' | 'patch')[]

export function getOptions(options: UserDefinedOptions = {}, modules: IModules = ['style', 'templete', 'patch', 'js']): InternalUserDefinedOptions {
  const registerModules = modules.reduce<Record<IModules[number], boolean>>(
    (acc, cur) => {
      if (acc[cur] !== undefined) {
        acc[cur] = true
      }
      return acc
    },
    {
      templete: false,
      style: false,
      patch: false,
      js: false
    }
  )

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
  normalizeMatcher(options, 'mainCssChunkMatcher')

  const result = defu<InternalUserDefinedOptions, Partial<InternalUserDefinedOptions>[]>(options, defaultOptions as InternalUserDefinedOptions, {
    minifiedJs: isProd()
  })

  const { cssPreflight, customRuleCallback, cssPreflightRange, replaceUniversalSelectorWith, customAttributes, customReplaceDictionary, supportCustomLengthUnitsPatch } = result

  result.escapeMap = customReplaceDictionary
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
  let customAttributesEntities: ICustomAttributesEntities
  if (isMap(options.customAttributes)) {
    customAttributesEntities = Array.from((options.customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries())
  } else {
    customAttributesEntities = Object.entries(customAttributes)
  }

  // const custom = customAttributesEntities.length > 0

  if (registerModules.templete) {
    result.templeteHandler = createTempleteHandler({
      customAttributesEntities,
      escapeMap: result.escapeMap
    })
  }
  if (registerModules.style) {
    result.styleHandler = createStyleHandler({
      cssInjectPreflight,
      customRuleCallback,
      cssPreflightRange,
      replaceUniversalSelectorWith,
      escapeMap: result.escapeMap
    })
  }

  if (registerModules.js) {
    result.jsHandler = createjsHandler({
      minifiedJs: result.minifiedJs,
      escapeMap: result.escapeMap
    })
  }
  if (registerModules.patch) {
    result.patch = createPatch(supportCustomLengthUnitsPatch)
  }

  return result
}
