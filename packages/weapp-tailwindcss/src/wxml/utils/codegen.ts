import type { CreateJsHandlerOptions, ITemplateHandlerOptions } from '../../types'
import { rewriteLegacyExpression } from './codegen/legacy-rewriter'

const WRAP_EXPRESSION_HANDLER_OPTIONS: CreateJsHandlerOptions = Object.freeze({
  wrapExpression: true,
})

export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
  try {
    const { jsHandler, runtimeSet, wrapExpression } = options
    if (jsHandler && runtimeSet) {
      const initial = jsHandler(
        match,
        runtimeSet,
        wrapExpression ? WRAP_EXPRESSION_HANDLER_OPTIONS : undefined,
      )
      if (!initial.error || wrapExpression) {
        return initial.code
      }
      const fallback = jsHandler(match, runtimeSet, WRAP_EXPRESSION_HANDLER_OPTIONS)
      return fallback.code
    }
    else {
      /**
       * @deprecated
       */
      return rewriteLegacyExpression(match, options)
    }
  }
  catch {
    // 参考：https://github.com/sonofmagic/weapp-tailwindcss/issues/274
    // {{class}}
    return match
  }
}
