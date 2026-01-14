import type { ITemplateHandlerOptions } from '../../types'
import { rewriteLegacyExpression } from './codegen/legacy-rewriter'

export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
  try {
    const { jsHandler, runtimeSet } = options
    if (jsHandler && runtimeSet) {
      const runHandler = (wrap?: boolean) => jsHandler(match, runtimeSet, wrap ? { wrapExpression: true } : undefined)
      const initial = runHandler(options.wrapExpression)
      if (!initial.error || options.wrapExpression) {
        return initial.code
      }
      const fallback = runHandler(true)
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
