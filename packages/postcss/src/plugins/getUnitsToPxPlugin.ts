// 生成多单位转 px 的 PostCSS 插件
import type { AcceptedPlugin } from 'postcss'
import type { UserDefinedOptions as UnitConverterOptions, UnitMapPresetOptions } from 'postcss-rule-unit-converter'
import type { IStyleHandlerOptions, UnitsToPxOptions } from '../types'
import postcssUnitConverter, { presets } from 'postcss-rule-unit-converter'

export function getUnitsToPxPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.unitsToPx) {
    return null
  }

  const userOptions = typeof options.unitsToPx === 'object'
    ? options.unitsToPx as UnitsToPxOptions
    : undefined

  if (userOptions?.disabled || userOptions?.transform === false) {
    return postcssUnitConverter({ disabled: true })
  }

  const presetOptions: UnitMapPresetOptions = {}
  const converterOptions: UnitConverterOptions = {
    rules: [],
  }

  if (userOptions?.minValue !== undefined) {
    presetOptions.minValue = userOptions.minValue
    converterOptions.minValue = userOptions.minValue
  }
  if (userOptions?.to !== undefined) {
    presetOptions.to = userOptions.to
  }
  if (userOptions?.transform !== undefined) {
    presetOptions.transform = userOptions.transform
  }
  if (userOptions?.unitMap !== undefined) {
    presetOptions.unitMap = userOptions.unitMap
  }
  if (userOptions?.exclude !== undefined) {
    converterOptions.exclude = userOptions.exclude
  }
  if (userOptions?.mediaQuery !== undefined) {
    converterOptions.mediaQuery = userOptions.mediaQuery
  }
  if (userOptions?.propList !== undefined) {
    converterOptions.propList = userOptions.propList
  }
  if (userOptions?.replace !== undefined) {
    converterOptions.replace = userOptions.replace
  }
  if (userOptions?.selectorBlackList !== undefined) {
    converterOptions.selectorBlackList = userOptions.selectorBlackList
  }
  if (userOptions?.unitPrecision !== undefined) {
    converterOptions.unitPrecision = userOptions.unitPrecision
  }

  converterOptions.rules = presets.unitsToPx(presetOptions)

  return postcssUnitConverter(converterOptions)
}
