import type { ITemplateHandlerOptions } from '../../../types'
import MagicString from 'magic-string'
import { parseExpression, traverse } from '../../../babel'
import { JsTokenUpdater } from '../../../js/JsTokenUpdater'
import { createLegacyTraverseOptions } from './legacy-visitor'

export function rewriteLegacyExpression(match: string, options: ITemplateHandlerOptions) {
  const ms = new MagicString(match)
  const ast = parseExpression(match)
  const jsTokenUpdater = new JsTokenUpdater()

  traverse(ast, createLegacyTraverseOptions(options, jsTokenUpdater))
  jsTokenUpdater.updateMagicString(ms)

  return ms.toString()
}
