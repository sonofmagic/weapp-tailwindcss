import type { InjectPreflight } from './postcss/preflight'
import type { Rule } from 'postcss'
import type ClassGenerator from '@/mangle/classGenerator'

import type { GeneratorResult } from '@babel/generator'

// export interface TaroUserDefinedOptions extends UserDefinedOptions {
//   framework: 'react' | 'vue' | 'vue3' | string
// }
export type ItemOrItemArray<T> = T | T[]
export type { TraverseOptions } from '@babel/traverse'
export type { Node } from '@babel/types'
export type AppType = 'uni-app' | 'taro' | 'remax' | 'rax' | 'native' | 'kbone' | 'mpx'

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
  cssInjectPreflight?: InjectPreflight
  cssPreflightRange?: 'view' | 'all'
  replaceUniversalSelectorWith?: string | false
  escapeEntries?: [string, string][]
}

export type CustomRuleCallback = (node: Rule, options: Readonly<RequiredStyleHandlerOptions>) => void

export type IStyleHandlerOptions = {
  customRuleCallback?: CustomRuleCallback
  classGenerator?: ClassGenerator
} & RequiredStyleHandlerOptions

export type ICustomAttributes = Record<string, ItemOrItemArray<string | RegExp>> | Map<string | RegExp, ItemOrItemArray<string | RegExp>>

export type ICustomAttributesEntities = [string | RegExp, ItemOrItemArray<string | RegExp>][]

export type IJsxHandlerOptions = {
  escapeEntries?: [string, string][]
  framework?: string
  customAttributesEntities?: ICustomAttributesEntities
  allMatchedAttributes?: (string | RegExp)[] // ICustomAttributesEntities[1][1]
}

export type IJsHandlerOptions = {
  escapeEntries?: [string, string][]
  classNameSet: Set<string>
}
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

export interface JsxRenameLoaderOptions {
  // framework?: string
  // isVue?: boolean
  write?:
    | false
    | {
        dir?: string
        filename?: string
      }
  // escapeEntries?: [string, string][]
  jsxHandler: (rawSource: string, options?: IJsxHandlerOptions) => GeneratorResult
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

export interface ILengthUnitsPatchDangerousOptions {
  packageName?: string
  gteVersion?: string
  lengthUnitsFilePath?: string
  variableName?: string
  overwrite?: boolean
  destPath?: string
}

export interface ILengthUnitsPatchOptions {
  units: string[]
  paths?: string[]
  dangerousOptions?: ILengthUnitsPatchDangerousOptions
}

export interface UserDefinedOptions {
  /**
   * wxml/ttml 这类的 ml 的匹配方法
   */
  htmlMatcher?: ((name: string) => boolean) | string | string[]
  /**
   * wxss/jxss/ttss 这类的 ss 的匹配方法
   */
  cssMatcher?: ((name: string) => boolean) | string | string[]
  /**
   * 用于处理js
   */
  jsMatcher?: ((name: string) => boolean) | string | string[]
  /**
   * @deprecated v2 版本中不再需要，会自动判断 CssMainChunk
   * tailwind jit main chunk 的匹配方法
   * 用于处理原始变量和替换不兼容选择器
   */
  mainCssChunkMatcher?: ((name: string, appType?: AppType) => boolean) | string | string[]
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

  loaderOptions?: {
    jsxRename?: JsxRenameLoaderOptions['write']
  }
  /**
   * @description 自定义attr转化属性，默认转化所有的 class
   */
  customAttributes?: ICustomAttributes
  /**
   * @description 自定义转化class名称字典
   */
  customReplaceDictionary?: 'simple' | 'complex' | Record<string, string>
  /**
   * @description 自定义 jsxRenameLoader 的路径
   */
  jsxRenameLoaderPath?: string

  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110
   * @description tailwindcss 3.2 对长度单位添加了校验，不打patch，rpx 这个单位会被识别成颜色
   */
  supportCustomLengthUnitsPatch?: ILengthUnitsPatchOptions | boolean
}

export interface ICommonReplaceOptions {
  keepEOL?: boolean
  classGenerator?: ClassGenerator
  escapeEntries?: [string, string][]
  // customAttributes?: Record<string, string | string[]>
}

export type ICustomRegexp = {
  tagRegexp: RegExp
  attrRegexp: RegExp
  tag: string
  attrs: ItemOrItemArray<string | RegExp>
}
export interface ITempleteHandlerOptions extends ICommonReplaceOptions {
  customAttributesEntities?: ICustomAttributesEntities
  // allMatchedAttributes?: (string | RegExp)[]
  // custom?: boolean
  // regexps?: ICustomRegexp[]
  escapeEntries?: [string, string][]
}

export type GlobOrFunctionMatchers = 'htmlMatcher' | 'cssMatcher' | 'jsMatcher' | 'mainCssChunkMatcher'

export type InternalUserDefinedOptions = Required<
  Omit<UserDefinedOptions, GlobOrFunctionMatchers | 'supportCustomLengthUnitsPatch' | 'customReplaceDictionary'> & {
    [K in GlobOrFunctionMatchers]: K extends 'mainCssChunkMatcher' ? (name: string, appType: AppType) => boolean : (name: string) => boolean
  } & {
    supportCustomLengthUnitsPatch: ILengthUnitsPatchOptions | false
    templeteHandler: (rawSource: string, options?: ITempleteHandlerOptions) => string
    styleHandler: (rawSource: string, options: IStyleHandlerOptions) => string
    jsxHandler: (rawSource: string, options?: IJsxHandlerOptions) => GeneratorResult
    jsHandler: (rawSource: string, set: Set<string>) => GeneratorResult
    escapeEntries: [string, string][]
    patch: () => void
    customReplaceDictionary: Record<string, string>
  }
>

export type InternalPostcssOptions = Pick<
  UserDefinedOptions,
  'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight' | 'replaceUniversalSelectorWith' | 'cssPreflightRange' | 'customRuleCallback' | 'disabled'
> & { classGenerator?: ClassGenerator }

export interface IBaseWebpackPlugin {
  // new (options: UserDefinedOptions, appType: AppType): any
  // constructor(options: UserDefinedOptions, appType: AppType): void
  options: InternalUserDefinedOptions
  appType: AppType
  classGenerator?: ClassGenerator

  apply: (compiler: any) => void
}
