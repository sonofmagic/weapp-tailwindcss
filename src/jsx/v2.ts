import { replaceWxml } from '@/wxml/shared'
import { parse, traverse, generate } from '@/babel'
import type { TraverseOptions, IJsxHandlerOptions } from '@/types'
import type { Node, Identifier, StringLiteral, Expression, PrivateName } from '@babel/types'

import { templeteHandler } from '@/wxml/utils'
import { defu, regExpTest } from '@/utils'

type StringOrRegExpArray = (string | RegExp)[]

function createStartMatchKeyMap(matches?: StringOrRegExpArray): Record<'react' | 'vue2' | 'vue3' | string, (string | RegExp)[]> {
  let react: StringOrRegExpArray = ['className', 'hoverClass', 'hoverClassName', 'class', 'hover-class']
  let vue2: StringOrRegExpArray = ['class', 'staticClass'] // 'hover-class' 在 'attrs' 里
  let vue3: StringOrRegExpArray = ['class', 'hover-class']
  if (matches) {
    react = react.concat(matches)
    vue2 = vue2.concat(matches)
    vue3 = vue3.concat(matches)
  }
  return {
    react,
    vue2,
    vue3
  }
}

export function getKey(node: Identifier | StringLiteral | Expression | PrivateName): string {
  if (node.type === 'Identifier') {
    return node.name
  }
  if (node.type === 'StringLiteral') {
    return node.value
  }
  return ''
}

function isObjectKey(type: string) {
  return ['Identifier', 'StringLiteral'].includes(type)
}

export function jsxHandler(
  rawSource: string,
  opt: IJsxHandlerOptions = {
    framework: 'react'
  }
) {
  const { framework, escapeEntries, allMatchedAttributes } = opt
  const ast = parse(rawSource, {
    sourceType: 'unambiguous'
  }) as Node

  const StartMatchKeyMap = createStartMatchKeyMap(allMatchedAttributes)
  const matchKeys = StartMatchKeyMap[framework as string] ?? StartMatchKeyMap.react
  const isVue2 = framework === 'vue2'
  const isVue3 = framework === 'vue3'
  // https://astexplorer.net/
  let startFlag = false

  const options: TraverseOptions<Node> = {
    ObjectProperty: {
      enter(path) {
        if (isObjectKey(path.node.key.type)) {
          const keyStr = getKey(path.node.key)
          if (regExpTest(matchKeys, keyStr)) {
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
                  keepEOL: true,
                  escapeEntries
                })
              }
            }
          }
        }
      },
      exit(path) {
        if (['Identifier', 'StringLiteral'].includes(path.node.key.type) && regExpTest(matchKeys, getKey(path.node.key))) {
          startFlag = false
        }
      }
    },
    StringLiteral: {
      enter(path) {
        if (startFlag) {
          path.node.value = replaceWxml(path.node.value, {
            keepEOL: true,
            escapeEntries
          })
        }
      }
    },
    noScope: true
  }
  if (isVue3) {
    options.CallExpression = {
      enter(path) {
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
  // @ts-ignore
  return generate(ast)
}

export function createJsxHandler(options: IJsxHandlerOptions) {
  if (options.customAttributesEntities) {
    const entry = options.customAttributesEntities.find((x) => x[0] === '*')
    if (entry) {
      const t = entry[1]
      if (Array.isArray(t)) {
        options.allMatchedAttributes = t
      } else {
        options.allMatchedAttributes = [t]
      }
    }
  }
  return (rawSource: string, opt?: IJsxHandlerOptions) => {
    return jsxHandler(rawSource, defu(opt, options))
  }
}
