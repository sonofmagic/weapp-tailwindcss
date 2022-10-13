import type { Node, ObjectProperty, Identifier, StringLiteral, Expression } from '@babel/types'

export type UserMatchNode = ObjectProperty & { key: Identifier | StringLiteral }

export function isSpecNode (node: Node) {
  return node.type === 'ObjectProperty' && node.key.type === 'Identifier'
}

export function getKey (node: Identifier | StringLiteral | Expression): string {
  if (node.type === 'Identifier') {
    return node.name
  }
  if (node.type === 'StringLiteral') {
    return node.value
  }
  return ''
}

export function reactMatcher (node: UserMatchNode) {
  // rax ->class and className, taro 为 hoverClass remax 为 hoverClassName
  //  node.key.name === 'class' || node.key.name === 'className' || node.key.name === 'hoverClass' || node.key.name === 'hover-class' || node.key.name === 'hoverClassName'
  // react jsx and vue jsx
  return ['className', 'hoverClass', 'hoverClassName', 'class', 'hover-class'].includes(getKey(node.key))
}

export function vue2Matcher (node: UserMatchNode): [boolean, UserMatchNode] {
  // 应该获取指定的节点开始匹配而不是整个 attrs 节点
  // for hover-class
  if (getKey(node.key) === 'attrs' && node.type === 'ObjectProperty') {
    if (node.value.type === 'ObjectExpression' && Array.isArray(node.value.properties)) {
      const idx = node.value.properties.findIndex((x) => {
        return x.type === 'ObjectProperty' && x.key.type === 'StringLiteral' && x.key.value === 'hover-class'
      })
      if (idx > -1) {
        return [true, node.value.properties[idx] as UserMatchNode]
      } else {
        return [false, node]
      }
    }
    return [false, node]
  }
  return [getKey(node.key) === 'class' || getKey(node.key) === 'staticClass', node] // || node.key.name === 'hover-class'
}

export function vue3Matcher (node: ObjectProperty & { key: Identifier | StringLiteral }) {
  if (['class', 'hover-class'].includes(getKey(node.key))) {
    return true
  }
  return false
}

export function isVue3SpecNode (node: Node) {
  return node.type === 'ObjectProperty' && (node.key.type === 'Identifier' || node.key.type === 'StringLiteral')
}
