import type MagicString from 'magic-string'
import type { ITemplateHandlerOptions } from '../../types'
import type { Token } from '../Tokenizer'
import {
  updateExpressionSegment,
  updateWhitespaceGap,
  updateWxmlSegment,
} from './fragment-helpers'

export function handleEachClassFragment(ms: MagicString, tokens: Token[], options: ITemplateHandlerOptions = {}) {
  let previousEnd = 0
  for (const token of tokens) {
    if (token.start > previousEnd) {
      updateWhitespaceGap(ms, previousEnd, token.start, options)
    }
    let p = token.start
    if (token.expressions.length > 0) {
      for (const exp of token.expressions) {
        if (exp.start > token.start && p < exp.start) {
          updateWxmlSegment(ms, p, exp.start, options, true, p > 0)
        }
        updateExpressionSegment(ms, exp, options)
        p = exp.end
      }
      if (token.end > p) {
        updateWxmlSegment(ms, p, token.end, options, false, true)
      }
    }
    else {
      updateWxmlSegment(ms, token.start, token.end, options, false, false)
    }
    previousEnd = token.end
  }

  if (tokens.length > 0) {
    const lastToken = tokens[tokens.length - 1]
    if (lastToken.end < ms.original.length) {
      updateWhitespaceGap(ms, lastToken.end, ms.original.length, options)
    }
  }
}
