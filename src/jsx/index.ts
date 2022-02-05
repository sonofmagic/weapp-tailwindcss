import { parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

export function jsxHandler (rawSource: string) {
  const ast = parseExpression(rawSource)
  traverse(ast, {

  })
  console.log(ast)
}
