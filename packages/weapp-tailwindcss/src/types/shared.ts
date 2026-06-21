import type { ItemOrItemArray } from './base'

export type AppType = 'uni-app' | 'uni-app-vite' | 'uni-app-x' | 'taro' | 'remax' | 'native' | 'kbone' | 'mpx' | 'weapp-vite'

export type ICustomAttributes
  = | Record<string, ItemOrItemArray<string | RegExp>>
    | Map<string | RegExp, ItemOrItemArray<string | RegExp>>

export type ICustomAttributesEntities = [string | RegExp, ItemOrItemArray<string | RegExp>][]

export interface IArbitraryValues {
  /**
   * @deprecated 双引号任意值现在默认按括号上下文识别，该选项仅为兼容旧配置保留。
   *
   * @example
   * ```html
   * <view class="after:content-['对酒当歌，人生几何']"></view>
   * <view class="after:content-[\"对酒当歌，人生几何\"]"></view>
   * ```
   *
   * @default `false`
   */
  allowDoubleQuotes?: boolean

  /**
   * 是否启用 UnoCSS 风格裸任意值。
   *
   * @remarks
   * 开启后会在 Tailwind CSS v4 生成链路识别 `p-10%`、`p-2.5px`、
   * `m-4rem`、`bg-#fff`、`text-rgb(255,0,0)` 等裸任意值。JS 转译仍遵循
   * `classNameSet` 精确命中原则。
   *
   * @default `false`
   */
  bareArbitraryValues?: boolean | {
    /**
     * 允许作为裸任意值的单位列表。
     */
    units?: string[]
  }
}

export interface IUnocssCompatibilityOptions {
  /**
   * 是否启用 UnoCSS 风格裸任意值。
   *
   * @remarks
   * 开启后会在 Tailwind CSS v4 生成链路识别 `p-10%`、`bg-#fff`、
   * `text-rgb(255,0,0)` 等写法。
   *
   * @default `true`
   */
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues']
}
