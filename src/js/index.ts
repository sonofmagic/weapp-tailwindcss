import { parse, traverse, generate } from '@/babel'
import type { TraverseOptions, IJsHandlerOptions } from '@/types'
import type { Node } from '@babel/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@/reg'

export function jsHandler(rawSource: string, options: IJsHandlerOptions) {
  const ast = parse(rawSource)
  const set = options.classNameSet
  // 这样搞会把原先所有的 children 含有相关的 也都转义了
  const topt: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        const n = p.node
        const arr = n.value.split(/\s/).filter((x) => x)
        let rawStr = n.value
        for (let i = 0; i < arr.length; i++) {
          const v = arr[i]
          if (set.has(v)) {
            let ignoreFlag = false
            if (Array.isArray(n.leadingComments)) {
              ignoreFlag = n.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
            }

            if (!ignoreFlag) {
              rawStr = rawStr.replace(
                new RegExp(escapeStringRegexp(v), 'g'),
                replaceWxml(v, {
                  escapeEntries: options.escapeEntries
                })
              )
            }
          }
        }
        n.value = rawStr
      }
      // exit(p) {}
    },
    noScope: true
  }

  traverse(ast, topt)

  return generate(ast)
}

export function createjsHandler(options: Omit<IJsHandlerOptions, 'classNameSet'>) {
  return (rawSource: string, set: Set<string>) => {
    return jsHandler(rawSource, {
      classNameSet: set,
      escapeEntries: options.escapeEntries
    })
  }
}
