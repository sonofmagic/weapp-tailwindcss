import defu from 'defu'
import type { UserDefinedOptions } from './types'
// import { mangleClassRegex } from '@/mangle/expose'
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
  replaceUniversalSelectorWith: 'view',
  disabled: false,
  customRuleCallback: noop,
  onLoad: noop,
  onStart: noop,
  onEnd: noop,
  onUpdate: noop,
  mangle: false,
  framework: 'react'

  // onBeforeUpdate: noop
}

export function getOptions (options: UserDefinedOptions = {}): Required<UserDefinedOptions> {
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
  return defu(options, defaultOptions)
}
