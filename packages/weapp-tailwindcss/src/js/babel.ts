import type { ParseError, ParseResult } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { File, Node } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import { regExpTest } from '@/utils'
import { jsStringEscape } from '@ast-core/escape'
import MagicString from 'magic-string'
import { parse, traverse } from '../babel'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'

export function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

// function replaceStringLiteralsInBinaryExpr(binaryNode: BinaryExpression, ms: MagicString) {
//   if (t.isStringLiteral(binaryNode.left)) {
//     const leftStringLiteral = binaryNode.left
//     leftStringLiteral.value = 'bg-[#654321]' // 替换
//     ms.update(leftStringLiteral.start, leftStringLiteral.end, `'${leftStringLiteral.value}'`)
//   }
//   else if (t.isBinaryExpression(binaryNode.left)) {
//     replaceStringLiteralsInBinaryExpr(binaryNode.left, ms) // 递归
//   }

//   if (t.isStringLiteral(binaryNode.right)) {
//     const rightStringLiteral = binaryNode.right
//     rightStringLiteral.value = 'text-[#222222]' // 替换
//     ms.update(rightStringLiteral.start, rightStringLiteral.end, `'${rightStringLiteral.value}'`)
//   }
//   else if (t.isBinaryExpression(binaryNode.right)) {
//     replaceStringLiteralsInBinaryExpr(binaryNode.right, ms) // 递归
//   }
// }

const ignoreFlagMap = new WeakMap()

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
  let ignoreFlag = false
  const jsTokenUpdater = new JsTokenUpdater({ ignoreCallExpressionIdentifiers: options.ignoreCallExpressionIdentifiers })

  const traverseOptions: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        if (ignoreFlag) {
          return
        }
        if (isEvalPath(p.parentPath)) {
          return
        }

        const n = p.node

        jsTokenUpdater.addToken(
          replaceHandleValue(
            n.value,
            n,
            {
              ...options,
              needEscaped: options.needEscaped ?? true,
            },
            1,
          ),
        )
      },
    },
    TemplateElement: {
      enter(p) {
        if (ignoreFlag) {
          return
        }
        const pp = p.parentPath
        if (pp.isTemplateLiteral()) {
          const ppp = pp.parentPath
          if (isEvalPath(ppp)) {
            return
          }
          if (ppp.isTaggedTemplateExpression()) {
            const tagPath = ppp.get('tag')
            if (
              (tagPath.isIdentifier()
                && regExpTest(options.ignoreTaggedTemplateExpressionIdentifiers ?? [], tagPath.node.name)
              )
            ) {
              return
            }
          }
        }
        const n = p.node
        jsTokenUpdater.addToken(
          replaceHandleValue(
            n.value.raw,
            n,
            {
              ...options,
              needEscaped: false,
            },
            0,
          ),
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
                      jsTokenUpdater.addToken(
                        {
                          start,
                          end,
                          value: jsStringEscape(res.code),
                        },
                      )
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
                      jsTokenUpdater.addToken(
                        {
                          start,
                          end,
                          value: res.code,
                        },
                      )
                    }
                  }
                }
              },
            },
          })
          return
        }
        const callee = p
          .get('callee')
        if (
          callee
            .isIdentifier()
            && (
              regExpTest(
                options
                  .ignoreCallExpressionIdentifiers ?? [],
                callee
                  .node
                  .name,
              )

            )
        ) {
          ignoreFlag = true
          ignoreFlagMap.set(p, true)
        }
      },
      exit(p) {
        const flag = ignoreFlagMap.get(p)
        if (flag) {
          ignoreFlag = false
          ignoreFlagMap.delete(p)
        }
      },
    },
  }

  traverse(ast, traverseOptions)
  jsTokenUpdater.updateMagicString(ms)

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }
}
