import type { File, Node } from '@babel/types'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import MagicString from 'magic-string'
import type { ParseResult } from '@babel/parser'
import swc from '@swc/core'
import type { StringLiteral, Literal, Module, TemplateElement } from '@swc/core'
import objectTraverse from 'traverse'
import { replaceHandleValue } from './handlers'
import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandlerReplaceResult, JsHandlerResult } from '@/types'
import { parse, traverse } from '@/babel'
import { jsStringEscape } from '@/escape'
import { defuOverrideArray } from '@/utils'

function isObject(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  const ms = new MagicString(rawSource)
  if (options.jsAstTool === 'swc') {
    let ast: Module
    try {
      const compiler = new swc.Compiler()
      ast = compiler.parseSync(rawSource, {
        syntax: 'ecmascript',
        target: 'es2022'
      })
    } catch {
      return {
        code: rawSource
      } as JsHandlerResult
    }

    let start: number
    // const TemplateElementOffest = 0
    // let end: number
    // eslint-disable-next-line unicorn/no-array-for-each
    objectTraverse(ast).forEach(function (node: TemplateElement | Module | Literal) {
      if (isObject(node) && typeof node.type === 'string') {
        switch (node.type) {
          case 'Module': {
            start = node.span.start
            // end = node.span.end
            break
          }
          case 'StringLiteral': {
            // console.log('[SWC StringLiteral]', node.span)
            replaceHandleValue(
              node.value,
              {
                start: node.span.start - start,
                end: node.span.end - start
              },
              {
                ...options,
                needEscaped: options.needEscaped ?? true
              },
              ms,
              1
            )
            break
          }
          case 'TemplateElement': {
            // console.log('[SWC TemplateElement]', node.span)
            const startIndex = node.span.start - start
            if (node.tail) {
              replaceHandleValue(
                node.raw,
                {
                  start: startIndex,
                  end: startIndex + node.raw.length // node.span.end - start // node.span.start - start + (node.cooked?.length ?? 0) // node.span.end - start
                },
                {
                  ...options,
                  needEscaped: false
                },
                ms,
                0
              )
            } else {
              // TemplateElementOffest = node.span.end - start - node.raw.length
              replaceHandleValue(
                node.raw,
                {
                  start: startIndex,
                  end: startIndex + node.raw.length // node.span.end - start // node.span.start - start + (node.cooked?.length ?? 0) // node.span.end - start
                },
                {
                  ...options,
                  needEscaped: false
                },
                ms,
                0
              )
            }

            break
          }
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
  const result: JsHandlerReplaceResult = {
    code: ms.toString()
  }
  return result
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
