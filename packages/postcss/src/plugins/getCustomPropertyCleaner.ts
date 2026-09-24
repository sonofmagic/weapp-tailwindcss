// 仅清理相邻的精确重复，不能用前置字面量推断运行时变量的取值。
import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'

export function getCustomPropertyCleaner(options: IStyleHandlerOptions): AcceptedPlugin | null {
  const includes = Array.isArray(options.cssCalc)
    ? options.cssCalc
    : typeof options.cssCalc === 'object'
      ? options.cssCalc.includeCustomProperties
      : undefined
  if (!includes?.length) {
    return null
  }
  return {
    postcssPlugin: 'postcss-remove-include-custom-properties',
    OnceExit(root) {
      root.walkDecls((decl) => {
        const previous = decl.prev()
        if (previous?.type === 'decl'
          && previous.prop === decl.prop
          && previous.important === decl.important
          && previous.value === decl.value) {
          decl.remove()
        }
      })
    },
  }
}
