import type { ParseError, ParseResult } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { File, Identifier, Node } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import { jsStringEscape } from '@ast-core/escape'
import MagicString from 'magic-string'
import { parse, traverse } from '../babel'
import { replaceHandleValue } from './handlers'

export function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  const ms = new MagicString(rawSource)

  let ast: ParseResult<File>
  try {
    ast = parse(rawSource, options.babelParserOptions)
  }
  catch (error) {
    return {
      code: rawSource,
      error: error as ParseError,
    } as JsHandlerResult
  }

  const traverseOptions: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        if (isEvalPath(p.parentPath)) {
          return
        }

        const n = p.node
        replaceHandleValue(
          n.value,
          n,
          {
            ...options,
            needEscaped: options.needEscaped ?? true,
          },
          ms,
          1,
        )
      },
    },
    TemplateElement: {
      enter(p) {
        if (p.parentPath.isTemplateLiteral()) {
          if (
            (p.parentPath.parentPath.isTaggedTemplateExpression()
              && p.parentPath.parentPath.get('tag').isIdentifier()
              && options.ignoreTaggedTemplateExpressionIdentifiers?.includes((p.parentPath.parentPath.get('tag').node as Identifier).name)
            )
            || isEvalPath(p.parentPath.parentPath)) {
            return
          }
        }
        const n = p.node
        replaceHandleValue(
          n.value.raw,
          n,
          {
            ...options,
            needEscaped: false,
          },
          ms,
          0,
        )
      },
    },
    CallExpression: {
      enter(p) {
        if (isEvalPath(p)) {
          p.traverse({
            StringLiteral: {
              enter(s) {
                // ___CSS_LOADER_EXPORT___
                const res = jsHandler(s.node.value, {
                  ...options,
                  needEscaped: false,
                  generateMap: false,
                })
                if (res.code) {
                  const node = s.node
                  if (typeof node.start === 'number' && typeof node.end === 'number') {
                    const start = node.start + 1
                    const end = node.end - 1
                    if (start < end && s.node.value !== res.code) {
                      ms.update(start, end, jsStringEscape(res.code))
                      node.value = res.code
                    }
                  }
                }
              },
            },
            TemplateElement: {
              enter(s) {
                const res = jsHandler(s.node.value.raw, {
                  ...options,
                  generateMap: false,
                })
                if (res.code) {
                  const node = s.node
                  if (typeof node.start === 'number' && typeof node.end === 'number') {
                    const start = node.start
                    const end = node.end
                    if (start < end && s.node.value.raw !== res.code) {
                      ms.update(start, end, res.code)
                      s.node.value.raw = res.code
                    }
                  }
                }
              },
            },
          })
        }
      },
    },
  }

  traverse(ast, traverseOptions)

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }
}
