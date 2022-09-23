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

export function newJsxHandler (rawSource: string) {
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  })
  // TODO
  let startFlag = false
  traverse(ast, {
    ObjectProperty: {
      enter (path, state) {
        startFlag = false
      },
      exit (path, state) {
        startFlag = true
      }
    },
    StringLiteral: {
      enter (path, state) {
        if (startFlag) {
          console.log(path.node.value)
        }
      }
    },
    noScope: true
  })

  return generate(ast)
}
