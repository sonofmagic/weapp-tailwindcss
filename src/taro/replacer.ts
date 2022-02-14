import type { Node, ObjectProperty, Identifier } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import { replaceWxml } from '../wxml'

export type UserMatchNode = ObjectProperty & { key: Identifier }
export type Replacer = (path: NodePath<Node>) => void

function isSpecNode (node: Node) {
  return node.type === 'ObjectProperty' && node.key.type === 'Identifier'
}

function reactMatcher (node: UserMatchNode) {
  return node.key.name === 'className'
}

function vue2Matcher (node: UserMatchNode) {
  return node.key.name === 'class' || node.key.name === 'staticClass'
}

function vue3Matcher (path: NodePath<Node>) {
  return path.node.type === 'Identifier' && /_hoisted_/.test(path.node.name)
}

export function createReplacer (framework: string = 'react'): Replacer {
  let classObjectNode: Node | null
  let startFlag = false
  const isVue3 = framework === 'vue3'
  const isVue2 = framework === 'vue' || framework === 'vue2'
  const isReact = framework === 'react'
  function end () {
    startFlag = false
    classObjectNode = null
  }

  function start (node: Node) {
    startFlag = true
    classObjectNode = node
  }
  if (isVue2) {
    return function replacer (path: NodePath<Node>) {
      // react and vue2

      // if (vue3Matcher(path)) {
      //   console.log(path.node)
      // }
      if (isSpecNode(path.node) && vue2Matcher(path.node as UserMatchNode)) {
        return start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return end()
        }
        if (path.node.type === 'StringLiteral') {
          // TODO
          // 现在这样是不恰当的
          // 玩意变量中用户使用了 'a/s' 就会产生破坏效果
          path.node.value = replaceWxml(path.node.value)
        }
      }
    }
  } else if (isVue3) {
    return function replacer (path: NodePath<Node>) {
      // react and vue2

      // if (vue3Matcher(path)) {
      //   console.log(path.node)
      // }
      if (isSpecNode(path.node) && (vue2Matcher(path.node as UserMatchNode) || reactMatcher(path.node as UserMatchNode))) {
        return start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return end()
        }
        if (path.node.type === 'StringLiteral') {
          // TODO
          // 现在这样是不恰当的
          // 玩意变量中用户使用了 'a/s' 就会产生破坏效果
          path.node.value = replaceWxml(path.node.value)
        }
      }
    }
  } else if (isReact) {
    return function replacer (path: NodePath<Node>) {
      // react and vue2

      // if (vue3Matcher(path)) {
      //   console.log(path.node)
      // }
      if (isSpecNode(path.node) && reactMatcher(path.node as UserMatchNode)) {
        return start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return end()
        }
        if (path.node.type === 'StringLiteral') {
          // TODO
          // 现在这样是不恰当的
          // 玩意变量中用户使用了 'a/s' 就会产生破坏效果
          path.node.value = replaceWxml(path.node.value)
        }
      }
    }
  } else {
    return function replacer (path: NodePath<Node>) {}
  }
}
