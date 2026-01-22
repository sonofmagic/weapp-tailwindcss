// 清理由 cssCalc 引入的重复声明，避免输出冗余属性
import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'

export function getCalcDuplicateCleaner(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.cssCalc) {
    return null
  }

  return {
    postcssPlugin: 'postcss-calc-duplicate-cleaner',
    Rule(rule) {
      rule.walkDecls((decl) => {
        const prev = decl.prev()
        if (!prev || prev.type !== 'decl') {
          return
        }

        if (prev.prop !== decl.prop) {
          return
        }

        if (prev.important !== decl.important) {
          return
        }

        if (prev.value !== decl.value) {
          return
        }

        decl.remove()
      })
    },
  }
}
