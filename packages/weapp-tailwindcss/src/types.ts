import type { Rule } from 'postcss'
import type { ClassGenerator, IClassGeneratorOptions } from '@tailwindcss-mangle/shared'
import type { SourceMap } from 'magic-string'
import type { GeneratorResult } from '@babel/generator'
import type { ParseError, ParserOptions } from '@babel/parser'
import type { UserDefinedOptions as rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { Result } from 'postcss-load-config'
import type { ILengthUnitsPatchOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import type { InjectPreflight } from './postcss/preflight'
import type { IContext as PostcssContext } from './postcss/plugins/ctx'
import type { ICreateCacheReturnType } from './cache'

type PostcssOptions = Partial<Omit<Result, 'file'>>

export type ItemOrItemArray<T> = T | T[]

export type AppType = 'uni-app' | 'uni-app-vite' | 'taro' | 'remax' | 'rax' | 'native' | 'kbone' | 'mpx'

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

export type RequiredStyleHandlerOptions = {
  /**
   * @description 默认为 true，此时会对样式主文件，进行猜测
   */
  isMainChunk: boolean
  cssInjectPreflight?: InjectPreflight
  escapeMap?: Record<string, string>
} & Pick<
  UserDefinedOptions,
  | 'cssPreflightRange'
  | 'cssChildCombinatorReplaceValue'
  | 'injectAdditionalCssVarScope'
  | 'cssSelectorReplacement'
  | 'rem2rpx'
>

export type CustomRuleCallback = (node: Rule, options: Readonly<RequiredStyleHandlerOptions>) => void

export interface InternalCssSelectorReplacerOptions {
  mangleContext?: IMangleScopeContext
  escapeMap?: Record<string, string>
}

export type IStyleHandlerOptions = {
  customRuleCallback?: CustomRuleCallback
  mangleContext?: IMangleScopeContext
  ctx?: PostcssContext
  postcssOptions?: PostcssOptions
  cssRemoveHoverPseudoClass?: boolean
} & RequiredStyleHandlerOptions

export interface JsHandlerReplaceResult { code: string, map?: SourceMap }

export type JsHandlerResult = (JsHandlerReplaceResult | GeneratorResult) & { error?: ParseError }

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
  always?: boolean
  jsAstTool?: 'babel' | 'ast-grep'
  unescapeUnicode?: boolean
  babelParserOptions?: ParserOptions
}
export interface RawSource {
  start: number
  end: number
  raw: string
  // '' 直接 remove {{}}
  source?: string
  // prevConcatenated: boolean
  // nextConcatenated: boolean
}

export interface IMangleOptions {
  classGenerator?: IClassGeneratorOptions
  mangleClassFilter?: (className: string) => boolean
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

export interface UserDefinedOptions {
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
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/7
   * @description 在所有 view节点添加的 css 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。默认预置 `css` 同 `tailwindcss` 类似，详细用法如下:
   * ```js
   * // default 默认，这代表会添加给所有的 view / text 元素, 受到 cssPreflightRange 配置项影响 :
cssPreflight: {
  'box-sizing': 'border-box',
  'border-width': '0',
  'border-style': 'solid',
  'border-color': 'currentColor'
}
// result
// box-sizing: border-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 禁用所有
cssPreflight: false
// result
// none

// case 禁用单个属性
cssPreflight: {
  'box-sizing': false
}
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 更改和添加单个属性
cssPreflight: {
  'box-sizing': 'content-box',
  'background': 'black'
}
// result
// box-sizing: content-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor;
// background: black
   * ```
   */
  cssPreflight?: CssPreflightOptions

  /**
   * @group 0.重要配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/pull/62
   * @description 全局`dom`选择器，只有在这个选择器作用范围内的`dom`会被注入 `cssPreflight` 的变量和默认样式。只对所有的 `view`,`text` 和伪元素生效，想要对所有的元素生效，可切换为 `'all'`,此时需要自行处理和客户端默认样式的冲突
   */
  cssPreflightRange?: 'all'

  /**
   * @group 0.重要配置
   * @description 是否禁用此插件，一般用于构建到多平台时使用，比如小程序时不传，非小程序环境(h5,app)传入一个 `true`
   */
  disabled?: boolean

  /**
   * @group 3.一般配置
   * @description 用于自定义处理 css 的回调函数，可根据 Postcss walk 方法自由定制处理方案的 callback 方法
   */
  customRuleCallback?: CustomRuleCallback

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

插件中默认使用`'simple'`模式:

- `'simple'`模式: 把小程序中不允许的字符串，转义为**相等长度**的代替字符串，这种情况不追求转化目标字符串的一比一绝对等价，即无法从生成结果，反推原先的`class`

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
   * @group 3.一般配置
   * @description 用于控制 tailwindcss 子组合器的生效标签范围, 这里我们用一个例子来说明这个配置是干啥用的.
   *
   * 我们布局的时候往往会使用 `space-x-4`
   * 那么实际上会生成这样的css选择器:
   * ```css
   * .space-x-4>:not([hidden])~:not([hidden]){}
   * ```
   * 然而很不幸，这个选择器在小程序中是不支持的，写了会报错导致编译失败。
   * 所以出于保守起见，我把它替换为了：
   * ```css
   * .space-x-4>view + view{}
   * ```
   * 这同时也是默认值, 而这个选项就允许你进行自定义子组合器的行为
   *
   * 你可以传入一个 字符串，或者字符串数组
   * 1. 传入字符串数组,比如 `['view','text']` 生成:
   * ```css
   * .space-y-4>view + view,text + text{}
   * ```
   *
   * 2. 传入一个字符串，此时行为变成了整个替换，比如 `'view,text,button,input ~ view,text,button,input'` 生成:
   * ```css
   * .space-y-4>view,text,button,input ~ view,text,button,input{}
   * ```
   * @default 'view + view'
   */
  cssChildCombinatorReplaceValue?: string | string[]

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
   * @group 0.重要配置
   * @version `^2.6.0`
   * @description  是否注入额外的 `tailwindcss css var scope` 区域，这个选项用于这样的场景
   *
   * 比如 `taro vue3` 使用 [NutUI](https://nutui.jd.com), 需要使用 `@tarojs/plugin-html`，而这个插件会启用 `postcss-html-transform` 从而移除所有带 `*` 选择器
   *
   * 这会导致 `tailwindcss css var scope` 区域被移除导致一些样式，比如渐变等等功能失效
   *
   * 这种场景下，启用这个选项会再次重新注入整个 `tailwindcss css var scope`
   *
   * @default false
   */
  injectAdditionalCssVarScope?: boolean

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
   * @group 0.重要配置
   * @description 用于处理 css 选择器的替换
   */
  cssSelectorReplacement?: {
    /**
     * @default `'page'` <br/>
     * @description 把`css`中的全局选择器 **`:root`** 替换为指定值，默认替换为 `'page'`，设置为 `false` 时不进行替换
     */
    root?: string | string[] | false
    /**
     * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/81 <br/>
     * @default `['view','text']` <br/>
     * @description 把`css`中的全局选择器 **`*`** 替换为指定值，默认替换为 `'view','text'`，设置为 `false` 时不进行替换，此时小程序会由于不认识`*`选择器而报错
     */
    universal?: string | string[] | false
  }

  /**
   * @group 3.一般配置
   * @version `^2.9.3`
   * @description 用于指定路径来获取 tailwindcss 上下文，一般情况下不用传入，使用 linked / monorepo 可能需要指定具体位置，路径通常是目标项目的 package.json 所在目录
   */
  tailwindcssBasedir?: string
  /**
   * @version `^3.0.0`
   * @group 0.重要配置
   * @description rem 转 rpx 配置，默认为 `undefined` 不开启，可传入 `true` 启用默认配置项，也可传入自定义配置项，配置项列表见 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)
   */
  rem2rpx?: boolean | rem2rpxOptions

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
   * @version `^3.2.0`
   * @group 3.一般配置
   * @description 对解析 css 使用的 `postcss` 工具的配置
   */
  postcssOptions?: PostcssOptions
  /**
   * @version `^3.2.1`
   * @group 3.一般配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/293
   * @default `true`
   * @description 是否删除 css :hover 选择器节点，默认为 `true`, 原因在于，小程序 css :hover 是不生效的，要使用 view 这种标签的 hover-class 属性
   */
  cssRemoveHoverPseudoClass?: boolean
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

export interface IMangleScopeContext {
  rawOptions: UserDefinedOptions['mangle']
  runtimeSet: Set<string>
  classGenerator: ClassGenerator
  filter: (className: string) => boolean
  cssHandler: (rawSource: string) => string
  jsHandler: (rawSource: string) => string
  wxmlHandler: (rawSource: string) => string
}

export interface ICommonReplaceOptions {
  keepEOL?: boolean
  escapeMap?: Record<string, string>
  // customAttributes?: Record<string, string | string[]>
}

export interface ITemplateHandlerOptions extends ICommonReplaceOptions {
  customAttributesEntities?: ICustomAttributesEntities
  // allMatchedAttributes?: (string | RegExp)[]
  // custom?: boolean
  // regexps?: ICustomRegexp[]
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
    styleHandler: (rawSource: string, options: IStyleHandlerOptions) => Promise<string>
    jsHandler: JsHandler
    escapeMap: Record<string, string>
    patch: () => void
    customReplaceDictionary: Record<string, string>
    // initMangle: (mangleOptions: UserDefinedOptions['mangle']) => void
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
