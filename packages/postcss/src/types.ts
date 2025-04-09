import type { IMangleScopeContext } from '@weapp-tailwindcss/mangle'
import type { Rule } from 'postcss'
import type { Result } from 'postcss-load-config'
import type { pluginOptions as PresetEnvOptions } from 'postcss-preset-env'
import type { UserDefinedOptions as rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { IContext as PostcssContext } from './plugins/ctx'
import type { InjectPreflight } from './preflight'

export type LoadedPostcssOptions = Partial<Omit<Result, 'file'>>

export type CustomRuleCallback = (node: Rule, options: Readonly<UserDefinedPostcssOptions>) => void

export interface IPropValue {
  prop: string
  value: string
}

export type CssPreflightOptions =
  | {
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
>

export interface InternalCssSelectorReplacerOptions {
  mangleContext?: IMangleScopeContext
  escapeMap?: Record<string, string>
}

export type IStyleHandlerOptions = {
  customRuleCallback?: CustomRuleCallback
  mangleContext?: IMangleScopeContext
  ctx?: PostcssContext
  postcssOptions?: LoadedPostcssOptions
  cssRemoveProperty?: boolean
  cssRemoveHoverPseudoClass?: boolean
  cssPresetEnv?: PresetEnvOptions
  atRules?: {
    property?: boolean
    // A 新增 wxss 支持 @supports 反馈详情
    // https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html#2018.11.14
    supports?: boolean
    media?: boolean
  }
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
  rem2rpx?: boolean | rem2rpxOptions
  postcssOptions?: LoadedPostcssOptions
  cssRemoveHoverPseudoClass?: boolean
  cssRemoveProperty?: boolean
  customRuleCallback?: CustomRuleCallback
}
