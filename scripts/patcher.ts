import path from 'path'
import fs from 'fs'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import type { ArrayExpression, StringLiteral } from '@babel/types'
// lengthUnits
// 2526 2360
function main() {
  const mainEntry = require.resolve('tailwindcss')
  const libDir = path.dirname(mainEntry)
  const dataTypesFilePath = path.resolve(libDir, 'util/dataTypes.js')
  const dataTypesFileContent = fs.readFileSync(dataTypesFilePath, {
    encoding: 'utf-8'
  })
  const ast = parse(dataTypesFileContent)

  let arrayRef: ArrayExpression | undefined
  traverse(ast, {
    Identifier(path) {
      if (path.node.name === 'lengthUnits') {
        if (path.parent.type === 'VariableDeclarator') {
          if (path.parent.init?.type === 'ArrayExpression') {
            arrayRef = path.parent.init
            const set = new Set(path.parent.init.elements.map((x) => (<StringLiteral>x).value))
            if (!set.has('rpx')) {
              path.parent.init.elements.push({
                type: 'StringLiteral',
                value: 'rpx'
              })
            }
          }
        }
      }
    }
  })
  if (arrayRef) {
    const { code } = generate(arrayRef)
    if ((arrayRef.start ?? 0) > 0 && (arrayRef.end ?? 0) > 0) {
      // @ts-ignore
      const prev = dataTypesFileContent.slice(0, arrayRef.start)
      const next = dataTypesFileContent.slice(arrayRef.end as number)

      fs.writeFileSync(dataTypesFilePath, prev + code + next, {
        encoding: 'utf-8'
      })
      // fs.writeFileSync(path.resolve(__dirname, 'dataTypes.js'), prev + code + next, {
      //   encoding: 'utf-8'
      // })
      // const target = dataTypesFileContent.slice(arrayRef.start, arrayRef.end)
      // const ws = fs.createWriteStream(dataTypesFilePath, {
      //   encoding: 'utf-8',
      //   start: arrayRef.start as number
      // })
    }
  }
}
main()
