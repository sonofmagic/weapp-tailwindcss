import { parse, traverse, generate } from '@/babel'
import type { ASTReplacer } from './replacer'

export function jsxHandler (rawSource: string, replacer: ASTReplacer) {
  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  replacer?.end()
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  })

  traverse(ast, {
    enter (path) {
      replacer.transform(path)
    },
    noScope: true
  })

  return generate(ast)
}
