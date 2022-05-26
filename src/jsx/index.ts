import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import type { Replacer } from './replacer'

export function jsxHandler (rawSource: string, replacer: Replacer, sourceFileName?: string) {
  const ast = parse(rawSource)

  traverse(ast, {
    enter (path) {
      replacer(path)
    },
    noScope: true
  })
  //, {
  // sourceMaps: true
  // sourceFileName
  // }
  return generate(ast)
}
