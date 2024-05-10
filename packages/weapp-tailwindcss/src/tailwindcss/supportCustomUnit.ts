import * as t from '@babel/types'
import type { ArrayExpression, StringLiteral } from '@babel/types'
import { parse, traverse } from '@/babel'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions } from '@/types'

export function findAstNode(content: string, options: ILengthUnitsPatchOptions) {
  const DOPTS = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  const ast = parse(content)

  let arrayRef: ArrayExpression | undefined
  let changed = false
  traverse(ast, {
    Identifier(path) {
      if (
        path.node.name === DOPTS.variableName &&
        t.isVariableDeclarator(path.parent) &&
        t.isArrayExpression(path.parent.init)
      ) {
        arrayRef = path.parent.init
        const set = new Set(path.parent.init.elements.map((x) => (<StringLiteral>x).value))
        for (let i = 0; i < options.units.length; i++) {
          const unit = options.units[i]
          if (!set.has(unit)) {
            path.parent.init.elements = path.parent.init.elements.map((x) => {
              if (t.isStringLiteral(x)) {
                return {
                  type: x?.type,
                  value: x?.value
                }
              }
              return x
            })
            path.parent.init.elements.push({
              type: 'StringLiteral',
              value: unit
            })
            changed = true
          }
        }
      }
    }
  })
  return {
    arrayRef,
    changed
  }
}
