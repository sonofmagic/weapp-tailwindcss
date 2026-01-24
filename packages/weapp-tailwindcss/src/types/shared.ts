import type { ItemOrItemArray } from './base'

export type AppType = 'uni-app' | 'uni-app-vite' | 'taro' | 'remax' | 'rax' | 'native' | 'kbone' | 'mpx' | 'weapp-vite'

export type ICustomAttributes
  = | Record<string, ItemOrItemArray<string | RegExp>>
    | Map<string | RegExp, ItemOrItemArray<string | RegExp>>

export type ICustomAttributesEntities = [string | RegExp, ItemOrItemArray<string | RegExp>][]

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
