import type { CssPreflightOptions } from '../../types'

export interface FinalizeMiniProgramCssOptions {
  cssPreflight?: CssPreflightOptions | undefined
  preservePseudoContentInit?: boolean
  isTailwindcssV4?: boolean | undefined
}
