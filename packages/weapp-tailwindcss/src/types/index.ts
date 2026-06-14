import type { ParseError, ParserOptions } from '@babel/parser'
import type { CssPreflightOptions, Document, IStyleHandlerOptions, Result as PostcssResult, Root } from '@weapp-tailwindcss/postcss'
import type { SourceMap } from 'magic-string'
import type { ILengthUnitsPatchOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import type { ICreateCacheReturnType } from '../cache'
import type { ItemOrItemArray } from './base'
import type { AppType, IArbitraryValues, ICustomAttributesEntities } from './shared'
import type {
  UniAppXComponentLocalStylesOptions,
  UniAppXOptions as UniAppXUserDefinedOptions,
  UserDefinedOptions,
} from './user-defined-options'

type AsyncableMethod<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<Awaited<R>> | Awaited<R>
  : never

export type {
  UniAppXComponentLocalStylesOptions,
  UniAppXUserDefinedOptions,
  UserDefinedOptions,
}

// UserDefinedPostcssOptions：用户可配置的 PostCSS 选项
export type { CssPreflightOptions, IStyleHandlerOptions, ItemOrItemArray }
export type { AppType, IArbitraryValues, ICustomAttributes, ICustomAttributesEntities, IUnocssCompatibilityOptions } from './shared'

export type RequiredDefined<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined>
}

type InternalUserDefinedOptionsBase = RequiredDefined<
  Omit<
    UserDefinedOptions,
    | 'supportCustomLengthUnitsPatch'
    | 'customReplaceDictionary'
    | 'cache'
    | 'twPatcher'
    | 'refreshTailwindcssPatcher'
    | 'templateHandler'
    | 'styleHandler'
    | 'jsHandler'
  >
>

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
  majorVersion?: TailwindcssPatcher['majorVersion'] | undefined
  patch?: TailwindcssPatcher['patch'] | undefined
  getClassSet: AsyncableMethod<TailwindcssPatcher['getClassSet']>
  getClassSetSync?: TailwindcssPatcher['getClassSetSync'] | undefined
  extract: TailwindcssPatcher['extract']
  collectContentTokens?: TailwindcssPatcher['collectContentTokens'] | undefined
  options?: TailwindcssPatcher['options'] | undefined
}

export type BabelParserOptions = ParserOptions & {
  cache?: boolean | undefined
  cacheKey?: string | undefined
  cacheMaxEntries?: number | undefined
  cacheMaxSourceLength?: number | undefined
}

export interface RefreshTailwindcssPatcherOptions {
  clearCache?: boolean | undefined
}

export interface IJsHandlerOptions {
  escapeMap?: Record<string, string> | undefined
  classNameSet?: Set<string> | undefined
  /**
   * 控制在 classNameSet 异常时的任意值兜底策略。
   *
   * - `false`：关闭兜底。
   * - `true`：在 class 语义上下文中允许任意值兜底。
   * - `'auto'`：仅在 TailwindCSS v4 且 classNameSet 为空时启用。
   */
  jsArbitraryValueFallback?: boolean | 'auto' | undefined
  /**
   * 当前 TailwindCSS 主版本号，用于自动兜底判定。
   */
  tailwindcssMajorVersion?: number | undefined
  arbitraryValues?: IArbitraryValues | undefined
  jsPreserveClass?: ((keyword: string) => boolean | undefined) | undefined
  needEscaped?: boolean | undefined
  generateMap?: boolean | undefined
  alwaysEscape?: boolean | undefined
  unescapeUnicode?: boolean | undefined
  babelParserOptions?: BabelParserOptions | undefined
  ignoreTaggedTemplateExpressionIdentifiers?: (string | RegExp)[] | undefined
  ignoreCallExpressionIdentifiers?: (string | RegExp)[] | undefined
  uniAppX?: boolean | undefined
  moduleSpecifierReplacements?: Record<string, string> | undefined
  /**
   * 为 `true` 时将输入视作独立表达式，而非完整的程序。
   * 适用于 `:class="{ 'foo bar': cond }"` 等模板绑定场景。
   */
  wrapExpression?: boolean | undefined
  /**
   * 当前正在转换的模块绝对路径。
   * 启用跨文件分析时必须提供。
   */
  filename?: string | undefined
  /**
   * 配置跨文件模块图分析行为。
   */
  moduleGraph?: JsModuleGraphOptions | undefined
}

export interface JsHandler {
  (
    rawSource: string,
    set?: Set<string>,
    options?: CreateJsHandlerOptions
  ): JsHandlerResult
}

export interface ICommonReplaceOptions {
  keepEOL?: boolean | undefined
  escapeMap?: Record<string, string> | undefined
}

export interface ITemplateHandlerOptions extends ICommonReplaceOptions {
  customAttributesEntities?: ICustomAttributesEntities | undefined
  escapeMap?: Record<string, string> | undefined
  inlineWxs?: boolean | undefined
  jsHandler?: JsHandler | undefined
  runtimeSet?: Set<string> | undefined
  disabledDefaultTemplateHandler?: boolean | undefined
  quote?: string | null | undefined
  // 是否转译首字母，默认转译，传入 true 不转
  ignoreHead?: boolean | undefined
  wrapExpression?: boolean | undefined
}

export interface InternalUserDefinedOptions extends InternalUserDefinedOptionsBase {
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

export type InternalPostcssOptions = Pick<
  UserDefinedOptions,
  'cssMatcher' | 'mainCssChunk' | 'cssPreflight' | 'cssPreflightRange' | 'disabled'
>

export interface IBaseWebpackPlugin {
  // 构造函数签名示例：new (options: UserDefinedOptions, appType: AppType): any
  // 或 constructor(options: UserDefinedOptions, appType: AppType): void
  options: InternalUserDefinedOptions
  appType?: AppType | undefined

  apply: (compiler: any) => void
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
  filter?: ((id: string, specifier: string, importer: string) => boolean) | undefined
  /**
   * 最大遍历深度，默认无限制（`Infinity`）。
   */
  maxDepth?: number | undefined
}
