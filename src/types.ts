import type { Rule } from 'postcss'
import type { IClassGeneratorOptions, ClassGenerator } from 'tailwindcss-mangle-shared'
import type { GeneratorResult } from '@babel/generator'
import type { InjectPreflight } from './postcss/preflight'
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
  cssPreflightRange?: 'view' | 'all'
  /**
   * @description 用于控制 tailwindcss 子组合器的生效标签范围
   * @default 'view + view'
   */
  cssChildCombinatorReplaceValue?: string | string[]
  replaceUniversalSelectorWith?: string | false
  escapeMap?: Record<string, string>
}

export type CustomRuleCallback = (node: Rule, options: Readonly<RequiredStyleHandlerOptions>) => void

export interface InternalCssSelectorReplacerOptions {
  mangleContext?: IMangleScopeContext
  escapeMap?: Record<string, string>
}

export type IStyleHandlerOptions = {
  customRuleCallback?: CustomRuleCallback
  mangleContext?: IMangleScopeContext
} & RequiredStyleHandlerOptions

export type ICustomAttributes = Record<string, ItemOrItemArray<string | RegExp>> | Map<string | RegExp, ItemOrItemArray<string | RegExp>>

export type ICustomAttributesEntities = [string | RegExp, ItemOrItemArray<string | RegExp>][]

