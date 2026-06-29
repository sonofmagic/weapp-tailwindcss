// 核心类型定义，描述样式处理流程所需的选项与工具类型
import type { PostCssCalcOptions } from '@weapp-tailwindcss/postcss-calc'
import type { Result as PostcssResult } from 'postcss'
import type { Result } from 'postcss-load-config'
import type { PxTransformOptions as Px2rpxOptions } from 'postcss-pxtrans'
import type { UserDefinedOptions as Rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { GlobalUnitTransform, UserDefinedOptions as UnitConverterOptions, UnitMap } from 'postcss-rule-unit-converter'
import type { WeappAutoprefixerOptions } from './autoprefixer'
import type { StyleProcessingPipeline } from './pipeline'
import type { IContext as PostcssContext } from './plugins/ctx'
import type { InjectPreflight } from './preflight'
import type { PresetEnvOptions } from './preset-env-options'

export type LoadedPostcssOptions = Partial<Omit<Result, 'file'>>

export interface IPropValue {
  prop: string
  value: string
}

export type UniAppXCssTarget = 'uvue'

export type UniAppXUnsupportedMode = 'error' | 'warn' | 'silent'

export type CssPreflightOptions
  = | {
    [key: string]: string | number | boolean
  }
  | false

export type RequiredStyleHandlerOptions = {
  /**
   * @description 默认为 true，此时会对样式主文件，进行猜测
   */
  isMainChunk?: boolean | undefined
  cssPreflight?: CssPreflightOptions | undefined
  cssInjectPreflight?: InjectPreflight | undefined
  escapeMap?: Record<string, string> | undefined
} & Pick<
  UserDefinedPostcssOptions,
  | 'cssPreflightRange'
  | 'cssChildCombinatorReplaceValue'
  | 'injectAdditionalCssVarScope'
  | 'cssSelectorReplacement'
  | 'rem2rpx'
  | 'px2rpx'
  | 'unitsToPx'
  | 'unitConversion'
>

export interface InternalCssSelectorReplacerOptions {
  escapeMap?: Record<string, string> | undefined
}

interface CssCalcOptions extends PostCssCalcOptions {
  includeCustomProperties?: (string | RegExp)[]
}

export interface UnitsToPxOptions extends Pick<
  UnitConverterOptions,
  | 'disabled'
  | 'exclude'
  | 'mediaQuery'
  | 'propList'
  | 'replace'
  | 'selectorBlackList'
  | 'unitPrecision'
> {
  minValue?: number
  to?: string
  unitMap?: UnitMap
  transform?: GlobalUnitTransform | false
}

export type UnitConversionConfig = UnitConverterOptions

export type UnitConversionPlatformMap = Record<string, UnitConversionConfig | false | undefined>

export interface PlatformUnitConversionOptions {
  /**
   * 未匹配到具体平台时使用的兜底转换规则。
   */
  default?: UnitConversionConfig | false | undefined
  /**
   * 按平台名称配置转换规则，平台键会做小写归一化并兼容常见别名。
   */
  platforms: UnitConversionPlatformMap
}

export type UnitConversionOptions = UnitConversionConfig | PlatformUnitConversionOptions | false

export interface CssSelectorReplacement {
  root?: string | string[] | false | undefined
  universal?: string | string[] | false | undefined
}

export interface CssAtRules {
  property?: boolean | undefined
  // A 新增 wxss 支持 @supports 反馈详情
  // https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html#2018.11.14
  supports?: boolean | undefined
  media?: boolean | undefined
}

export type WebCssCompatPreset = 'off' | 'legacy-web'

/**
 * Web 兼容降级的功能开关。
 */
export interface WebCssCompatFeatures {
  /**
   * 降级 Tailwind CSS v4 `@theme` 变量规则。
   */
  theme?: boolean | undefined
  /**
   * 移除或展平 `@layer`，避免旧 WebView 对层叠层支持不足。
   */
  layer?: boolean | undefined
  /**
   * 移除 `@property`，避免旧 WebView 解析失败。
   */
  property?: boolean | undefined
  /**
   * 展开 CSS nesting 语法。
   */
  nesting?: boolean | undefined
  /**
   * 为 `oklch()` 颜色补充兼容声明。
   */
  oklch?: boolean | undefined
  /**
   * 为现代颜色函数补充兼容声明。
   */
  colorFunctions?: boolean | undefined
  /**
   * 处理 Tailwind CSS v4 生成的 `@supports` 包裹。
   */
  supports?: boolean | undefined
}

export interface WebCssCompatOptions {
  /**
   * 兼容预设。`legacy-web` 面向旧 Android/iOS WebView，`off` 表示关闭降级。
   */
  preset?: WebCssCompatPreset | undefined
  /**
   * 按功能覆盖预设中的降级开关。
   */
  features?: WebCssCompatFeatures | undefined
}

export type WebCssCompatUserOptions = boolean | WebCssCompatOptions

export interface CssOptions {
  cssPreflight?: CssPreflightOptions | undefined
  cssPreflightRange?: 'all' | undefined
  cssChildCombinatorReplaceValue?: string | string[] | undefined
  cssPresetEnv?: PresetEnvOptions | undefined
  autoprefixer?: WeappAutoprefixerOptions | undefined
  atRules?: CssAtRules | undefined
  injectAdditionalCssVarScope?: boolean | undefined
  cssSelectorReplacement?: CssSelectorReplacement | undefined
  rem2rpx?: boolean | Rem2rpxOptions | undefined
  px2rpx?: boolean | Px2rpxOptions | undefined
  unitsToPx?: boolean | UnitsToPxOptions | undefined
  unitConversion?: UnitConversionOptions | undefined
  platform?: string | undefined
  cssRemoveHoverPseudoClass?: boolean | undefined
  cssRemoveProperty?: boolean | undefined
  cssCalc?: boolean | CssCalcOptions | (string | RegExp)[] | undefined
  /**
   * 是否显式追加 Tailwind CSS v4 渐变字面量组合兜底。
   */
  tailwindcssV4GradientFallback?: boolean | undefined
}

export type IStyleHandlerOptions = {
  ctx?: PostcssContext | undefined
  /**
   * @deprecated 请使用 `cssOptions.platform`。
   */
  platform?: string | undefined
  postcssOptions?: LoadedPostcssOptions | undefined
  cssOptions?: CssOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssRemoveProperty`。
   */
  cssRemoveProperty?: boolean | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssRemoveHoverPseudoClass`。
   */
  cssRemoveHoverPseudoClass?: boolean | undefined
  /**
   * @deprecated 请使用 `cssOptions.tailwindcssV4GradientFallback`。
   */
  tailwindcssV4GradientFallback?: boolean | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssPresetEnv`。
   */
  cssPresetEnv?: PresetEnvOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.atRules`。
   */
  atRules?: CssAtRules | undefined
  /**
   * @deprecated 请使用 `cssOptions.autoprefixer`。
   */
  autoprefixer?: WeappAutoprefixerOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssCalc`。
   */
  cssCalc?: boolean | CssCalcOptions | (string | RegExp)[] | undefined
  uniAppX?: boolean | undefined
  uniAppXCssTarget?: UniAppXCssTarget | undefined
  uniAppXUnsupported?: UniAppXUnsupportedMode | undefined
  majorVersion?: 4 | undefined
} & RequiredStyleHandlerOptions

export interface UserDefinedPostcssOptions {
  /**
   * @deprecated 请使用 `cssOptions.cssPreflight`。
   */
  cssPreflight?: CssPreflightOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssPreflightRange`。
   */
  cssPreflightRange?: 'all' | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssChildCombinatorReplaceValue`。
   */
  cssChildCombinatorReplaceValue?: string | string[] | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssPresetEnv`。
   */
  cssPresetEnv?: PresetEnvOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.autoprefixer`。
   */
  autoprefixer?: WeappAutoprefixerOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.injectAdditionalCssVarScope`。
   */
  injectAdditionalCssVarScope?: boolean | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssSelectorReplacement`。
   */
  cssSelectorReplacement?: CssSelectorReplacement | undefined
  /**
   * @deprecated 请使用 `cssOptions.rem2rpx`。
   */
  rem2rpx?: boolean | Rem2rpxOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.px2rpx`。
   */
  px2rpx?: boolean | Px2rpxOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.unitsToPx`。
   */
  unitsToPx?: boolean | UnitsToPxOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.unitConversion`。
   */
  unitConversion?: UnitConversionOptions | undefined
  postcssOptions?: LoadedPostcssOptions | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssRemoveHoverPseudoClass`。
   */
  cssRemoveHoverPseudoClass?: boolean | undefined
  /**
   * @deprecated 请使用 `cssOptions.cssRemoveProperty`。
   */
  cssRemoveProperty?: boolean | undefined
  /**
   * CSS 生成与兼容后处理的微调配置。
   *
   * `cssPreflight`、`cssPreflightRange`、`cssChildCombinatorReplaceValue`、`cssPresetEnv`、`autoprefixer`、
   * `atRules`、`injectAdditionalCssVarScope`、`cssSelectorReplacement`、`rem2rpx`、`px2rpx`、`unitsToPx`、
   * `unitConversion`、`platform`、`cssRemoveHoverPseudoClass`、`cssRemoveProperty`、`cssCalc`
   * 与 `tailwindcssV4GradientFallback` 都推荐放在这里。
   */
  cssOptions?: CssOptions | undefined
  /**
   * 是否显式追加 Tailwind CSS v4 渐变字面量组合兜底。
   *
   * @deprecated 请使用 `cssOptions.tailwindcssV4GradientFallback`。
   */
  tailwindcssV4GradientFallback?: boolean | undefined
  uniAppX?: boolean | undefined
  uniAppXCssTarget?: UniAppXCssTarget | undefined
  uniAppXUnsupported?: UniAppXUnsupportedMode | undefined
}

export type {
  CssCalcOptions,
  PresetEnvOptions,
  Px2rpxOptions,
  Rem2rpxOptions,
  WeappAutoprefixerOptions,
}

export interface StyleHandler {
  (rawSource: string, opt?: Partial<IStyleHandlerOptions>): Promise<PostcssResult>
  // getPipeline 允许外部在不同配置下获取预组装的流水线信息
  getPipeline: (opt?: Partial<IStyleHandlerOptions>) => StyleProcessingPipeline
}
