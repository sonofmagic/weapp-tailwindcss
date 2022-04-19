import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import type { Replacer } from './replacer'

export function jsxHandler(rawSource: string, replacer: Replacer) {
  const ast = parse(rawSource)

  traverse(ast, {
    enter(path) {
      replacer(path)
    },
    noScope: true
  })

  const { code } = generate(ast)
  return code
}
