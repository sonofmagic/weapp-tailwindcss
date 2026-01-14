/**
 * 禁用插件功能的细粒度选项。
 *
 * @group 0.重要配置
 * @since ^4.2.0
 * @remarks
 * 适用于需要仅关闭部分行为（例如主插件流程），但保留其他预处理能力（如 Tailwind v4 的 `@import "tailwindcss"` 重写）。
 */
export interface DisabledOptions {
  /**
   * 禁用主插件流程，等同于 `disabled: true`。
   *
   * @default false
   */
  plugin?: boolean
  /**
   * 禁用对 `@import "tailwindcss"` 的预处理重写。
   *
   * @default false
   */
  rewriteCssImports?: boolean
}
