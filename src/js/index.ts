import { parse, traverse, generate } from '@/babel'
import type { TraverseOptions, IJsHandlerOptions } from '@/types'
import type { Node, StringLiteral, TemplateElement } from '@babel/types'
import * as t from '@babel/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@/reg'
import { splitCode } from '@/extractors/split'
import { isProd } from '@/env'

export function handleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions) {
  const set = options.classNameSet
  const escapeEntries = options.escapeEntries
  const arr = splitCode(str) // .split(/\s/).filter((x) => x) // splitCode(n.value) // .split(/\s/).filter((x) => x)
  let rawStr = str
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    if (set.has(v)) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag = node.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        rawStr = rawStr.replace(
          new RegExp(escapeStringRegexp(v), 'g'),
          replaceWxml(v, {
            escapeEntries
          })
        )
      }
    }
  }
  return rawStr
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions) {
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  })
  // 这样搞会把原先所有的 children 含有相关的 也都转义了
  const topt: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        const n = p.node
        n.value = handleValue(n.value, n, options)
      }
      // exit(p) {}
    },
    TemplateElement: {
      enter(p) {
        const n = p.node
        n.value.raw = handleValue(n.value.raw, n, options)
      }
    },
    CallExpression: {
      enter(p) {
        const n = p.node
        // eval()
        if (t.isIdentifier(n.callee) && n.callee.name === 'eval') {
          if (t.isStringLiteral(n.arguments[0])) {
            const res = jsHandler(n.arguments[0].value, options)
            if (res.code) {
              n.arguments[0].value = res.code
            }
          }
        }
      }
    },
    noScope: true
  }

  traverse(ast, topt)

  return generate(ast, {
    minified: options.minifiedJs ?? isProd()
  })
}

export function createjsHandler(options: Omit<IJsHandlerOptions, 'classNameSet'>) {
  return (rawSource: string, set: Set<string>) => {
    return jsHandler(rawSource, {
      classNameSet: set,
      escapeEntries: options.escapeEntries,
      minifiedJs: options.minifiedJs
    })
  }
}
