import path from 'path'
import fs from 'fs'
import { parse, traverse, generate } from '@/babel'
import type { ArrayExpression, StringLiteral } from '@babel/types'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions } from '@/types'

export function findAstNode(content: string, options: ILengthUnitsPatchOptions) {
  const DOPTS = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  const ast = parse(content)

  let arrayRef: ArrayExpression | undefined
  let changed = false
  traverse(ast, {
    Identifier(path) {
      if (path.node.name === DOPTS.variableName) {
        if (path.parent.type === 'VariableDeclarator') {
          if (path.parent.init?.type === 'ArrayExpression') {
            arrayRef = path.parent.init
            const set = new Set(path.parent.init.elements.map((x) => (<StringLiteral>x).value))
            for (let i = 0; i < options.units.length; i++) {
              const unit = options.units[i]
              if (!set.has(unit)) {
                path.parent.init.elements.push({
                  type: 'StringLiteral',
                  value: unit
                })
                changed = true
              }
            }
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

export function internalPatch(pkgJsonPath: string | undefined, options: ILengthUnitsPatchOptions) {
  const { dangerousOptions } = options
  const DOPTS = dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  if (pkgJsonPath) {
    const rootDir = path.dirname(pkgJsonPath)

    const dataTypesFilePath = path.resolve(rootDir, DOPTS.lengthUnitsFilePath)
    const dataTypesFileContent = fs.readFileSync(dataTypesFilePath, {
      encoding: 'utf-8'
    })
    const { arrayRef, changed } = findAstNode(dataTypesFileContent, options)
    if (arrayRef && changed) {
      // @ts-ignore
      const { code } = generate(arrayRef)
      if (arrayRef.start && arrayRef.end) {
        const prev = dataTypesFileContent.slice(0, arrayRef.start)
        const next = dataTypesFileContent.slice(arrayRef.end as number)
        const newCode = prev + code + next
        if (DOPTS.overwrite) {
          fs.writeFileSync(DOPTS.destPath ?? dataTypesFilePath, newCode, {
            encoding: 'utf-8'
          })
          console.log('patch tailwindcss for custom length unit successfully!')
        }

        return newCode
      }
    }
  }
}