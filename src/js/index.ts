import type { Node, StringLiteral, TemplateElement } from '@babel/types'
import type { TraverseOptions } from '@babel/traverse'
import MagicString from 'magic-string'
import { parse, traverse, generate } from '@/babel'
import type { IJsHandlerOptions } from '@/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@/reg'
import { splitCode } from '@/extractors/split'
import { isProd } from '@/env'

export function regenerateHandleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions) {
  const set = options.classNameSet
  const escapeMap = options.escapeMap
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const ctx = options.mangleContext
  const jsPreserveClass = options.jsPreserveClass
  const arr = splitCode(str, allowDoubleQuotes) // .split(/\s/).filter((x) => x) // splitCode(n.value) // .split(/\s/).filter((x) => x)
  let rawStr = str
  for (const v of arr) {
    if (set.has(v) && !jsPreserveClass?.(v)) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag = node.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        if (ctx) {
          rawStr = ctx.jsHandler(rawStr)
        }

        rawStr = rawStr.replaceAll(
          new RegExp(escapeStringRegexp(v), 'g'),
          replaceWxml(v, {
            escapeMap
          })
        )
      }
    }
  }
  return rawStr
}

export function replaceHandleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions, ms: MagicString, offset = 1) {
  const set = options.classNameSet
  const escapeMap = options.escapeMap
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const ctx = options.mangleContext
  const jsPreserveClass = options.jsPreserveClass
  const arr = splitCode(str, allowDoubleQuotes) // .split(/\s/).filter((x) => x) // splitCode(n.value) // .split(/\s/).filter((x) => x)
  let rawStr = str
  for (const v of arr) {
    if (set.has(v) && !jsPreserveClass?.(v)) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag = node.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        if (ctx) {
          rawStr = ctx.jsHandler(rawStr)
        }

        rawStr = rawStr.replaceAll(
          new RegExp(escapeStringRegexp(v), 'g'),
          replaceWxml(v, {
            escapeMap
          })
        )
      }
    }
  }

  if (typeof node.start === 'number' && typeof node.end === 'number') {
    const start = node.start + offset
    const end = node.end - offset
    if (start < end) {
      ms.update(node.start + offset, node.end - offset, rawStr)
    }
  }

  return rawStr
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
          const n = p.node
          replaceHandleValue(n.value, n, options, ms)
        }
        // exit(p) {}
      },
      TemplateElement: {
        enter(p) {
          const n = p.node
          replaceHandleValue(n.value.raw, n, options, ms, 0)
        }
      },
      CallExpression: {
        enter(p) {
          const calleePath = p.get('callee')
          if (calleePath.isIdentifier() && calleePath.node.name === 'eval') {
            p.traverse({
              StringLiteral: {
                enter(s) {
                  // ___CSS_LOADER_EXPORT___
                  const res = jsHandler(s.node.value, options)
                  if (res.code) {
                    s.node.value = res.code
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
    const topt: TraverseOptions<Node> = {
      StringLiteral: {
        enter(p) {
          const n = p.node
          n.value = regenerateHandleValue(n.value, n, options)
        }
        // exit(p) {}
      },
      TemplateElement: {
        enter(p) {
          const n = p.node
          n.value.raw = regenerateHandleValue(n.value.raw, n, options)
        }
      },
      CallExpression: {
        enter(p) {
          const calleePath = p.get('callee')
          if (calleePath.isIdentifier() && calleePath.node.name === 'eval') {
            p.traverse({
              StringLiteral: {
                enter(s) {
                  // ___CSS_LOADER_EXPORT___
                  const res = jsHandler(s.node.value, options)
                  if (res.code) {
                    s.node.value = res.code
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

    traverse(ast, topt)

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
