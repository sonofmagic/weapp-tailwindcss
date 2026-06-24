import type { ItemOrItemArray } from '../base'
import type { AppType } from '../shared'

export type TransformRule = string | RegExp | ((id: string) => boolean)

export interface TransformOptions {
  /**
   * 只允许命中的源码模块或产物进入 `weapp-tailwindcss` 转译流程。
   *
   * @remarks
   * 未配置时不限制转译范围。字符串会按项目 root 相对 glob 或绝对 glob 匹配；`RegExp` 与函数接收绝对路径。
   */
  include?: ItemOrItemArray<TransformRule> | undefined
  /**
   * 排除不需要进入 `weapp-tailwindcss` 转译流程的源码模块或产物。
   *
   * @remarks
   * 字符串会按项目 root 相对 glob 或绝对 glob 匹配；`RegExp` 与函数接收绝对路径。
   */
  exclude?: ItemOrItemArray<TransformRule> | undefined
}

export interface UserDefinedOptionsMatcherPart {
  /**
   * 匹配需要处理的 `wxml` 等模板文件。
   *
   * @group 1.文件匹配
   */
  htmlMatcher?: ((name: string) => boolean) | undefined
  /**
   * 匹配需要处理的 `wxss` 等样式文件。
   *
   * @group 1.文件匹配
   */
  cssMatcher?: ((name: string) => boolean) | undefined
  /**
   * 匹配需要处理的编译后 `js` 文件。
   *
   * @group 1.文件匹配
   */
  jsMatcher?: ((name: string) => boolean) | undefined

  /**
   * 控制哪些源码模块或产物需要进入 `weapp-tailwindcss` 转译流程。
   *
   * @group 1.文件匹配
   * @remarks
   * 该配置只影响 `weapp-tailwindcss` 的 HTML/CSS/JS 转译，不影响 Tailwind CSS `@source`/content token 扫描。
   * Vite 构建中 JS chunk 会基于 Rollup `moduleIds`/`modules` 判断源码模块；当一个 JS chunk 不满足 `include` 或所有源码模块都命中 `exclude` 时，跳过该 chunk 的 JS AST 转译。
   * HTML/CSS asset 会优先基于 Rollup `originalFileName`/`originalFileNames` 判断，缺失时使用输出文件名兜底。
   * `exclude` 优先级高于 `include`；多来源产物只有全部来源都命中 `exclude` 时才整体跳过。
   *
   * @example
   * ```ts
   * transform: {
   *   include: ['src/**.{wxml,js,ts,vue,css,scss}'],
   *   exclude: ['src/generated/**', /\/openapi\//],
   * }
   * ```
   */
  transform?: TransformOptions | undefined
  /**
   * 声明负责承载 Tailwind CSS 全局变量作用域的 CSS Bundle。
   *
   * @group 1.文件匹配
   * @remarks
   * 默认不根据框架、平台或文件名推断主样式。需要主样式语义时，应由用户按当前构建图中的真实产物名显式返回 `true`。
   * 可结合 `appType`、环境变量或框架配置自行区分不同端。
   */
  mainCssChunkMatcher?: ((name: string, appType?: AppType) => boolean) | undefined

  /**
   * 匹配各端的 `wxs`/`sjs`/`.filter.js` 文件。
   *
   * @group 1.文件匹配
   * @experimental 实验性质，有可能会改变
   * @remarks
   * 配置前请确保在 `tailwind.config.js` 的 `content` 中包含对应格式。
   * @default ()=>false
   */
  wxsMatcher?: ((name: string) => boolean) | undefined

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
  inlineWxs?: boolean | undefined
}
