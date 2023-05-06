import { noop } from '@/utils'
import type { UserDefinedOptions } from './types'
import { SimpleMappingChars2String } from '@/dic'

// import { mangleClassRegex } from '@/mangle/expose'

export const defaultOptions: UserDefinedOptions = {
  cssMatcher: (file) => /.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file),
  htmlMatcher: (file) => /.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file),
  jsMatcher: (file) => {
    if (file.includes('node_modules')) {
      return false
    }

    return /.+\.[cm]?[jt]sx?$/.test(file)
  },
  mainCssChunkMatcher: (file, appType) => {
    switch (appType) {
      case 'uni-app': {
        return /^common\/main/.test(file)
      }
      case 'uni-app-vite': {
        // vite 旧版本和新版本对应的样式文件
        return /^app/.test(file) || /^common\/main/.test(file)
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

  customAttributes: {},
  customReplaceDictionary: SimpleMappingChars2String,

  supportCustomLengthUnitsPatch: {
    units: ['rpx'],
    dangerousOptions: {
      gteVersion: '3.0.0',
      lengthUnitsFilePath: 'lib/util/dataTypes.js',
      packageName: 'tailwindcss',
      variableName: 'lengthUnits',
      overwrite: true
    }
  },
  appType: undefined
}
