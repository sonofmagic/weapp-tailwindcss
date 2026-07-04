import type { Result } from 'postcss'
import type { IStyleHandlerOptions } from '../../types'
import { applyUniAppXBaseCompatibility } from '../../compat/uni-app-x'

export function postprocessUniAppXWebviewCss(result: Result, options: IStyleHandlerOptions) {
  return applyUniAppXBaseCompatibility(result, options)
}
