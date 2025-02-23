import type { UserDefinedOptions } from './types'
import { isAllowedClassName, MappingChars2String } from '@weapp-core/escape'
import { isPackageExists } from 'local-pkg'
import { noop } from './utils'

export function getDefaultOptions(): UserDefinedOptions {
  return {
    /**
     * wxss 微信小程序
     * acss 支付宝小程序
     * jxss 京东小程序
     * ttss 头条小程序
     * qss QQ小程序
     * css 最正常的样式文件
     * tyss 涂鸦小程序
     */
    cssMatcher: file => /.+\.(?:wx|ac|jx|tt|q|c|ty)ss$/.test(file),
    /**
     * wxml 微信小程序
     * axml 支付宝小程序
     * jxml 京东小程序
     * ksml 快手小程序
     * ttml 头条小程序
     * qml QQ小程序
     * tyml 涂鸦小程序
     * xhsml 小红书小程序
     * swan 百度小程序
     */
    htmlMatcher: file => /.+\.(?:(?:wx|ax|jx|ks|tt|q|ty|xhs)ml|swan)$/.test(file),
    jsMatcher: (file) => {
      if (file.includes('node_modules')) {
        return false
      }
      // remove jsx tsx ts case
      return /.+\.[cm]?js?$/.test(file)
    },
    mainCssChunkMatcher: (file, appType) => {
      switch (appType) {
        case 'uni-app': {
          return file.startsWith('common/main')
        }
        case 'uni-app-vite': {
          // vite 旧版本和新版本对应的样式文件
          return file.startsWith('app') || file.startsWith('common/main')
        }
        case 'mpx': {
          return file.startsWith('app')
        }
        case 'taro': {
          // app.wxss & app-origin.wxss
          return file.startsWith('app')
        }
        case 'remax': {
          return file.startsWith('app')
        }
        case 'rax': {
          return file.startsWith('bundle')
        }
        case 'native': {
          return file.startsWith('app')
        }
        case 'kbone': {
          return /^(?:common\/)?miniprogram-app/.test(file)
        }
        default: {
          return true
        }
      }
    },
    wxsMatcher: () => {
      return false
    },
    // https://tailwindcss.com/docs/preflight#border-styles-are-reset-globally
    cssPreflight: {
      'box-sizing': 'border-box',
      'border-width': '0',
      'border-style': 'solid',
      'border-color': 'currentColor',
    },

    disabled: false,
    customRuleCallback: noop,
    onLoad: noop,
    onStart: noop,
    onEnd: noop,
    onUpdate: noop,

    customAttributes: {},
    customReplaceDictionary: MappingChars2String,
    appType: undefined,
    arbitraryValues: {
      allowDoubleQuotes: false,
    },
    cssChildCombinatorReplaceValue: ['view', 'text'],
    inlineWxs: false,
    injectAdditionalCssVarScope: false,
    jsPreserveClass: (keyword) => {
      /**
       * 默认保留 keyword
       */
      if (keyword === '*') {
        return true
      }
      return false
    },
    disabledDefaultTemplateHandler: false,
    cssSelectorReplacement: {
      root: 'page',
      universal: ['view', 'text'],
    },
    babelParserOptions: {
      sourceType: 'unambiguous',
    },
    postcssOptions: {},
    cssRemoveHoverPseudoClass: true,
    ignoreCallExpressionIdentifiers: isPackageExists('@weapp-tailwindcss/merge') ? ['twMerge', 'twJoin', 'cva'] : [],
    ignoreTaggedTemplateExpressionIdentifiers: ['weappTwIgnore'],
    patch: {
      filter(className) {
        return !isAllowedClassName(className)
      },
    },
  }
}
