// 根据配置生成 calc 相关插件，支持小程序兼容参数
import type { PostCssCalcOptions } from '@weapp-tailwindcss/postcss-calc'
import type { AcceptedPlugin, Plugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import { analyzeCssCalcContext } from '../utils/css-calc-context'

function isSelected(name: string, includes: PostCssCalcOptions['includeCustomProperties']) {
  return includes?.some(entry => typeof entry === 'string'
    ? entry === name
    : new RegExp(entry.source, entry.flags).test(name)) ?? false
}

export function getCalcPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.cssCalc) {
    return null
  }
  const configured: PostCssCalcOptions = typeof options.cssCalc === 'object' && !Array.isArray(options.cssCalc)
    ? { ...options.cssCalc }
    : {}
  const includes = [...(Array.isArray(options.cssCalc) ? options.cssCalc : configured.includeCustomProperties) ?? []]
  const inputValues = options.customPropertyValues ?? configured.customPropertyValues
  const explicitValues = inputValues ? new Map(inputValues) : undefined
  const contextCss = options.customPropertyContextCss ?? ''
  const selectAll = options.cssCalc === true
  return {
    postcssPlugin: 'postcss-calc',
    prepare(result) {
      // prepare 早于主题选择器及层叠层改写，避免丢失作用域信息。
      const context = analyzeCssCalcContext(
        [contextCss, result.root.toString()].join('\n'),
        explicitValues,
      )
      return {
        Once(root, helpers) {
          const includeCustomProperties = [...context.customPropertyValues.keys()]
            .filter(name => selectAll || isSelected(name, includes))
          const plugin = postcssCalc({
            ...configured,
            customPropertyValues: context.customPropertyValues,
            includeCustomProperties,
          }) as Plugin
          return plugin.OnceExit?.(root, helpers)
        },
      }
    },
  }
}
