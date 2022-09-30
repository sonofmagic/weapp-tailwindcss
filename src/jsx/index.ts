import { parse, traverse, generate } from '@/babel'
import type { ASTReplacer } from './replacer'
import { replaceWxml } from '@/wxml'

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
  // https://astexplorer.net/
  // TODO
  let startFlag = false
  traverse(ast, {
    ObjectProperty: {
      enter (path) {
        if (path.node.key.type === 'Identifier' && ['className', 'hoverClass', 'hoverClassName'].includes(path.node.key.name)) {
          startFlag = true
        }
      },
      exit (path) {
        if (path.node.key.type === 'Identifier' && ['className', 'hoverClass', 'hoverClassName'].includes(path.node.key.name)) {
          startFlag = false
        }
      }
    },
    StringLiteral: {
      enter (path, state) {
        if (startFlag) {
          path.node.value = replaceWxml(path.node.value, {
            keepEOL: true
          })
        }
      }
    },
    noScope: true
  })

  return generate(ast)
}
