import type { AppType, UserDefinedOptions } from './types'
import { isAllowedClassName, MappingChars2String } from '@weapp-core/escape'
import { isPackageExists } from 'local-pkg'
import { noop } from './utils'

const CSS_FILE_PATTERN = /.+\.(?:wx|ac|jx|tt|q|c|ty)ss$/
const HTML_FILE_PATTERN = /.+\.(?:(?:wx|ax|jx|ks|tt|q|ty|xhs)ml|swan)$/
const JS_FILE_PATTERN = /.+\.[cm]?js?$/

const MAIN_CSS_CHUNK_MATCHERS: Partial<Record<AppType, (file: string) => boolean>> = {
  'uni-app': file => file.startsWith('common/main') || file.startsWith('app'),
  'uni-app-vite': file => file.startsWith('app') || file.startsWith('common/main'),
  'mpx': file => file.startsWith('app'),
  'taro': file => file.startsWith('app'),
  'remax': file => file.startsWith('app'),
  'rax': file => file.startsWith('bundle'),
  'native': file => file.startsWith('app'),
  'kbone': file => /^(?:common\/)?miniprogram-app/.test(file),
}

const alwaysFalse = () => false

function createMainCssChunkMatcher() {
  return (file: string, appType?: AppType) => {
    if (!appType) {
      return true
    }
    const matcher = MAIN_CSS_CHUNK_MATCHERS[appType]
    return matcher ? matcher(file) : true
  }
}

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
    cssMatcher: file => CSS_FILE_PATTERN.test(file),
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
    htmlMatcher: file => HTML_FILE_PATTERN.test(file),
    jsMatcher: (file) => {
      if (file.includes('node_modules')) {
        return false
      }
      // remove jsx tsx ts case
      return JS_FILE_PATTERN.test(file)
    },
    mainCssChunkMatcher: createMainCssChunkMatcher(),
    wxsMatcher: alwaysFalse,
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
      root: ['page', '.tw-root'],
      universal: ['view', 'text'],
    },
    babelParserOptions: {
      sourceType: 'unambiguous',
      cache: true,
    },
    postcssOptions: {},
    // 开发版本微信小程序工具和小米13手机上 @property 是有效果的
    // 支付宝小程序会直接挂掉
    // https://developer.mozilla.org/en-US/docs/Web/CSS/@property
    cssRemoveProperty: true,
    cssRemoveHoverPseudoClass: true,
    ignoreCallExpressionIdentifiers: isPackageExists('@weapp-tailwindcss/merge') ? ['twMerge', 'twJoin', 'cva', 'tv'] : [],
    ignoreTaggedTemplateExpressionIdentifiers: ['weappTwIgnore'],
    replaceRuntimePackages: false,
    tailwindcssPatcherOptions: {
      filter(className: string) {
        return !isAllowedClassName(className)
      },
    },
    logLevel: 'info',
  }
}
