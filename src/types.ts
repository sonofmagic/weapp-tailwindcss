import type { InjectPreflight } from './postcss/preflight'

export type CssPreflightOptions = {
  'box-sizing': string | false
  'border-width': string | false
  'border-style': string | false
  'border-color': string | false
}

export interface UserDefinedOptions {
  /**
   * wxml/ttml 这类的 ml 的匹配方法
   */
  htmlMatcher?: (name: string) => boolean
  /**
   * wxss/jxss/ttss 这类的 ss 的匹配方法
   */
  cssMatcher?: (name: string) => boolean
  /**
   * 用于处理js
   */
  jsMatcher?: (name: string) => boolean
  /**
   * tailwind jit main chunk 的匹配方法
   * 用于处理原始变量和替换不兼容选择器
   */
  mainCssChunkMatcher?: (name: string, appType?: 'uni-app' | 'taro' | 'remax' | 'rax' | 'native') => boolean
  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/7
   * 用于处理 postcss 的预设
   */
  cssPreflight?: CssPreflightOptions
}

export type InternalPostcssOptions = Pick<UserDefinedOptions, 'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight'>

export interface TaroUserDefinedOptions extends UserDefinedOptions {
  framework: 'react' | 'vue' | 'vue3' | string
}

export interface StyleHandlerOptions {
  isMainChunk: boolean
  cssInjectPreflight: InjectPreflight
}
