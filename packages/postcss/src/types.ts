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

export interface CssOptions {
  /**
   * 是否显式追加 Tailwind CSS v4 渐变字面量组合兜底。
   */
  tailwindcssV4GradientFallback?: boolean | undefined
}

export type IStyleHandlerOptions = {
  ctx?: PostcssContext | undefined
  platform?: string | undefined
  postcssOptions?: LoadedPostcssOptions | undefined
  cssOptions?: CssOptions | undefined
  cssRemoveProperty?: boolean | undefined
  cssRemoveHoverPseudoClass?: boolean | undefined
  /**
   * @deprecated 请使用 `cssOptions.tailwindcssV4GradientFallback`。
   */
  tailwindcssV4GradientFallback?: boolean | undefined
  cssPresetEnv?: PresetEnvOptions | undefined
  autoprefixer?: WeappAutoprefixerOptions | undefined
  cssCalc?: boolean | CssCalcOptions | (string | RegExp)[] | undefined
  atRules?: {
    property?: boolean | undefined
    // A 新增 wxss 支持 @supports 反馈详情
    // https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html#2018.11.14
    supports?: boolean | undefined
    media?: boolean | undefined
  } | undefined
  uniAppX?: boolean | undefined
  uniAppXCssTarget?: UniAppXCssTarget | undefined
  uniAppXUnsupported?: UniAppXUnsupportedMode | undefined
  majorVersion?: number | undefined
} & RequiredStyleHandlerOptions

export interface UserDefinedPostcssOptions {
  cssPreflight?: CssPreflightOptions | undefined
  cssPreflightRange?: 'all' | undefined
  cssChildCombinatorReplaceValue?: string | string[] | undefined
  cssPresetEnv?: PresetEnvOptions | undefined
  autoprefixer?: WeappAutoprefixerOptions | undefined
  injectAdditionalCssVarScope?: boolean | undefined
  cssSelectorReplacement?: {
    root?: string | string[] | false | undefined
    universal?: string | string[] | false | undefined
  } | undefined
  rem2rpx?: boolean | Rem2rpxOptions | undefined
  px2rpx?: boolean | Px2rpxOptions | undefined
  unitsToPx?: boolean | UnitsToPxOptions | undefined
  unitConversion?: UnitConversionOptions | undefined
  postcssOptions?: LoadedPostcssOptions | undefined
  cssRemoveHoverPseudoClass?: boolean | undefined
  cssRemoveProperty?: boolean | undefined
  /**
   * CSS 生成与兼容后处理的微调配置。
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
