import type { File, Node } from '@babel/types'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import MagicString from 'magic-string'
import type { ParseResult } from '@babel/parser'
import { replaceHandleValue } from './handlers'
import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandlerReplaceResult, JsHandlerResult } from '@/types'
import { parse, traverse } from '@/babel'
import { jsStringEscape } from '@/escape'
import { defu } from '@/utils'

function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  let ast: ParseResult<File>
  try {
    ast = parse(rawSource, {
      sourceType: 'unambiguous'
    })
  } catch {
    return {
      code: rawSource
    } as JsHandlerResult
  }

  const ms = new MagicString(rawSource)

  const ropt: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        if (isEvalPath(p.parentPath)) {
          return
        }

        const n = p.node
        replaceHandleValue(n.value, n, options, ms, 1, options.needEscaped ?? true)
      }
      // exit(p) {}
    },
    TemplateElement: {
      enter(p) {
        if (p.parentPath.isTemplateLiteral() && isEvalPath(p.parentPath.parentPath)) {
          return
        }
        const n = p.node
        replaceHandleValue(n.value.raw, n, options, ms, 0, false)
      }
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
                  generateMap: false
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
              }
            },
            TemplateElement: {
              enter(s) {
                const res = jsHandler(s.node.value.raw, {
                  ...options,
                  generateMap: false
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
              }
            }
          })
        }
      }
    }
  }

  traverse(ast, ropt)
  const result: JsHandlerReplaceResult = {
    code: ms.toString()
  }
  // no use
  // if (options.generateMap) {
  //   result.map = ms.generateMap()
  // }
  return result
}

export function createJsHandler(options: CreateJsHandlerOptions) {
  const { mangleContext, arbitraryValues, escapeMap, jsPreserveClass, generateMap } = options
  return (rawSource: string, set: Set<string>, options?: CreateJsHandlerOptions) => {
    const opts = defu<IJsHandlerOptions, IJsHandlerOptions[]>(options, {
      classNameSet: set,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      generateMap
    })
    return jsHandler(rawSource, opts)
  }
}
