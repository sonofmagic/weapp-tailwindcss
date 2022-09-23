import type { InjectPreflight } from './postcss/preflight'
import type { Rule } from 'postcss'
import type ClassGenerator from '@/mangle/classGenerator'
export type AppType = 'uni-app' | 'taro' | 'remax' | 'rax' | 'native' | 'kbone' | 'mpx' | undefined

export interface IPropValue {
  prop: string
  value: string
}
// 'box-sizing' | 'border-width' | 'border-style' | 'border-color' |
export type CssPresetProps = string

export type CssPreflightOptions =
  | {
      [key: CssPresetProps]: string | number | boolean
    }
  | false

type RequiredStyleHandlerOptions = {
  isMainChunk: boolean
  cssInjectPreflight: InjectPreflight
  cssPreflightRange: 'view' | 'all'
  replaceUniversalSelectorWith: string | false
}

export type CustomRuleCallback = (node: Rule, options: Readonly<RequiredStyleHandlerOptions>) => void

export type StyleHandlerOptions = {
  customRuleCallback?: CustomRuleCallback
  classGenerator?: ClassGenerator
} & RequiredStyleHandlerOptions

export interface RawSource {
  start: number
  end: number
  raw: string
  // '' 直接 remove {{}}
  source?: string
  prevConcatenated: boolean
  nextConcatenated: boolean
}

export interface IMangleContextClass {
  name: string
  usedBy: any[]
}

export interface IMangleOptions {
  // classNameRegExp?: string
  reserveClassName?: (string | RegExp)[]
  // ignorePrefix?: string[]
  // ignorePrefixRegExp?: string
  classGenerator?: (original: string, opts: IMangleOptions, context: Record<string, any>) => string | undefined
  log?: boolean
  exclude?: (string | RegExp)[]
  include?: (string | RegExp)[]
  ignoreClass?: (string | RegExp)[]
}

export interface IManglePluginOptions extends IMangleOptions {
  classNameRegExp?: string
  reserveClassName?: (string | RegExp)[]
  ignorePrefix?: string[]
  ignorePrefixRegExp?: string
  classGenerator?: (original: string, opts: IMangleOptions, context: Record<string, any>) => string | undefined
  log?: boolean
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
  mainCssChunkMatcher?: (name: string, appType: AppType) => boolean
  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/7
   * 用于处理 postcss 的预设
   */
  cssPreflight?: CssPreflightOptions

  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/pull/62
   * 用于处理 postcss 的预设 global 选择器的返回
   */
  cssPreflightRange?: 'view' | 'all'

  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/81
   * @default 'view'
   * @description 将css中的 '*' 选择器 (Universal) 替换为指定的字符串, false 表示不转化
   */
  replaceUniversalSelectorWith?: string | false

  /**
   * @description 是否禁用此插件，一般用于构建到多平台时使用
   */
  disabled?: boolean

  /**
   * 用于自定义处理 css 的回调函数
   */
  customRuleCallback?: CustomRuleCallback

  /**
   * @description plugin apply 初调用
   */
  onLoad?: () => void
  /**
   * @description 开始处理时调用
   */
  onStart?: () => void
  /**
   * @description 匹配成功并修改文件内容前调用
   */
  // onBeforeUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * @description 匹配成功并修改文件内容后调用
   */
  onUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * @description 结束处理时调用
   */
  onEnd?: () => void
  /**
   * @description 是否混淆class,用于缩短replace后产生的class的长度
   */
  mangle?: IMangleOptions | boolean

  /**
   * @description Taro 特有，用来声明使用的框架
   */
  framework?: 'react' | 'vue' | 'vue3' | string
}

export type InternalPostcssOptions = Pick<
  UserDefinedOptions,
  'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight' | 'replaceUniversalSelectorWith' | 'cssPreflightRange' | 'customRuleCallback' | 'disabled'
> & { classGenerator?: ClassGenerator }

// export interface TaroUserDefinedOptions extends UserDefinedOptions {
//   framework: 'react' | 'vue' | 'vue3' | string
// }

export interface ICommonReplaceOptions {
  keepEOL?: boolean
  classGenerator?: ClassGenerator
}
