import { defu, isMap } from '@/utils'
import type { InternalUserDefinedOptions, UserDefinedOptions, GlobOrFunctionMatchers, ICustomAttributes, ICustomAttributesEntities, ItemOrItemArray } from './types'
import { isMatch } from 'micromatch'
import { createTempleteHandler } from '@/wxml/utils'
import { createStyleHandler } from '@/postcss'
import { createJsxHandler } from '@/jsx'
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

type IModules = readonly ('jsx' | 'js' | 'style' | 'templete' | 'patch')[]

export function getOptions(options: UserDefinedOptions = {}, modules: IModules = ['jsx', 'style', 'templete', 'patch', 'js']): InternalUserDefinedOptions {
  const registerModules = modules.reduce<Record<IModules[number], boolean>>(
    (acc, cur) => {
      if (acc[cur] !== undefined) {
        acc[cur] = true
      }
      return acc
    },
    {
      templete: false,
      jsx: false,
      style: false,
      patch: false,
      js: false
    }
  )
  if (options.mangle === true) {
    // https://uniapp.dcloud.net.cn/tutorial/miniprogram-subject.html#%E5%B0%8F%E7%A8%8B%E5%BA%8F%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E6%94%AF%E6%8C%81
    options.mangle = {
      exclude: [/node[-_]modules/, /(wx|my|swan|tt|ks|jd)components/]
    }
  } else if (typeof options.mangle === 'object') {
    if (!Array.isArray(options.mangle)) {
      options.mangle.exclude = [/node[-_]modules/, /(wx|my|swan|tt|ks|jd)components/]
    }
  }

  if (options.supportCustomLengthUnitsPatch === true) {
    options.supportCustomLengthUnitsPatch = undefined
  }

  if (options.framework && options.framework === 'vue') {
    options.framework = 'vue2'
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
  const { cssPreflight, customRuleCallback, cssPreflightRange, replaceUniversalSelectorWith, customAttributes, customReplaceDictionary, framework, supportCustomLengthUnitsPatch } =
    result
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
  let customAttributesEntities: ICustomAttributesEntities
  if (isMap(options.customAttributes)) {
    customAttributesEntities = Array.from((options.customAttributes as Exclude<ICustomAttributes, Record<string, ItemOrItemArray<string | RegExp>>>).entries())
  } else {
    customAttributesEntities = Object.entries(customAttributes)
  }

  // const custom = customAttributesEntities.length > 0
  const escapeEntries = Object.entries(customReplaceDictionary)
  result.escapeEntries = escapeEntries
  if (registerModules.templete) {
    result.templeteHandler = createTempleteHandler({
      customAttributesEntities,
      escapeEntries
    })
  }
  if (registerModules.style) {
    result.styleHandler = createStyleHandler({
      cssInjectPreflight,
      customRuleCallback,
      cssPreflightRange,
      replaceUniversalSelectorWith,
      escapeEntries
    })
  }
  if (registerModules.jsx) {
    result.jsxHandler = createJsxHandler({
      escapeEntries,
      framework,
      customAttributesEntities
    })
  }
  if (registerModules.js) {
    result.jsHandler = createjsHandler({
      escapeEntries,
      minifiedJs: result.minifiedJs
    })
  }
  if (registerModules.patch) {
    result.patch = createPatch(supportCustomLengthUnitsPatch)
  }

  return result
}
