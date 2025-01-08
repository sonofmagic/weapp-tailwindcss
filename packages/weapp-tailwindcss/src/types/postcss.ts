import type { Rule } from 'postcss'
import type { Result } from 'postcss-load-config'
import type { UserDefinedOptions as rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { IContext as PostcssContext } from '../postcss/plugins/ctx'
import type { InjectPreflight } from '../postcss/preflight'
import type { IMangleScopeContext } from './mangle'

export type LoadedPostcssOptions = Partial<Omit<Result, 'file'>>

export type CssPresetProps = string

export type CustomRuleCallback = (node: Rule, options: Readonly<UserDefinedPostcssOptions>) => void

export type CssPreflightOptions =
  | {
    [key: CssPresetProps]: string | number | boolean
  }
  | false

export type RequiredStyleHandlerOptions = {
  /**
   * @description 默认为 true，此时会对样式主文件，进行猜测
   */
  isMainChunk?: boolean
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
  cssRemoveHoverPseudoClass?: boolean
} & RequiredStyleHandlerOptions

// | 'cssPreflightRange'
// | 'cssChildCombinatorReplaceValue'
// | 'injectAdditionalCssVarScope'
// | 'cssSelectorReplacement'
// | 'rem2rpx'
export interface UserDefinedPostcssOptions {

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
   * @group 0.重要配置
   * @description 用于处理 css 选择器的替换规则
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
   * @version `^3.0.0`
   * @group 0.重要配置
   * @description rem 转 rpx 配置，默认为 `undefined` 不开启，可传入 `true` 启用默认配置项，也可传入自定义配置项，配置项列表见 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)
   */
  rem2rpx?: boolean | rem2rpxOptions

  /**
   * @version `^3.2.0`
   * @group 3.一般配置
   * @description 对解析 css 使用的 `postcss` 工具的配置
   */
  postcssOptions?: LoadedPostcssOptions
  /**
   * @version `^3.2.1`
   * @group 3.一般配置
   * @issue https://github.com/sonofmagic/weapp-tailwindcss/issues/293
   * @default `true`
   * @description 是否删除 css :hover 选择器节点，默认为 `true`, 原因在于，小程序 css :hover 是不生效的，要使用 view 这种标签的 hover-class 属性
   */
  cssRemoveHoverPseudoClass?: boolean

  /**
   * @group 3.一般配置
   * @description 用于自定义处理 css 的回调函数，可根据 Postcss walk 方法自由定制处理方案的 callback 方法
   */
  customRuleCallback?: CustomRuleCallback
}
