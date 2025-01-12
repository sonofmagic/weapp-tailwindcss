import type { ParseError, ParserOptions } from '@babel/parser'
import type { IMangleOptions, IMangleScopeContext } from '@weapp-tailwindcss/mangle'
import type { CssPreflightOptions, IStyleHandlerOptions, UserDefinedPostcssOptions } from '@weapp-tailwindcss/postcss'
import type { SourceMap } from 'magic-string'
import type { Document, Result as PostcssResult, Root } from 'postcss'
import type { ILengthUnitsPatchOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import type { ICreateCacheReturnType } from '../cache'
import type { ItemOrItemArray } from './base'

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
  jsAstTool?: 'babel' | 'ast-grep'
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

export interface UserDefinedOptions extends UserDefinedPostcssOptions {
  /**
   * @group 1.文件匹配
   * @description 匹配 `wxml`等等模板进行处理的方法
   */
  htmlMatcher?: (name: string) => boolean
  /**
   * @group 1.文件匹配
   * @description 匹配 `wxss` 等等样式文件的方法
   */
  cssMatcher?: (name: string) => boolean
  /**
   * @group 1.文件匹配
   * @description 匹配编译后 `js` 文件进行处理的方法
   */
  jsMatcher?: (name: string) => boolean
  /**
   * @group 1.文件匹配
   * @description `tailwindcss css var inject scope` 的匹配方法,用于处理原始变量和替换不兼容选择器。可以不传，但是遇到某些 `::before/::after` 选择器注入冲突时，建议传入参数手动指定 css bundle 文件位置
   *
   */
  mainCssChunkMatcher?: (name: string, appType?: AppType) => boolean

  /**
   * @group 0.重要配置
   * @description 是否禁用此插件，一般用于构建到多平台时使用，比如小程序时不传，非小程序环境(h5,app)传入一个 `true`
   */
  disabled?: boolean

  /**
   * @group 2.生命周期
   * @description plugin apply 初调用
   */
  onLoad?: () => void
  /**
   * @group 2.生命周期
   * @description 开始处理时调用
   */
  onStart?: () => void
  /**
   * @description 匹配成功并修改文件内容前调用
   */
  // onBeforeUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * @group 2.生命周期
   * @description 匹配成功并修改文件内容后调用
   */
  onUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * @group 2.生命周期
   * @description 结束处理时调用
   */
  onEnd?: () => void

  /**
   * @group 0.重要配置
   * @description **这是一个重要的配置!**

它可以自定义`wxml`标签上的`attr`转化属性。默认转化所有的`class`和`hover-class`，这个`Map`的 `key`为匹配标签，`value`为属性字符串或者匹配正则数组。

如果你想要增加，对于所有标签都生效的转化的属性，你可以添加 `*`: `(string | Regexp)[]` 这样的键值对。(`*` 是一个特殊值，代表所有标签)

更复杂的情况，可以传一个 `Map<string | Regex, (string | Regex)[]>`实例。

假如你要把 `className` 通过组件的`prop`传递给子组件，又或者想要自定义转化的标签属性时，需要用到此配置，案例详见：[issue#129](https://github.com/sonofmagic/weapp-tailwindcss/issues/129#issuecomment-1340914688),[issue#134](https://github.com/sonofmagic/weapp-tailwindcss/issues/134#issuecomment-1351288238)

@example

```js
const customAttributes = {
    // 匹配所有带 Class / class 相关的标签，比如某个组件上的 `a-class`, `testClass` , `custom-class` 里面的值
    '*': [ /[A-Za-z]?[A-Za-z-]*[Cc]lass/ ],
    // 额外匹配转化 `van-image` 标签上属性为 `custom-class` 的值
    'van-image': ['custom-class'],
    // 转化所有 `ice-button` 标签上属性为 `testClass` 的值
    'ice-button': ['testClass']
}
```

当然你可以根据自己的需求，定义单个或者多个正则/字符串。

甚至有可能你编写正则表达式，它们匹配的范围，直接包括了插件里自带默认的 `class`/`hover-class`，那么这种情况下，你完全可以取代插件的默认模板转化器，开启 [disabledDefaultTemplateHandler](/docs/api/interfaces/UserDefinedOptions#disableddefaulttemplatehandler) 配置项,禁用默认的模版匹配转化器。
   */
  customAttributes?: ICustomAttributes
  /**
   * @group 0.重要配置
   * @description 自定义转化class名称字典，这个配置项用来自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`
- 默认模式: 把小程序中不允许的字符串，转义为**相等长度**的代替字符串，这种情况不追求转化目标字符串的一比一绝对等价，即无法从生成结果，反推原先的`class`

当然，你也可以自定义，传一个 `Record<string, string>` 类型，只需保证转化后 css 中的 `class` 选择器，不会和自己定义的 `class` 产生冲突即可，示例见[dic.ts](https://github.com/sonofmagic/weapp-core/blob/main/packages/escape/src/dic.ts)
   * @default SimpleMappingChars2String
   */
  customReplaceDictionary?: Record<string, string>

  /**
   * @group 3.一般配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/110
   * @description 自从`tailwindcss 3.2.0`对任意值添加了长度单位的校验后，小程序中的`rpx`这个`wxss`单位，由于不在长度合法名单中，于是被识别成了颜色，导致与预期不符，详见：[issues/110](https://github.com/sonofmagic/weapp-tailwindcss/issues/110)。所以这个选项是用来给`tailwindcss`运行时，自动打上一个支持`rpx`单位的补丁。默认开启，在绝大部分情况下，你都可以忽略这个配置项，除非你需要更高级的自定义。
> 目前自动检索可能存在一定的缺陷，它会在第一次运行的时候不生效，关闭后第二次运行才生效。这是因为 nodejs 运行时先加载好了 `tailwindcss` 模块 ，然后再来运行这个插件，自动给 `tailwindcss` 运行时打上 `patch`。此时由于 `tailwindcss` 模块已经加载，所以 `patch` 在第一次运行时不生效，`ctrl+c` 关闭之后，再次运行才生效。这种情况可以使用:

```diff
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

使用 `npm hooks` 的方式来给 `tailwindcss` 自动打 `patch`
   */
  supportCustomLengthUnitsPatch?: ILengthUnitsPatchOptions | boolean

  /**
   * @group 3.一般配置
   * @description 使用的框架类型(uni-app,taro...)，用于找到主要的 `css bundle` 进行转化，这个配置会影响默认方法 `mainCssChunkMatcher` 的行为，不传会去猜测 `tailwindcss css var inject scope` (tailwindcss 变量注入的位置) 的位置
   */
  appType?: AppType

  /**
   * @group 3.一般配置
   * @description 是否压缩混淆 `wxml`,`js` 和 `wxss` 中指定范围的 `class` 以避免选择器过长问题，默认为`false`不开启，详细配置见 [unplugin-tailwindcss-mangle](https://github.com/sonofmagic/tailwindcss-mangle/tree/main/packages/unplugin-tailwindcss-mangle)
   * @url https://github.com/sonofmagic/tailwindcss-mangle
   */
  mangle?: boolean | IMangleOptions

  /**
   * @group 3.一般配置
   * @description 针对 tailwindcss arbitrary values 的一些配置
   */
  arbitraryValues?: IArbitraryValues
  /**
   * @group 1.文件匹配
   * @experiment 实验性质，有可能会改变
   * @description 各个平台 `wxs` 文件的匹配方法,可以设置为包括微信的 .wxs,支付宝的 .sjs 和 百度小程序的 .filter.js
   * > tip: 记得在 `tailwind.config.js` 中，把 `wxs` 这个格式加入 `content` 配置项，不然不会生效
   * @default ()=>false
   */
  wxsMatcher?: (name: string) => boolean

  /**
   * @group 1.文件匹配
   * @experiment 实验性质，有可能会改变
   * @description 是否转义 `wxml` 中内联的 `wxs`
   * > tip: 记得在 `tailwind.config.js` 中，把 `wxs` 这个格式加入 `content` 配置项，不然不会生效
   * @example
   * ```html
   * <!-- index.wxml -->
   * <wxs module="inline">
// 我是内联wxs
// 下方的类名会被转义
  var className = "after:content-['我是className']"
  module.exports = {
    className: className
  }
</wxs>
<wxs src="./index.wxs" module="outside"/>
<view><view class="{{inline.className}}"></view><view class="{{outside.className}}"></view></view>
   * ```
   * @default false
   */
  inlineWxs?: boolean

  /**
   * @group 3.一般配置
   * @version `^2.6.1`
   * @description 当 `tailwindcss` 和 `js` 处理的字面量撞车的时候，配置此选项可以用来保留js字面量，不进行转义处理。返回值中，想要当前js字面量保留，则返回 `true`。想要转义则返回 `false/undefined`
   * @default 保留所有带 `*` js字符串字面量
   */
  jsPreserveClass?: (keyword: string) => boolean | undefined

  /**
   * @group 3.一般配置
   * @version `^2.6.2`
   * @description 开启此选项，将会禁用默认 `wxml` 模板替换器，此时模板的匹配和转化将完全被 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 接管，
   *
   * 此时你需要自己编写匹配之前默认 `class`/`hover-class`，以及新的标签属性的正则表达式`regex`
   * @default false
   */
  disabledDefaultTemplateHandler?: boolean

  /**
   * @ignore
   * @internal
   */
  runtimeLoaderPath?: string

  /**
   * @group 3.一般配置
   * @version `^2.9.3`
   * @description 用于指定路径来获取 tailwindcss 上下文，一般情况下不用传入，使用 linked / monorepo 可能需要指定具体位置，路径通常是目标项目的 package.json 所在目录
   */
  tailwindcssBasedir?: string

  /**
   * @group 3.一般配置
   * @version `^3.0.11`
   * @description 缓存策略
   */
  cache?: boolean | ICreateCacheReturnType

  /**
   * @version `^3.1.0`
   * @group 0.重要配置
   * @description 对解析 js 使用的 ast 工具，默认情况使用 `babel`，可以通过安装 `@ast-grep/napi`，同时启用 `ast-grep` 配置项，来启用 `ast-grep` 来处理 `js`，速度会是 `babel` 的 `2` 倍左右
   */
  jsAstTool?: 'babel' | 'ast-grep'
  /**
   * @version `^3.2.0`
   * @group 3.一般配置
   * @description 对解析 js 使用的 `@babel/parser` 工具的配置
   */
  babelParserOptions?: ParserOptions
  /**
   * @version `^4.0.0`
   * @group 0.重要配置
   * @description js 忽略标签模板表达式中的标识符，这样使用标识符包裹的模板字符串不会被转义
   * @default ['weappTwIgnore']
   */
  ignoreTaggedTemplateExpressionIdentifiers?: (string | RegExp)[]
  /**
   * @version `^4.0.0`
   * @group 0.重要配置
   * @description js 忽略调用表达式中的标识符，这样使用这个方法，包裹的模板字符串和字符串字面量不会被转义，一般用来配合 `@weapp-tailwindcss/merge` 使用，比如设置为 `['cn','cva']`
   */
  ignoreCallExpressionIdentifiers?: (string | RegExp)[]
}

export interface JsHandler {
  (
    rawSource: string,
    set: Set<string>,
    options?: CreateJsHandlerOptions
  ): JsHandlerResult | Promise<JsHandlerResult>

  sync: (
    rawSource: string,
    set: Set<string>,
    options?: CreateJsHandlerOptions
  ) => JsHandlerResult
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
