import type { AppType } from '../types'

interface UserDefinedOptionsMatcherPart {
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
   * @experimental 实验性质，有可能会改变
   * @remarks
   * 配置前请确保在 `tailwind.config.js` 的 `content` 中包含对应格式。
   * @default ()=>false
   */
  wxsMatcher?: (name: string) => boolean

  /**
   * 是否转义 `wxml` 中的内联 `wxs`。
   *
   * @group 1.文件匹配
   * @experimental 实验性质，有可能会改变
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

declare module '../typedoc.export' {
  // 1.文件匹配
  export interface UserDefinedOptions extends UserDefinedOptionsMatcherPart {}
}

declare module 'weapp-tailwindcss/types' {
  export interface UserDefinedOptions extends UserDefinedOptionsMatcherPart {}
}
