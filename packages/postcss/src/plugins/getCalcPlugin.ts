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
    Once(root, helpers) {
      // 上游作者插件阶段已经完成；在主题作用域和单位改写前读取当前 AST。
      const context = analyzeCssCalcContext([contextCss, root.toString()].join('\n'), explicitValues)
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
}
