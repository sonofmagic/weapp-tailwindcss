import type { CssPreflightOptions, UserDefinedOptions } from './types'
import { isAllowedClassName, MappingChars2String } from '@weapp-core/escape'
import { DEFAULT_PARSE_CACHE_MAX_ENTRIES, DEFAULT_PARSE_CACHE_MAX_SOURCE_LENGTH } from './js/babel/cache-options'
import { noop } from './utils'

const CSS_FILE_PATTERN = /.+\.(?:wx|ac|jx|tt|q|c|ty)ss$/
const HTML_FILE_PATTERN = /.+\.(?:(?:wx|ax|jx|ks|tt|q|ty|xhs)ml|swan)$/
const JS_FILE_PATTERN = /.+\.[cm]?js?$/

const alwaysFalse = () => false

export const TAILWIND_V3_CSS_PREFLIGHT = {
  'box-sizing': 'border-box',
  'border-width': '0',
  'border-style': 'solid',
  'border-color': 'currentColor',
} satisfies Exclude<CssPreflightOptions, false>

export const TAILWIND_V4_CSS_PREFLIGHT = {
  'box-sizing': 'border-box',
  'margin': '0',
  'padding': '0',
  'border': '0 solid',
} satisfies Exclude<CssPreflightOptions, false>

export function getDefaultCssPreflight(tailwindcssMajorVersion?: number): Exclude<CssPreflightOptions, false> {
  return {
    ...(tailwindcssMajorVersion === 4
      ? TAILWIND_V4_CSS_PREFLIGHT
      : TAILWIND_V3_CSS_PREFLIGHT),
  }
}

export function resolveDefaultCssPreflight(
  cssPreflight: CssPreflightOptions | undefined,
  tailwindcssMajorVersion?: number,
): CssPreflightOptions {
  if (cssPreflight === false) {
    return false
  }
  return {
    ...getDefaultCssPreflight(tailwindcssMajorVersion),
    ...(cssPreflight ?? {}),
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
      // 排除 jsx、tsx、ts 等情况
      return JS_FILE_PATTERN.test(file)
    },
    mainCssChunkMatcher: alwaysFalse,
    wxsMatcher: alwaysFalse,
    // 参考：https://tailwindcss.com/docs/preflight#border-styles-are-reset-globally
    cssPreflight: getDefaultCssPreflight(3),

    disabled: false,
    onLoad: noop,
    onStart: noop,
    onEnd: noop,
    onUpdate: noop,

    customAttributes: {},
    customReplaceDictionary: MappingChars2String,
    appType: undefined,
    arbitraryValues: {
      allowDoubleQuotes: false,
      bareArbitraryValues: false,
    },
    unocss: false,
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
      root: ['page', '.tw-root', 'wx-root-portal-content'],
      universal: ['view', 'text'],
    },
    babelParserOptions: {
      sourceType: 'unambiguous',
      cache: true,
      cacheKey: 'st:unambiguous',
      cacheMaxEntries: DEFAULT_PARSE_CACHE_MAX_ENTRIES,
      cacheMaxSourceLength: DEFAULT_PARSE_CACHE_MAX_SOURCE_LENGTH,
    },
    postcssOptions: {},
    // 开发版本微信小程序工具和小米13手机上 @property 是有效果的
    // 支付宝小程序会直接挂掉
    // https://developer.mozilla.org/en-US/docs/Web/CSS/@property
    cssRemoveProperty: true,
    cssRemoveHoverPseudoClass: true,
    ignoreCallExpressionIdentifiers: [],
    ignoreTaggedTemplateExpressionIdentifiers: ['weappTwIgnore'],
    replaceRuntimePackages: false,
    generator: {},
    cssSourceTrace: false,
    tailwindcssRuntimeOptions: {
      filter(className: string) {
        return !isAllowedClassName(className)
      },
    },
    logLevel: 'info',
  }
}
