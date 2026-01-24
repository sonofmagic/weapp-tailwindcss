import type {
  CssCalcOptions,
  CssPreflightOptions,
  PresetEnvOptions,
  Px2rpxOptions,
  Rem2rpxOptions,
} from '@weapp-tailwindcss/postcss'
import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { ICustomAttributes } from '../types'
import type { DisabledOptions } from './disabled-options'

interface UserDefinedOptionsImportantPart {

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
  disabled?: boolean | DisabledOptions

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
   * @since ^4.0.0
   * @group 0.重要配置
   * @remarks
   * 当模板字符串被这些标识符包裹时，将跳过转义处理。
   * @default ['weappTwIgnore']
   */
  ignoreTaggedTemplateExpressionIdentifiers?: (string | RegExp)[]
  /**
   * 忽略指定调用表达式中的标识符。
   *
   * @since ^4.0.0
   * @group 0.重要配置
   * @remarks
   * 使用这些方法包裹的模板字符串或字符串字面量会跳过转义，常与 `@weapp-tailwindcss/merge` 配合（如 `['twMerge', 'twJoin', 'cva']`）。
   */
  ignoreCallExpressionIdentifiers?: (string | RegExp)[]

  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------Postcss-----------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  /**
   * 控制在视图节点上注入的 CSS 预设。
   *
   * @group 0.重要配置
   * @see https://github.com/sonofmagic/weapp-tailwindcss/issues/7
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
   * @see https://github.com/sonofmagic/weapp-tailwindcss/pull/62
   * @remarks
   * 仅 `view`、`text` 及其伪元素会受影响。设置为 `'all'` 可以覆盖所有元素，此时需自行处理与宿主默认样式的冲突。
   */
  cssPreflightRange?: 'all'
  /**
   * 预计算 CSS 变量或 `calc` 表达式的结果。
   *
   * @group 0.重要配置
   * @since ^4.3.0
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
   * @since ^2.6.0
   * @remarks
   * 当构建链路（例如 `@tarojs/plugin-html`）移除了包含 `*` 的选择器时，可启用该选项重新写入变量作用域，以避免渐变等功能失效。
   * @default false
   */
  injectAdditionalCssVarScope?: boolean
  /**
   * 是否在 webpack/vite 阶段自动把 CSS 中的 `@import 'tailwindcss'` 映射为 `weapp-tailwindcss`。
   *
   * @group 0.重要配置
   * @remarks
   * 开启后打包链路只会在处理样式时拦截 `tailwindcss` 的导入路径（JS/TS `import 'tailwindcss'` 不会被修改），让源码可以继续写 `@import 'tailwindcss';`，同时输出 weapp-tailwindcss 的样式。传入 `false` 可完全关闭该行为。
   * @default true
   */
  rewriteCssImports?: boolean
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
     * @see https://github.com/sonofmagic/weapp-tailwindcss/issues/81 <br/>
     * @default `['view','text']` <br/>
     * @remarks
     * 小程序环境不支持 `*`，因此默认转换为 `view`、`text`；设置为 `false` 会留下原始选择器。
     */
    universal?: string | string[] | false
  }
  /**
   * rem 到 rpx 的转换配置。
   *
   * @since ^3.0.0
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
   * @since ^4.3.0
   * @remarks
   * 传入 `true` 启用默认映射（`1px = 1rpx`），或通过对象自定义更多行为。
   */
  px2rpx?: boolean | Px2rpxOptions

  /**
   * `postcss-preset-env` 的配置项。
   *
   * @since ^4.0.0
   * @group 0.重要配置
   * @see https://preset-env.cssdb.org/
   * @see https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme
   */
  cssPresetEnv?: PresetEnvOptions

  /**
   * 为不同版本的 Tailwind 配置行为。
   *
   * @since ^4.0.0
   * @group 0.重要配置
   */
  tailwindcss?: TailwindcssPatchOptions['tailwind']

  /**
   * 指定 tailwindcss@4 的入口 CSS。
   *
   * @since ^4.2.6
   * @group 0.重要配置
   * @remarks
   * 未配置时无法加载自定义插件，等价于设置 `tailwindcss.v4.cssEntries`。
   */
  cssEntries?: string[]
  /**
   * 配置 uni-app x 场景的行为。
   *
   * @since ^4.2.0
   * @group 0.重要配置
   * @ignore
   */
  uniAppX?: boolean
}

declare module '../typedoc.export' {
  // 0.重要配置
  export interface UserDefinedOptions extends UserDefinedOptionsImportantPart {}
}

declare module 'weapp-tailwindcss/types' {
  export interface UserDefinedOptions extends UserDefinedOptionsImportantPart {}
}
