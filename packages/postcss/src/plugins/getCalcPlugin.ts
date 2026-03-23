// 根据配置生成 calc 相关插件，支持小程序兼容参数
import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import { omit } from 'es-toolkit'

const EMPTY_CALC_OPTIONS = {}

export function getCalcPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.cssCalc) {
    return null
  }

  if (options.cssCalc === true || Array.isArray(options.cssCalc)) {
    return postcssCalc(EMPTY_CALC_OPTIONS)
  }

  return postcssCalc(
    omit(options.cssCalc, ['includeCustomProperties']),
  )
}
