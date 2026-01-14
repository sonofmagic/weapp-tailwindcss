import type { TraverseOptions } from '@babel/traverse'
import type { StringLiteral } from '@babel/types'
import type { JsTokenUpdater } from '../../../js/JsTokenUpdater'
import type { ITemplateHandlerOptions } from '../../../types'
import * as t from '@babel/types'
import { replaceHandleValue } from '../../../js/handlers'

function shouldSkipLegacyStringLiteral(path: import('@babel/traverse').NodePath<StringLiteral>) {
  // [g['人生']==='你好啊'?'highlight':'']
  if (t.isMemberExpression(path.parent)) {
    return true
  }
  // parentPath maybe null
  // ['td',[(g.type==='你好啊')?'highlight':'']]
  return Boolean(
    t.isBinaryExpression(path.parent)
    && (t.isConditionalExpression(path.parentPath?.parent) || t.isLogicalExpression(path.parentPath?.parent)),
  )
}

export function createLegacyTraverseOptions(
  options: ITemplateHandlerOptions,
  jsTokenUpdater: JsTokenUpdater,
) {
  return {
    StringLiteral(path) {
      if (shouldSkipLegacyStringLiteral(path)) {
        return
      }
      jsTokenUpdater.addToken(
        replaceHandleValue(
          path,
          {
            escapeMap: options.escapeMap,
            classNameSet: options.runtimeSet,
            needEscaped: true,
            alwaysEscape: true,
          },
        ),
      )

      // path.node.value = replaceWxml(path.node.value, options)
    },
    noScope: true,
  } satisfies TraverseOptions & { noScope: true }
}
