import type { Node } from '@babel/types'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import MagicString from 'magic-string'
import { regenerateHandleValue, replaceHandleValue } from './handlers'
import { parse, traverse, generate } from '@/babel'
import type { IJsHandlerOptions } from '@/types'
import { isProd } from '@/env'
import { jsStringEscape } from '@/escape'

function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions) {
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  })

  if (options.strategy === 'replace') {
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
                    needEscaped: false
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
                  const res = jsHandler(s.node.value.raw, options)
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

    return {
      code: ms.toString()
    }
  } else {
    // 这样搞会把原先所有的 children 含有相关的 也都转义了
    const gopt: TraverseOptions<Node> = {
      StringLiteral: {
        enter(p) {
          if (isEvalPath(p.parentPath)) {
            return
          }
          const n = p.node
          n.value = regenerateHandleValue(n.value, n, options)
        }
        // exit(p) {}
      },
      TemplateElement: {
        enter(p) {
          if (p.parentPath.isTemplateLiteral() && isEvalPath(p.parentPath.parentPath)) {
            return
          }
          const n = p.node
          n.value.raw = regenerateHandleValue(n.value.raw, n, options)
        }
      },
      CallExpression: {
        enter(p) {
          if (isEvalPath(p)) {
            p.traverse({
              StringLiteral: {
                enter(s) {
                  // ___CSS_LOADER_EXPORT___
                  const res = jsHandler(s.node.value, options)
                  if (res.code) {
                    s.node.value = res.code
                  }
                }
              },
              TemplateElement: {
                enter(s) {
                  const res = jsHandler(s.node.value.raw, options)
                  if (res.code) {
                    s.node.value.raw = res.code
                  }
                }
              }
            })
          }
        }
      }
      // You must pass a scope and parentPath unless traversing a Program/File. Instead of that you tried to traverse a CallExpression node without passing scope and parentPath.
      // noScope: true
    }

    traverse(ast, gopt)

    return generate(ast, {
      minified: options.minifiedJs ?? isProd()
    })
  }
}

export function createjsHandler(options: Omit<IJsHandlerOptions, 'classNameSet'>) {
  const { mangleContext, arbitraryValues, minifiedJs, escapeMap, jsPreserveClass, strategy } = options
  return (rawSource: string, set: Set<string>) => {
    return jsHandler(rawSource, {
      classNameSet: set,
      minifiedJs,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      strategy
    })
  }
}
