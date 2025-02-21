import type { ParseError, ParserOptions } from '@babel/parser'
import type { IMangleScopeContext } from '@weapp-tailwindcss/mangle'
import type { CssPreflightOptions, IStyleHandlerOptions } from '@weapp-tailwindcss/postcss'
import type { SourceMap } from 'magic-string'
import type { Document, Result as PostcssResult, Root } from 'postcss'
import type { ILengthUnitsPatchOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import type { ICreateCacheReturnType } from '../cache'
import type { UserDefinedOptions } from '../typedoc.export'
import type { ItemOrItemArray } from './base'

export type {
  UserDefinedOptions,
}

// UserDefinedPostcssOptions
export type { CssPreflightOptions, IMangleScopeContext, IStyleHandlerOptions, ItemOrItemArray }

export type AppType = 'uni-app' | 'uni-app-vite' | 'taro' | 'remax' | 'rax' | 'native' | 'kbone' | 'mpx' | 'weapp-vite'

export interface InternalCssSelectorReplacerOptions {
  mangleContext?: IMangleScopeContext
  escapeMap?: Record<string, string>
}

export interface JsHandlerResult { code: string, map?: SourceMap, error?: ParseError }

export type ICustomAttributes =
  | Record<string, ItemOrItemArray<string | RegExp>>
  | Map<string | RegExp, ItemOrItemArray<string | RegExp>>

export type ICustomAttributesEntities = [string | RegExp, ItemOrItemArray<string | RegExp>][]

export interface IJsHandlerOptions {
  escapeMap?: Record<string, string>
  classNameSet?: Set<string>
  arbitraryValues?: IArbitraryValues
  mangleContext?: IMangleScopeContext
  jsPreserveClass?: (keyword: string) => boolean | undefined
  needEscaped?: boolean
  generateMap?: boolean
  alwaysEscape?: boolean
  unescapeUnicode?: boolean
  babelParserOptions?: ParserOptions
  ignoreTaggedTemplateExpressionIdentifiers?: (string | RegExp)[]
  ignoreCallExpressionIdentifiers?: (string | RegExp)[]
}

export interface IArbitraryValues {
  /**
   * 是否允许在类名里，使用双引号。
   * 建议不要开启，因为有些框架，比如 `vue3` 它针对有些静态模板会直接编译成 `html` 字符串，此时开启这个配置很有可能导致转义出错
   *
   * @example
   * ```html
   * <!-- 开启前默认只允许单引号 -->
   * <view class="after:content-['对酒当歌，人生几何']"></view>
   * <!-- 开启后 -->
   * <view class="after:content-[\"对酒当歌，人生几何\"]"></view>
   * ```
   *
   * @default `false`
   */
  allowDoubleQuotes?: boolean
}

export interface JsHandler {
  (
    rawSource: string,
    set: Set<string>,
    options?: CreateJsHandlerOptions
  ): JsHandlerResult
}

export interface ICommonReplaceOptions {
  keepEOL?: boolean
  escapeMap?: Record<string, string>
}

export interface ITemplateHandlerOptions extends ICommonReplaceOptions {
  customAttributesEntities?: ICustomAttributesEntities
  escapeMap?: Record<string, string>
  mangleContext?: IMangleScopeContext
  inlineWxs?: boolean
  jsHandler?: JsHandler
  runtimeSet?: Set<string>
  disabledDefaultTemplateHandler?: boolean
  quote?: string | null
  // 是否转译首字母，默认转译，传入 true 不转
  ignoreHead?: boolean
}

export type InternalUserDefinedOptions = Required<
  Omit<UserDefinedOptions, 'supportCustomLengthUnitsPatch' | 'customReplaceDictionary' | 'cache'> & {
    supportCustomLengthUnitsPatch: ILengthUnitsPatchOptions | boolean
    templateHandler: (rawSource: string, options?: ITemplateHandlerOptions) => Promise<string>
    styleHandler: (rawSource: string, options?: IStyleHandlerOptions) => Promise<PostcssResult<Root | Document>>
    jsHandler: JsHandler
    escapeMap: Record<string, string>
    customReplaceDictionary: Record<string, string>
    setMangleRuntimeSet: (runtimeSet: Set<string>) => void
    cache: ICreateCacheReturnType
    twPatcher: TailwindcssPatcher
  }
>

export type InternalPostcssOptions = Pick<
  UserDefinedOptions,
  'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight' | 'cssPreflightRange' | 'customRuleCallback' | 'disabled'
>

export interface IBaseWebpackPlugin {
  // new (options: UserDefinedOptions, appType: AppType): any
  // constructor(options: UserDefinedOptions, appType: AppType): void
  options: InternalUserDefinedOptions
  appType?: AppType

  apply: (compiler: any) => void
}

/**
 * @description InternalPatchResult
 */
export interface InternalPatchResult {
  dataTypes?: string
  processTailwindFeatures?: string
  plugin?: string
}

export type CreateJsHandlerOptions = Omit<IJsHandlerOptions, 'classNameSet'>