export type IJsHandlerOptions = {
  escapeMap?: Record<string, string>
  classNameSet: Set<string>
  minifiedJs?: boolean
  arbitraryValues?: IArbitraryValues
  mangleContext?: IMangleScopeContext
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

export interface ILengthUnitsPatchDangerousOptions {
  packageName?: string
  gteVersion?: string
  lengthUnitsFilePath?: string
  variableName?: string
  overwrite?: boolean
  destPath?: string
}

/**
 * @deprecated
 */
export interface ILengthUnitsPatchOptions {
  units: string[]
  paths?: string[]
  dangerousOptions?: ILengthUnitsPatchDangerousOptions
  basedir?: string
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
   * @description 匹配 `wxml`等等模板进行处理的方法，支持 `glob` by [micromatch](https://github.com/micromatch/micromatch)
   */
  htmlMatcher?: ((name: string) => boolean) | string | string[]
  /**
   * @description 匹配 `wxss` 等等样式文件的方法，支持 `glob` by [micromatch](https://github.com/micromatch/micromatch)
   */
  cssMatcher?: ((name: string) => boolean) | string | string[]
  /**
   * @description 匹配编译后 `js` 文件进行处理的方法，支持 `glob` by [micromatch](https://github.com/micromatch/micromatch)
   */
  jsMatcher?: ((name: string) => boolean) | string | string[]
  /**
   * @description `tailwindcss css var inject scope` 的匹配方法,用于处理原始变量和替换不兼容选择器。可以不传，但是遇到某些 `::before/::after` 选择器注入冲突时，建议传入参数手动指定 css bundle 文件位置
   *
   */
  mainCssChunkMatcher?: ((name: string, appType?: AppType) => boolean) | string | string[]
  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/7
   * @description 在所有 view节点添加的 css 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。 详细用法如下:
   * ```js
   * // default 默认:
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
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/pull/62
   * @description 全局`dom`选择器，只有在这个选择器作用范围内的`dom`会被注入 `cssPreflight` 的变量和默认样式。默认为 `'view'` 即只对所有的 `view` 和伪元素生效，想要对所有的元素生效，可切换为 `'all'`,此时需要自行处理和客户端默认样式的冲突
   */
  cssPreflightRange?: 'view' | 'all'

  /**
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/81
   * @default 'view'
   * @description 把`css`中的全局选择器 **`*`** 替换为指定值，默认替换为 `'view'`，设置为 `false` 时不进行替换，此时小程序会由于不认识`*`选择器而报错
   */
  replaceUniversalSelectorWith?: string | false

  /**
   * @description 是否禁用此插件，一般用于构建到多平台时使用
   */
  disabled?: boolean

  /**
   * @description 用于自定义处理 css 的回调函数，可根据 Postcss walk 方法自由定制处理方案的 callback 方法
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
   * @description **这是一个重要的配置!**

它可以自定义`wxml`标签上的`attr`转化属性。默认转化所有的`class`和`hover-class`，这个`Map`的 `key`为匹配标签，`value`为属性字符串或者匹配正则数组。如果你想要增加转化的属性，你可以添加 `*`: `(string | Regexp)[]` 这样的键值对，使其中属性的转化，在所有标签上生效，更复杂的情况，可以传一个Map实例。

假如你要把 `className` 通过组件的prop传递给子组件，又或者想要自定义转化的标签属性时，需要用到此配置，案例详见：[issue#129](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/129#issuecomment-1340914688),[issue#134](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/134#issuecomment-1351288238)
   */
  customAttributes?: ICustomAttributes
  /**
   * @description 自定义转化class名称字典，这个配置项用来自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`

插件中内置了`'simple'`模式和`'complex'`模式:

- `'simple'`模式: 把小程序中不允许的字符串，转义为**相等长度**的代替字符串，这种情况不追求转化目标字符串的一比一绝对等价，即无法从生成结果，反推原先的`class`
- `'complex'`模式: 把小程序中不允许的字符串，转义为**更长**的代替字符串，这种情况转化前后的字符串是等价的，可以从结果进行反推，缺点就是会生成更长的 `class` 导致 `wxml`和`wxss`这类的体积增大

当然，你也可以自定义，传一个 `Record<string, string>` 类型，只需保证转化后 css 中的 `class` 选择器，不会和自己定义的 `class` 产生冲突即可，示例见[dic.ts](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/src/dic.ts)
   * @default 'simple'
   */
  customReplaceDictionary?: 'simple' | 'complex' | Record<string, string>

  /**
   * @deprecated
   * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110
   * @description 自从`tailwindcss 3.2.0`对任意值添加了长度单位的校验后，小程序中的`rpx`这个`wxss`单位，由于不在长度合法名单中，于是被识别成了颜色，导致与预期不符，详见：[issues/110](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110)。所以这个选项是用来给`tailwindcss`运行时，自动打上一个支持`rpx`单位的补丁。默认开启，在绝大部分情况下，你都可以忽略这个配置项，除非你需要更高级的自定义。
> 目前自动检索存在一定的缺陷，它会在第一次运行的时候不生效，关闭后第二次运行才生效。这是因为 nodejs 运行时先加载好了 `tailwindcss` 模块 ，然后再来运行这个插件，自动给 `tailwindcss` 运行时打上 `patch`。此时由于 `tailwindcss` 模块已经加载，所以 `patch` 在第一次运行时不生效，`ctrl+c` 关闭之后，再次运行才生效。这种情况可以使用:

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

使用 `npm hooks` 的方式来给 `tailwindcss` 自动打 `patch`
   */
  supportCustomLengthUnitsPatch?: ILengthUnitsPatchOptions | boolean

  /**
   * @description 使用的框架类型(uni-app,taro...)，用于找到主要的 `css bundle` 进行转化，这个配置会影响默认方法 `mainCssChunkMatcher` 的行为，不传会去猜测 `tailwindcss css var inject scope` 的位置
   */
  appType?: AppType

  /**
   * @description 是否压缩 js (`process.env.NODE_ENV` 为 `production` 时默认开启)
   * @default process.env.NODE_ENV === 'production'
   */
  minifiedJs?: boolean

  /**
   * @description 是否压缩混淆 `wxml`,`js` 和 `wxss` 中指定范围的 `class` 以避免选择器过长问题，默认为`false`不开启，详细配置见 [unplugin-tailwindcss-mangle](https://github.com/sonofmagic/tailwindcss-mangle/tree/main/packages/unplugin-tailwindcss-mangle)
   * @url https://github.com/sonofmagic/tailwindcss-mangle
   */
  mangle?: boolean | IMangleOptions

  /**
   * @description 针对 tailwindcss arbitrary values 的一些配置
   */
  arbitraryValues?: IArbitraryValues
  /**
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
   * .space-y-4>view,text + view,text{}
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
   * @experiment
   * @description 各个平台 `wxs` 文件的匹配方法
   * > tip: 记得在 `tailwind.config.js` 中，把 `wxs` 这个格式加入 `content` 配置项，不然不会生效
   * @default ()=>false
   * 可以设置为包括微信的 .wxs,支付宝的 .sjs 和 百度小程序的 .filter.js
   */
  wxsMatcher?: ((name: string) => boolean) | string | string[]

  /**
   * @experiment
   * @description 是否转义 `wxml` 中内联的 `wxs`
   * > tip: 记得在 `tailwind.config.js` 中，把 `wxs` 这个格式加入 `content` 配置项，不然不会生效
   * @example 
   * ```html
   * <!-- index.wxml -->
   * <wxs module="inline">
// 我是内联wxs
// 下方的类名会被转义
  var className = 'after:content-[\'我来自inline-wxs\']'
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
  escapeMap?: Record<string, string>
  mangleContext?: IMangleScopeContext
  inlineWxs?: boolean
  jsHandler?: (rawSource: string, set: Set<string>) => GeneratorResult
  runtimeSet?: Set<string>
}

export type GlobOrFunctionMatchers = 'htmlMatcher' | 'cssMatcher' | 'jsMatcher' | 'mainCssChunkMatcher' | 'wxsMatcher'

export type InternalUserDefinedOptions = Required<
  Omit<UserDefinedOptions, GlobOrFunctionMatchers | 'supportCustomLengthUnitsPatch' | 'customReplaceDictionary'> & {
    [K in GlobOrFunctionMatchers]: K extends 'mainCssChunkMatcher' ? (name: string, appType?: AppType) => boolean : (name: string) => boolean
  } & {
    supportCustomLengthUnitsPatch: ILengthUnitsPatchOptions | false
    templeteHandler: (rawSource: string, options?: ITempleteHandlerOptions) => string
    styleHandler: (rawSource: string, options: IStyleHandlerOptions) => string
    jsHandler: (rawSource: string, set: Set<string>) => GeneratorResult
    escapeMap: Record<string, string>
    patch: () => void
    customReplaceDictionary: Record<string, string>
    // initMangle: (mangleOptions: UserDefinedOptions['mangle']) => void
    setMangleRuntimeSet: (runtimeSet: Set<string>) => void
  }
>

export type InternalPostcssOptions = Pick<
  UserDefinedOptions,
  'cssMatcher' | 'mainCssChunkMatcher' | 'cssPreflight' | 'replaceUniversalSelectorWith' | 'cssPreflightRange' | 'customRuleCallback' | 'disabled'
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
