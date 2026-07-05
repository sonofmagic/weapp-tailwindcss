import type { Result } from 'postcss'
import type { IStyleHandlerOptions } from '../../types'
import { applyUniAppXBaseCompatibility } from '../../compat/uni-app-x'
import { applyUniAppXUvueCompatibility } from '../../compat/uni-app-x-uvue'

export function postprocessUniAppXUvueCss(result: Result, options: IStyleHandlerOptions) {
  return applyUniAppXUvueCompatibility(
    applyUniAppXBaseCompatibility(result, options),
    options,
  )
}
