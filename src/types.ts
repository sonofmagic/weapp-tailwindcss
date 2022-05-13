import type { InjectPreflight } from './postcss/preflight'
import type { Rule } from 'postcss'
export type AppType = 'uni-app' | 'taro' | 'remax' | 'rax' | 'native' | 'kbone' | undefined

export type CssPresetProps = 'box-sizing' | 'border-width' | 'border-style' | 'border-color'

export type CssPreflightOptions =
  | {
      [key: CssPresetProps | string]: string | false
    }
  | false

type RequiredStyleHandlerOptions = {
  isMainChunk: boolean
  cssInjectPreflight: InjectPreflight
}

export type CustomRuleCallback = (node: Rule, options: Readonly<RequiredStyleHandlerOptions>) => void

export type StyleHandlerOptions = {
  customRuleCallback?: CustomRuleCallback
} & RequiredStyleHandlerOptions

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
  mainCssChunkMatcher?: (name: string, appType: AppType) => boolean
  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/7
   * 用于处理 postcss 的预设
   */
  cssPreflight?: CssPreflightOptions

  /**
   * 用于自定义处理 css 的回调函数
   */
  customRuleCallback?: CustomRuleCallback
}

export type InternalPostcssOptions = Pick<UserDefinedOptions, 'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight'>

export interface TaroUserDefinedOptions extends UserDefinedOptions {
  framework: 'react' | 'vue' | 'vue3' | string
}

export interface RawSource {
  start: number
  end: number
  raw: string
  // '' 直接 remove {{}}
  source?: string
}
