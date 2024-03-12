import type { File, Node } from '@babel/types'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import MagicString from 'magic-string'
import type { ParseResult } from '@babel/parser'
import { SgNode, js } from '@ast-grep/napi'
import { replaceHandleValue } from './handlers'
import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandlerResult } from '@/types'
import { parse, traverse } from '@/babel'
import { jsStringEscape } from '@/escape'
import { defuOverrideArray } from '@/utils'

function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

// node.kind()
// node.children()
// node.range()
function SgNodeTraverse(node: SgNode, cb: (node: SgNode) => void) {
  cb(node)
  for (const child of node.children()) {
    SgNodeTraverse(child, cb)
  }
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  const ms = new MagicString(rawSource)
  if (options.jsAstTool === 'ast-grep') {
    let ast: SgNode
    try {
      ast = js.parse(rawSource).root()
    } catch {
      return {
        code: rawSource
      } as JsHandlerResult
    }

    SgNodeTraverse(ast, (node) => {
      const kind = node.kind()
      switch (kind) {
        // string
        // string_fragment
        // template_string
        case 'string_fragment': {
          const range = node.range()
          replaceHandleValue(
            node.text(),
            {
              end: range.end.index,
              start: range.start.index
            },
            {
              ...options
            },
            ms,
            0
          )
          break
        }
      }
    })
  } else {
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

    const ropt: TraverseOptions<Node> = {
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
              needEscaped: options.needEscaped ?? true
            },
            ms,
            1
          )
        }
        // exit(p) {}
      },
      TemplateElement: {
        enter(p) {
          if (p.parentPath.isTemplateLiteral() && isEvalPath(p.parentPath.parentPath)) {
            return
          }
          const n = p.node
          replaceHandleValue(
            n.value.raw,
            n,
            {
              ...options,
              needEscaped: false
            },
            ms,
            0
          )
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
  }

  return {
    code: ms.toString()
  }
}

export function createJsHandler(options: CreateJsHandlerOptions) {
  const { mangleContext, arbitraryValues, escapeMap, jsPreserveClass, generateMap, jsAstTool } = options
  return (rawSource: string, set: Set<string>, options?: CreateJsHandlerOptions) => {
    const opts = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(options as IJsHandlerOptions, {
      classNameSet: set,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      generateMap,
      jsAstTool
    })
    return jsHandler(rawSource, opts)
  }
}
