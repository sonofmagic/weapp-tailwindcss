// 核心类型定义，描述样式处理流程所需的选项与工具类型
import type { PostCssCalcOptions } from '@weapp-tailwindcss/postcss-calc'
import type { Result as PostcssResult } from 'postcss'
import type { Result } from 'postcss-load-config'
import type { pluginOptions as PresetEnvOptions } from 'postcss-preset-env'
import type { PxTransformOptions as Px2rpxOptions } from 'postcss-pxtrans'
import type { UserDefinedOptions as Rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { UserDefinedOptions as UnitsToPxOptions } from 'postcss-units-to-px'
import type { StyleProcessingPipeline } from './pipeline'
import type { IContext as PostcssContext } from './plugins/ctx'
import type { InjectPreflight } from './preflight'

export type LoadedPostcssOptions = Partial<Omit<Result, 'file'>>

export interface IPropValue {
  prop: string
  value: string
}

export type CssPreflightOptions
  = | {
    [key: string]: string | number | boolean
  }
  | false

export type RequiredStyleHandlerOptions = {
  /**
   * @description 默认为 true，此时会对样式主文件，进行猜测
   */
  isMainChunk?: boolean
  cssPreflight?: CssPreflightOptions
  cssInjectPreflight?: InjectPreflight
  escapeMap?: Record<string, string>
} & Pick<
  UserDefinedPostcssOptions,
  | 'cssPreflightRange'
  | 'cssChildCombinatorReplaceValue'
  | 'injectAdditionalCssVarScope'
  | 'cssSelectorReplacement'
  | 'rem2rpx'
  | 'px2rpx'
  | 'unitsToPx'
>

export interface InternalCssSelectorReplacerOptions {
  escapeMap?: Record<string, string>
}

interface CssCalcOptions extends PostCssCalcOptions {
  includeCustomProperties?: (string | RegExp)[]
}

export type IStyleHandlerOptions = {
  ctx?: PostcssContext
  postcssOptions?: LoadedPostcssOptions
  cssRemoveProperty?: boolean
  cssRemoveHoverPseudoClass?: boolean
  cssPresetEnv?: PresetEnvOptions
  cssCalc?: boolean | CssCalcOptions | (string | RegExp)[]
  atRules?: {
    property?: boolean
    // A 新增 wxss 支持 @supports 反馈详情
    // https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html#2018.11.14
    supports?: boolean
    media?: boolean
  }
  uniAppX?: boolean
  majorVersion?: number
} & RequiredStyleHandlerOptions

export interface UserDefinedPostcssOptions {
  cssPreflight?: CssPreflightOptions
  cssPreflightRange?: 'all'
  cssChildCombinatorReplaceValue?: string | string[]
  cssPresetEnv?: PresetEnvOptions
  injectAdditionalCssVarScope?: boolean
  cssSelectorReplacement?: {
    root?: string | string[] | false
    universal?: string | string[] | false
  }
  rem2rpx?: boolean | Rem2rpxOptions
  px2rpx?: boolean | Px2rpxOptions
  unitsToPx?: boolean | UnitsToPxOptions
  postcssOptions?: LoadedPostcssOptions
  cssRemoveHoverPseudoClass?: boolean
  cssRemoveProperty?: boolean
  uniAppX?: boolean
}

export type {
  CssCalcOptions,
  PresetEnvOptions,
  Px2rpxOptions,
  Rem2rpxOptions,
  UnitsToPxOptions,
}

export interface StyleHandler {
  (rawSource: string, opt?: Partial<IStyleHandlerOptions>): Promise<PostcssResult>
  // getPipeline 允许外部在不同配置下获取预组装的流水线信息
  getPipeline: (opt?: Partial<IStyleHandlerOptions>) => StyleProcessingPipeline
}
