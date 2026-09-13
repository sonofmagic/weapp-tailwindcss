// 根据配置生成 calc 相关插件，支持小程序兼容参数
import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'

const EMPTY_CALC_OPTIONS = {}

export function getCalcPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.cssCalc) {
    return null
  }

  if (options.cssCalc === true || Array.isArray(options.cssCalc)) {
    const calcOptions = Array.isArray(options.cssCalc)
      ? {
          includeCustomProperties: options.cssCalc,
          ...(options.customPropertyValues ? { customPropertyValues: options.customPropertyValues } : {}),
        }
      : options.customPropertyValues
        ? {
            customPropertyValues: options.customPropertyValues,
            includeCustomProperties: [...options.customPropertyValues.keys()],
          }
        : EMPTY_CALC_OPTIONS
    return postcssCalc(calcOptions)
  }

  return postcssCalc(
    {
      ...options.cssCalc,
      ...(options.customPropertyValues ? { customPropertyValues: options.customPropertyValues } : {}),
    },
  )
}
