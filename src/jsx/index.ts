import { parse, traverse, generate } from '@/babel'
import type { Replacer } from './replacer'

export function jsxHandler (rawSource: string, replacer: Replacer) {
  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  replacer?.end()
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  })

  traverse(ast, {
    enter (path) {
      replacer(path)
    },
    noScope: true
  })

  return generate(ast)
}
