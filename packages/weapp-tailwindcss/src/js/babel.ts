import type { ParseError, ParseResult } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { File, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { JsToken } from './types'
import { regExpTest } from '@/utils'
import { jsStringEscape } from '@ast-core/escape'
import MagicString from 'magic-string'
import { parse, traverse } from '../babel'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'
import { NodePathWalker } from './NodePathWalker'

export function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

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

  const jsTokenUpdater = new JsTokenUpdater()
  const walker = new NodePathWalker(
    {
      ignoreCallExpressionIdentifiers: options.ignoreCallExpressionIdentifiers,
      callback(path) {
        ignoreFlagMap.set(path.node, true)
      },
    },
  )

  const targetPaths: NodePath<StringLiteral | TemplateElement>[] = []
  const traverseOptions: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        if (isEvalPath(p.parentPath)) {
          return
        }
        targetPaths.push(p)
      },
    },
    TemplateElement: {
      enter(p) {
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
        targetPaths.push(p)
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
                          path: s,
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
                          path: s,
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

        walker.walkCallExpression(p)
      },
    },
  }

  traverse(ast, traverseOptions)

  const tokens = targetPaths.map(
    (p) => {
      if (p.isStringLiteral()) {
        return replaceHandleValue(
          p,
          {
            ...options,
            needEscaped: options.needEscaped ?? true,
          },
        )
      }
      else if (p.isTemplateElement()) {
        return replaceHandleValue(
          p,
          {
            ...options,
            needEscaped: false,
          },
        )
      }
      return undefined
    },
  ).filter(Boolean) as JsToken[]

  jsTokenUpdater.value.push(...tokens)
  jsTokenUpdater.filter((x) => {
    return !ignoreFlagMap.get(x.path.node)
  }).updateMagicString(ms)

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }
}
