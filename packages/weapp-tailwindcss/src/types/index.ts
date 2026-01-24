import type { ParseError, ParserOptions } from '@babel/parser'
import type { CssPreflightOptions, IStyleHandlerOptions } from '@weapp-tailwindcss/postcss'
import type { SourceMap } from 'magic-string'
import type { Document, Result as PostcssResult, Root } from 'postcss'
import type { ILengthUnitsPatchOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import type { ICreateCacheReturnType } from '../cache'
import type { ItemOrItemArray } from './base'
import type { DisabledOptions } from './disabled-options'
import type { AppType, IArbitraryValues, ICustomAttributesEntities } from './shared'
import type { UserDefinedOptions } from './user-defined-options'

type AsyncableMethod<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<Awaited<R>> | Awaited<R>
  : never

export type {
  DisabledOptions,
  UserDefinedOptions,
}

// UserDefinedPostcssOptions：用户可配置的 PostCSS 选项
export type { CssPreflightOptions, IStyleHandlerOptions, ItemOrItemArray }
export type { AppType, IArbitraryValues, ICustomAttributes, ICustomAttributesEntities } from './shared'

export interface LinkedJsModuleResult {
  code: string
}

export interface JsHandlerResult {
  code: string
  map?: SourceMap
  error?: ParseError
  /**
   * 因跨文件分析而被转换的额外模块，使用绝对文件路径作为键。
   */
  linked?: Record<string, LinkedJsModuleResult>
}

export interface TailwindcssPatcherLike {
  packageInfo: TailwindcssPatcher['packageInfo']
  majorVersion?: TailwindcssPatcher['majorVersion']
  patch: TailwindcssPatcher['patch']
  getClassSet: AsyncableMethod<TailwindcssPatcher['getClassSet']>
  getClassSetSync?: TailwindcssPatcher['getClassSetSync']
  extract: TailwindcssPatcher['extract']
  collectContentTokens?: TailwindcssPatcher['collectContentTokens']
  options?: TailwindcssPatcher['options']
}

export interface RefreshTailwindcssPatcherOptions {
  clearCache?: boolean
}

export interface IJsHandlerOptions {
  escapeMap?: Record<string, string>
  classNameSet?: Set<string>
  arbitraryValues?: IArbitraryValues
  jsPreserveClass?: (keyword: string) => boolean | undefined
  needEscaped?: boolean
  generateMap?: boolean
  alwaysEscape?: boolean
  unescapeUnicode?: boolean
  babelParserOptions?: ParserOptions
  ignoreTaggedTemplateExpressionIdentifiers?: (string | RegExp)[]
  ignoreCallExpressionIdentifiers?: (string | RegExp)[]
  uniAppX?: boolean
  moduleSpecifierReplacements?: Record<string, string>
  /**
   * 为 `true` 时将输入视作独立表达式，而非完整的程序。
   * 适用于 `:class="{ 'foo bar': cond }"` 等模板绑定场景。
   */
  wrapExpression?: boolean
  /**
   * 当前正在转换的模块绝对路径。
   * 启用跨文件分析时必须提供。
   */
  filename?: string
  /**
   * 配置跨文件模块图分析行为。
   */
  moduleGraph?: JsModuleGraphOptions
}

export interface JsHandler {
  (
    rawSource: string,
    set?: Set<string>,
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
  inlineWxs?: boolean
  jsHandler?: JsHandler
  runtimeSet?: Set<string>
  disabledDefaultTemplateHandler?: boolean
  quote?: string | null
  // 是否转译首字母，默认转译，传入 true 不转
  ignoreHead?: boolean
  wrapExpression?: boolean
}

export type InternalUserDefinedOptions = Required<
  Omit<UserDefinedOptions, 'supportCustomLengthUnitsPatch' | 'customReplaceDictionary' | 'cache'> & {
    supportCustomLengthUnitsPatch: ILengthUnitsPatchOptions | boolean
    templateHandler: (rawSource: string, options?: ITemplateHandlerOptions) => Promise<string>
    styleHandler: (rawSource: string, options?: IStyleHandlerOptions) => Promise<PostcssResult<Root | Document>>
    jsHandler: JsHandler
    escapeMap: Record<string, string>
    customReplaceDictionary: Record<string, string>
    cache: ICreateCacheReturnType
    twPatcher: TailwindcssPatcherLike
    refreshTailwindcssPatcher: (options?: RefreshTailwindcssPatcherOptions) => Promise<TailwindcssPatcherLike>
  }
>

export type InternalPostcssOptions = Pick<
  UserDefinedOptions,
  'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight' | 'cssPreflightRange' | 'disabled'
>

export interface IBaseWebpackPlugin {
  // 构造函数签名示例：new (options: UserDefinedOptions, appType: AppType): any
  // 或 constructor(options: UserDefinedOptions, appType: AppType): void
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

export interface JsModuleGraphOptions {
  /**
   * 将导入的标识符解析为绝对文件路径。
   */
  resolve: (specifier: string, importer: string) => string | undefined
  /**
   * 同步加载模块源码。
   */
  load: (id: string) => string | undefined
  /**
   * 可选过滤器，用于跳过特定模块。
   */
  filter?: (id: string, specifier: string, importer: string) => boolean
  /**
   * 最大遍历深度，默认无限制（`Infinity`）。
   */
  maxDepth?: number
}
