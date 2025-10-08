import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import { omit } from 'es-toolkit'

export function getCalcPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.cssCalc) {
    return null
  }

  const calcOptions = Array.isArray(options.cssCalc)
    ? {}
    : typeof options.cssCalc === 'object'
      ? omit(options.cssCalc, ['includeCustomProperties'])
      : {}

  return postcssCalc(calcOptions)
}
