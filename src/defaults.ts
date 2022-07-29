import defu from 'defu'
import type { UserDefinedOptions } from './types'

const noop = () => {}

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
  disabled: false,
  customRuleCallback: noop,
  onLoad: noop,
  onStart: noop,
  onEnd: noop,
  onUpdate: noop
  // onBeforeUpdate: noop
}

export function getOptions<T = UserDefinedOptions> (options: T) {
  return defu<T, Required<UserDefinedOptions>>(options, defaultOptions)
}
