import { replaceWxml } from '@/wxml'
import { parse, traverse, generate } from '@/babel'

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
