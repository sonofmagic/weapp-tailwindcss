import type { CssPreflightOptions } from '../../types'

export interface FinalizeMiniProgramCssOptions {
  cssPreflight?: CssPreflightOptions | undefined
  preservePseudoContentInit?: boolean
  isTailwindcssV4?: boolean | undefined
  /**
   * 是否为 Tailwind CSS v4 渐变工具类生成小程序字面量兜底。
   */
  tailwindcssV4GradientFallback?: boolean | undefined
}
