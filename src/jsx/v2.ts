import { replaceWxml } from '@/wxml/shared'
import { parse, traverse, generate } from '@/babel'
import type { Node, TraverseOptions } from '@/types'
import { getKey } from './matcher'
import { templeteHandler } from '@/wxml/utils'

const StartMatchKeyMap: Record<'react' | 'vue2' | 'vue3' | string, string[]> = {
  react: ['className', 'hoverClass', 'hoverClassName', 'class', 'hover-class'],
  vue2: ['class', 'staticClass'], // 'hover-class' 在 'attrs' 里
  vue3: ['class', 'hover-class']
}

function isObjectKey (type: string) {
  return ['Identifier', 'StringLiteral'].includes(type)
}

export function newJsxHandler (rawSource: string, framework: string = 'react') {
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  }) as Node
  const matchKeys = StartMatchKeyMap[framework] ?? StartMatchKeyMap.react
  const isVue2 = framework === 'vue2'
  const isVue3 = framework === 'vue3'
  // https://astexplorer.net/
  let startFlag = false

  const options: TraverseOptions<Node> = {
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
  }
  if (isVue3) {
    options.CallExpression = {
      enter (path) {
        const hit = path.node.arguments[0]
        if (hit && hit.type === 'StringLiteral') {
          hit.value = templeteHandler(hit.value, {
            keepEOL: true
          })
        }
      }
    }
  }
  // const vue3StaticVNodeStartFlag = false
  traverse(ast, options)

  return generate(ast)
}
