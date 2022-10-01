import { replaceWxml } from '@/wxml'
import { parse, traverse, generate } from '@/babel'
import type { Node } from '@babel/types'
import { getKey } from './matcher'

const StartMatchKeyMap: Record<'react' | 'vue2' | 'vue3', string[]> = {
  react: ['className', 'hoverClass', 'hoverClassName', 'class', 'hover-class'],
  vue2: ['class', 'staticClass'], // 'hover-class' 在 'attrs' 里
  vue3: ['class', 'hover-class']
}

function isObjectKey (type: string) {
  return ['Identifier', 'StringLiteral'].includes(type)
}

export function newJsxHandler (rawSource: string, framework: keyof typeof StartMatchKeyMap = 'react') {
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  }) as Node
  const matchKeys = StartMatchKeyMap[framework]
  const isVue2 = framework === 'vue2'
  // https://astexplorer.net/
  // TODO
  let startFlag = false

  traverse(ast, {
    ObjectProperty: {
      enter (path) {
        if (isObjectKey(path.node.key.type)) {
          const keyStr = getKey(path.node.key)
          if (matchKeys.includes(keyStr)) {
            startFlag = true
          }
          if (isVue2 && keyStr === 'attrs' && path.node.value.type === 'ObjectExpression') {
            const idx = path.node.value.properties.findIndex((x) => {
              return x.type === 'ObjectProperty' && isObjectKey(x.key.type) && getKey(x.key) === 'hover-class'
            })
            const hoverClassNode = path.node.value.properties[idx]
            if (idx > -1 && hoverClassNode.type === 'ObjectProperty') {
              if (hoverClassNode.value.type === 'StringLiteral') {
                hoverClassNode.value.value = replaceWxml(hoverClassNode.value.value, {
                  keepEOL: true
                })
              }
            }
          }
        }
      },
      exit (path) {
        if (['Identifier', 'StringLiteral'].includes(path.node.key.type) && matchKeys.includes(getKey(path.node.key))) {
          startFlag = false
        }
      }
    },
    StringLiteral: {
      enter (path) {
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
