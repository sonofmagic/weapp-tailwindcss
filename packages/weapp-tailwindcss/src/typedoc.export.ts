import type { ParserOptions } from '@babel/parser'
import type {
  CssCalcOptions,
  CssPreflightOptions,
  LoadedPostcssOptions,
  PresetEnvOptions,
  Px2rpxOptions,
  Rem2rpxOptions,
} from '@weapp-tailwindcss/postcss'
import type { ILengthUnitsPatchOptions, TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { ICreateCacheReturnType } from './cache'
import type { AppType, IArbitraryValues, ICustomAttributes } from './types'

// 0.重要配置
export interface UserDefinedOptions {

  /**
   * 是否禁用此插件。
   *
   * @group 0.重要配置
   * @remarks
   * 在多平台构建场景下常用：小程序构建保持默认，非小程序环境（H5、App）传入 `true` 即可跳过转换。
   * @example
   * ```ts
   * // uni-app vue3 vite
   * import process from 'node:process'
   *
   * const isH5 = process.env.UNI_PLATFORM === 'h5'
   * const isApp = process.env.UNI_PLATFORM === 'app'
   * const disabled = isH5 || isApp
   *
   * import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'
   *
   * uvtw({
   *   disabled,
   * })
   * ```
   */
  disabled?: boolean

  /**
   * 自定义 `wxml` 标签属性的转换规则。
   *
   * @group 0.重要配置
   * @remarks
   * 默认会转换所有标签上的 `class` 与 `hover-class`。此配置允许通过 `Map` 或对象为特定标签指定需要转换的属性字符串或正则表达式数组。
   * - 使用 `'*'` 作为键可为所有标签追加通用规则。
   * - 支持传入 `Map<string | RegExp, (string | RegExp)[]>` 以满足复杂匹配需求。
   * - 常见场景包括通过组件 `prop` 传递类名，或对三方组件的自定义属性做匹配，更多讨论见 [issue#129](https://github.com/sonofmagic/weapp-tailwindcss/issues/129#issuecomment-1340914688) 与 [issue#134](https://github.com/sonofmagic/weapp-tailwindcss/issues/134#issuecomment-1351288238)。
   * 如果自定义规则已经覆盖默认的 `class`/`hover-class`，可开启 [`disabledDefaultTemplateHandler`](/docs/api/interfaces/UserDefinedOptions#disableddefaulttemplatehandler) 以关闭内置模板处理器。
   * @example
   * ```js
   * const customAttributes = {
   *   '*': [/[A-Za-z]?[A-Za-z-]*[Cc]lass/],
   *   'van-image': ['custom-class'],
   *   'ice-button': ['testClass'],
   * }
   * ```
   */
  customAttributes?: ICustomAttributes
  /**
   * 自定义 class 名称的替换字典。
   *
   * @group 0.重要配置
   * @remarks
   * 默认策略会将小程序不允许的字符映射为等长度的替代字符串，因此无法通过结果反推出原始类名。如需完全自定义，可传入 `Record<string, string>`，只需确保生成的类名不会与已有样式冲突。示例参考 [dic.ts](https://github.com/sonofmagic/weapp-core/blob/main/packages/escape/src/dic.ts)。
   * @default MappingChars2String
   */
  customReplaceDictionary?: Record<string, string>

  /**
   * 忽略指定标签模板表达式中的标识符。
   *
   * @version `^4.0.0`
   * @group 0.重要配置
   * @remarks
   * 当模板字符串被这些标识符包裹时，将跳过转义处理。
   * @default ['weappTwIgnore']
   */
  ignoreTaggedTemplateExpressionIdentifiers?: (string | RegExp)[]
  /**
   * 忽略指定调用表达式中的标识符。
   *
   * @version `^4.0.0`
   * @group 0.重要配置
   * @remarks
   * 使用这些方法包裹的模板字符串或字符串字面量会跳过转义，常与 `@weapp-tailwindcss/merge` 配合（如 `['twMerge', 'twJoin', 'cva']`）。
   */
  ignoreCallExpressionIdentifiers?: (string | RegExp)[]

  /**
   * @internal
   */
  replaceRuntimePackages?: boolean | Record<string, string>

  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------Postcss-----------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  /**
   * 控制在视图节点上注入的 CSS 预设。
   *
   * @group 0.重要配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/7
   * @remarks
   * 默认会向所有 `view`/`text` 元素注入 Tailwind 风格的基础样式，可通过此配置禁用、调整或补充规则，受 `cssPreflightRange` 影响。
   * @example
   * ```js
   * cssPreflight: {
   *   'box-sizing': 'border-box',
   *   'border-width': '0',
   *   'border-style': 'solid',
   *   'border-color': 'currentColor',
   * }
   *
   * cssPreflight: false
   *
   * cssPreflight: {
   *   'box-sizing': false,
   *   background: 'black',
   * }
   * ```
   */
  cssPreflight?: CssPreflightOptions
  /**
   * 控制 `cssPreflight` 注入的 DOM 选择器范围。
   *
   * @group 0.重要配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/pull/62
   * @remarks
   * 仅 `view`、`text` 及其伪元素会受影响。设置为 `'all'` 可以覆盖所有元素，此时需自行处理与宿主默认样式的冲突。
   */
  cssPreflightRange?: 'all'
  /**
   * 预计算 CSS 变量或 `calc` 表达式的结果。
   *
   * @group 0.重要配置
   * @version `^4.3.0`
   * @remarks
   * 解决部分机型对 `calc` 计算不一致的问题，可传入布尔值、选项对象或自定义匹配列表（支持正则）。在启用计算后，可通过 `includeCustomProperties` 指定需要保留的变量。
   * @example
   * ```css
   * // 原始输出
   * page,
   * :root {
   *   --spacing: 8rpx;
   * }
   * .h-2 {
   *   height: calc(var(--spacing) * 2);
   * }
   * ```
   *
   * ```css
   * // 启用 cssCalc 后
   * .h-2 {
   *   height: 16rpx;
   *   height: calc(var(--spacing) * 2);
   * }
   * ```
   *
   * ```js
   * cssCalc: ['--spacing']
   * cssCalc: { includeCustomProperties: ['--spacing'] }
   * ```
   */
  cssCalc?: boolean | CssCalcOptions | (string | RegExp)[]

  /**
   * 是否额外注入 `tailwindcss css var scope`。
   *
   * @group 0.重要配置
   * @version `^2.6.0`
   * @remarks
   * 当构建链路（例如 `@tarojs/plugin-html`）移除了包含 `*` 的选择器时，可启用该选项重新写入变量作用域，以避免渐变等功能失效。
   * @default false
   */
  injectAdditionalCssVarScope?: boolean
  /**
   * 控制 CSS 选择器的替换规则。
   *
   * @group 0.重要配置
   */
  cssSelectorReplacement?: {
    /**
     * 将全局选择器 `:root` 替换为指定值。
     *
     * @default `'page'` <br/>
     * @remarks
     * 设置为 `false` 时不再替换，可根据宿主环境（例如 RootPortal）传入数组值。
     * @example
     * root: ['page', 'wx-root-content']
     */
    root?: string | string[] | false
    /**
     * 将全局选择器 `*` 替换为指定值。
     *
     * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/81 <br/>
     * @default `['view','text']` <br/>
     * @remarks
     * 小程序环境不支持 `*`，因此默认转换为 `view`、`text`；设置为 `false` 会留下原始选择器。
     */
    universal?: string | string[] | false
  }
  /**
   * rem 到 rpx 的转换配置。
   *
   * @version `^3.0.0`
   * @group 0.重要配置
   * @remarks
   * 传入 `true` 使用默认配置，或提供 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 支持的完整选项。
   * ```ts
   * {
   *   rootValue: 32,
   *   propList: ['*'],
   *   transformUnit: 'rpx',
   * }
   * ```
   */
  rem2rpx?: boolean | Rem2rpxOptions
  /**
   * px 到 rpx 的转换配置。
   *
   * @group 0.重要配置
   * @version `^4.3.0`
   * @remarks
   * 传入 `true` 启用默认映射（`1px = 1rpx`），或通过对象自定义更多行为。
   */
  px2rpx?: boolean | Px2rpxOptions

  /**
   * `postcss-preset-env` 的配置项。
   *
   * @version `^4.0.0`
   * @group 0.重要配置
   * @see https://preset-env.cssdb.org/
   * @see https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme
   */
  cssPresetEnv?: PresetEnvOptions

  /**
   * 为不同版本的 Tailwind 配置行为。
   *
   * @version `^4.0.0`
   * @group 0.重要配置
   */
  tailwindcss?: TailwindcssPatchOptions['tailwind']

  /**
   * 指定 tailwindcss@4 的入口 CSS。
   *
   * @version `^4.2.6`
   * @group 0.重要配置
   * @remarks
   * 未配置时无法加载自定义插件，等价于设置 `tailwindcss.v4.cssEntries`。
   */
  cssEntries?: string[]
  /**
   * 配置 uni-app x 场景的行为。
   *
   * @version `^4.2.0`
   * @group 0.重要配置
   * @ignore
   */
  uniAppX?: boolean
}

// 1.文件匹配
export interface UserDefinedOptions {
  /**
   * 匹配需要处理的 `wxml` 等模板文件。
   *
   * @group 1.文件匹配
   */
  htmlMatcher?: (name: string) => boolean
  /**
   * 匹配需要处理的 `wxss` 等样式文件。
   *
   * @group 1.文件匹配
   */
  cssMatcher?: (name: string) => boolean
  /**
   * 匹配需要处理的编译后 `js` 文件。
   *
   * @group 1.文件匹配
   */
  jsMatcher?: (name: string) => boolean
  /**
   * 匹配负责注入 Tailwind CSS 变量作用域的 CSS Bundle。
   *
   * @group 1.文件匹配
   * @remarks
   * 在处理 `::before`/`::after` 等不兼容选择器时，建议手动指定文件位置。
   */
  mainCssChunkMatcher?: (name: string, appType?: AppType) => boolean

  /**
   * 匹配各端的 `wxs`/`sjs`/`.filter.js` 文件。
   *
   * @group 1.文件匹配
   * @experiment 实验性质，有可能会改变
   * @remarks
   * 配置前请确保在 `tailwind.config.js` 的 `content` 中包含对应格式。
   * @default ()=>false
   */
  wxsMatcher?: (name: string) => boolean

  /**
   * 是否转义 `wxml` 中的内联 `wxs`。
   *
   * @group 1.文件匹配
   * @experiment 实验性质，有可能会改变
   * @remarks
   * 使用前同样需要在 `tailwind.config.js` 中声明 `wxs` 格式。
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
}

// 2.生命周期
export interface UserDefinedOptions {
  /**
   * 插件 `apply` 初始调用时触发。
   *
   * @group 2.生命周期
   */
  onLoad?: () => void
  /**
   * 开始处理前触发。
   *
   * @group 2.生命周期
   */
  onStart?: () => void
  /**
   * 匹配并修改文件内容前触发。
   *
   * @group 2.生命周期
   */
  // onBeforeUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * 匹配并修改文件后触发。
   *
   * @group 2.生命周期
   */
  onUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * 结束处理时触发。
   *
   * @group 2.生命周期
   */
  onEnd?: () => void
}

// 3.一般配置
export interface UserDefinedOptions {

  /**
   * 控制 Tailwind 自定义长度单位补丁。
   *
   * @group 3.一般配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/110
   * @remarks
   * TailwindCSS 3.2.0 起对任意值执行长度单位校验，会将未声明的 `rpx` 识别为颜色。本选项默认开启以注入 `rpx` 支持。当 Node.js 在插件执行前已缓存 `tailwindcss` 模块时，首轮运行可能未生效，可通过在 `postinstall` 中执行 `weapp-tw patch` 提前打补丁。
   * ```diff
   * "scripts": {
   * +  "postinstall": "weapp-tw patch"
   * }
   * ```
   */
  supportCustomLengthUnitsPatch?: ILengthUnitsPatchOptions | boolean

  /**
   * 声明所使用的框架类型。
   *
   * @group 3.一般配置
   * @remarks
   * 用于辅助定位主要的 CSS bundle，以便默认的 `mainCssChunkMatcher` 做出更准确的匹配，未传入时将尝试自动猜测变量注入位置。
   */
  appType?: AppType

  /**
   * TailwindCSS 任意值的相关配置。
   *
   * @group 3.一般配置
   */
  arbitraryValues?: IArbitraryValues

  /**
   * 控制 JS 字面量是否需要保留。
   *
   * @group 3.一般配置
   * @version `^2.6.1`
   * @remarks
   * 当 Tailwind 与 JS 字面量冲突时，可通过回调返回 `true` 保留当前值，返回 `false` 或 `undefined` 则继续转义。默认保留所有带 `*` 的字符串字面量。
   */
  jsPreserveClass?: (keyword: string) => boolean | undefined

  /**
   * 禁用默认的 `wxml` 模板替换器。
   *
   * @group 3.一般配置
   * @version `^2.6.2`
   * @remarks
   * 启用后模板匹配完全交由 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 管理，需要自行覆盖默认的 `class` / `hover-class` 等匹配规则。
   * @default false
   */
  disabledDefaultTemplateHandler?: boolean

  /**
   * 内部使用的运行时加载器路径。
   *
   * @ignore
   * @internal
   */
  runtimeLoaderPath?: string

  /**
   * 指定用于获取 Tailwind 上下文的路径。
   *
   * @group 3.一般配置
   * @version `^2.9.3`
   * @remarks
   * 在 linked 或 monorepo 场景下可手动指向目标项目的 `package.json` 所在目录。
   */
  tailwindcssBasedir?: string

  /**
   * 控制缓存策略。
   *
   * @group 3.一般配置
   * @version `^3.0.11`
   */
  cache?: boolean | ICreateCacheReturnType

  /**
   * `@babel/parser` 的配置选项。
   *
   * @version `^3.2.0`
   * @group 3.一般配置
   */
  babelParserOptions?: ParserOptions & { cache?: boolean }

  /**
   * 自定义 Tailwind 子组合器的替换值。
   *
   * @group 3.一般配置
   * @remarks
   * 为兼容小程序缺乏 `:not([hidden])~` 支持的限制，默认会将 `.space-x-4` 等选择器替换为 `view + view`。可传入字符串或字符串数组以扩展适用标签。
   * ```css
   * // 数组示例
   * .space-y-4>view + view,text + text{}
   *
   * // 字符串示例
   * .space-y-4>view,text,button,input ~ view,text,button,input{}
   * ```
   * @default 'view + view'
   */
  cssChildCombinatorReplaceValue?: string | string[]

  /**
   * `postcss` 的配置选项。
   *
   * @version `^3.2.0`
   * @group 3.一般配置
   */
  postcssOptions?: LoadedPostcssOptions
  /**
   * 是否移除 CSS 中的 `:hover` 选择器。
   *
   * @version `^3.2.1`
   * @group 3.一般配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/293
   * @remarks
   * 小程序不支持 `:hover`，需要使用组件的 `hover-class`，因此默认删除相关节点。
   * @default `true`
   */
  cssRemoveHoverPseudoClass?: boolean
  /**
   * 是否移除 `@property` 节点。
   *
   * @version `^4.1.2`
   * @group 3.一般配置
   * @remarks
   * 微信小程序可识别 `@property`，但支付宝暂不支持，默认移除以避免构建失败。
   * @default `true`
   */
  cssRemoveProperty?: boolean

  /**
   * 自定义 patcher 参数。
   *
   * @group 3.一般配置
   */
  tailwindcssPatcherOptions?: TailwindcssPatchOptions
  /**
   * 控制命令行日志输出级别。
   *
   * @group 3.一般配置
   * @remarks
   * 默认 `info`，可设置为 `silent` 屏蔽全部输出。
   */
  logLevel?: 'info' | 'warn' | 'error' | 'silent'
}

export type {
  TailwindcssPatchOptions,
}
