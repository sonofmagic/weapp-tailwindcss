import { defu, noop } from '@/shared'
import type { InternalUserDefinedOptions, UserDefinedOptions, GlobOrFunctionMatchers } from './types'
import { isMatch } from 'micromatch'
import { createTempleteHandler } from '@/wxml/utils'
import { createStyleHandler } from '@/postcss'
import { createJsxHandler } from '@/jsx'
import { createInjectPreflight } from '@/postcss/preflight'
// import { mangleClassRegex } from '@/mangle/expose'

export const defaultOptions: Required<UserDefinedOptions> = {
  cssMatcher: (file) => /.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file),
  htmlMatcher: (file) => /.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file),
  jsMatcher: (file) => {
    if (file.includes('node_modules')) {
      return false
    }
    return /.+\.[jt]sx?$/.test(file)
  },
  mainCssChunkMatcher: (file, appType) => {
    switch (appType) {
      case 'uni-app': {
        return /^common\/main/.test(file)
      }
      case 'mpx': {
        return /^app/.test(file)
      }
      case 'taro': {
        return /^app/.test(file)
      }
      case 'remax': {
        return /^app/.test(file)
      }
      case 'rax': {
        return /^bundle/.test(file)
      }
      case 'native': {
        return /^app/.test(file)
      }
      case 'kbone': {
        return /^(?:common\/)?miniprogram-app/.test(file)
      }
      default: {
        return true
      }
    }
  },
  cssPreflight: {
    'box-sizing': 'border-box',
    'border-width': '0',
    'border-style': 'solid',
    'border-color': 'currentColor'
  },
  cssPreflightRange: 'view',
  replaceUniversalSelectorWith: 'view',
  disabled: false,
  customRuleCallback: noop,
  onLoad: noop,
  onStart: noop,
  onEnd: noop,
  onUpdate: noop,
  mangle: false,
  framework: 'react',
  loaderOptions: {
    jsxRename: false
  },
  customAttributes: {}
  // templeteHandler,
  // styleHandler,
  // jsxHandler
} as const

function createGlobMatcher (pattern: string | string[]) {
  return function (file: string) {
    return isMatch(file, pattern)
  }
}

function normalizeMatcher (options: UserDefinedOptions, key: GlobOrFunctionMatchers) {
  if (typeof options[key] === 'string' || Array.isArray(options[key])) {
    options[key] = createGlobMatcher(options[key] as string | string[])
  }
}

export function getOptions (options: UserDefinedOptions = {}): InternalUserDefinedOptions {
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

  if (options.framework && options.framework === 'vue') {
    options.framework = 'vue2'
  }
  normalizeMatcher(options, 'cssMatcher')
  normalizeMatcher(options, 'htmlMatcher')
  normalizeMatcher(options, 'jsMatcher')
  normalizeMatcher(options, 'mainCssChunkMatcher')

  const result = defu<InternalUserDefinedOptions, InternalUserDefinedOptions[]>(options, defaultOptions as InternalUserDefinedOptions)
  const { cssPreflight, customRuleCallback, cssPreflightRange, replaceUniversalSelectorWith } = result
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
  result.templeteHandler = createTempleteHandler()
  result.styleHandler = createStyleHandler({
    cssInjectPreflight,
    customRuleCallback,
    cssPreflightRange,
    replaceUniversalSelectorWith
  })
  result.jsxHandler = createJsxHandler()
  return result
}
