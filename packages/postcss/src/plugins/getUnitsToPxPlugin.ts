// 生成多单位转 px 的 PostCSS 插件
import type { AcceptedPlugin } from 'postcss'
import type { UserDefinedOptions as UnitsToPxOptions } from 'postcss-units-to-px'
import type { IStyleHandlerOptions } from '../types'
import postcssUnitsToPx from 'postcss-units-to-px'

export function getUnitsToPxPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.unitsToPx) {
    return null
  }

  const userOptions = typeof options.unitsToPx === 'object'
    ? options.unitsToPx as UnitsToPxOptions
    : undefined

  return postcssUnitsToPx(userOptions)
}
