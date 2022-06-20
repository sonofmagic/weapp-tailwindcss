import type { Node, ObjectProperty, Identifier } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import { replaceWxml } from '@/wxml'
import { classStringReplace } from '@/reg'

export type UserMatchNode = ObjectProperty & { key: Identifier }
export type Replacer = {
  (path: NodePath<Node>): void
  start: (node: Node) => void
  end: () => void
}

function isSpecNode (node: Node) {
  return node.type === 'ObjectProperty' && node.key.type === 'Identifier'
}

function reactMatcher (node: UserMatchNode) {
  return node.key.name === 'className' || node.key.name === 'hoverClass'
}

function vue2Matcher (node: UserMatchNode) {
  return node.key.name === 'class' || node.key.name === 'staticClass' // || node.key.name === 'hover-class'
}

export type JsxFrameworkEnum = 'react' | 'vue' | 'vue2' | 'vue3'

// default react
export function createReplacer (framework: string = 'react'): Replacer {
  let classObjectNode: Node | null
  let startFlag = false
  const isVue3 = framework === 'vue3'
  const isVue2 = framework === 'vue' || framework === 'vue2'
  const isReact = framework === 'react'

  function start (node: Node) {
    startFlag = true
    classObjectNode = node
  }

  function end () {
    startFlag = false
    classObjectNode = null
  }

  if (isVue2) {
    const replacer = (path: NodePath<Node>) => {
      // vue2
      if (isSpecNode(path.node) && vue2Matcher(path.node as UserMatchNode)) {
        return start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return end()
        }
        if (path.node.type === 'StringLiteral') {
          // TODO
          // 现在这样是有个问题的,变量中用户使用了 'a/s' 就会产生破坏效果
          path.node.value = replaceWxml(path.node.value, true)
        }
      }
    }
    replacer.start = start
    replacer.end = end
    return replacer
  } else if (isVue3) {
    const replacer = (path: NodePath<Node>) => {
      if (
        path.node.type === 'CallExpression' &&
        path.node.arguments.length === 2 &&
        path.node.arguments[0].type === 'StringLiteral' &&
        path.node.arguments[1].type === 'NumericLiteral'
      ) {
        path.node.arguments[0].value = classStringReplace(path.node.arguments[0].value, (x) => {
          return replaceWxml(x, true)
        })
      }

      if (isSpecNode(path.node) && vue2Matcher(path.node as UserMatchNode)) {
        return start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return end()
        }
        if (path.node.type === 'StringLiteral') {
          path.node.value = replaceWxml(path.node.value, true)
        }
      }
    }
    replacer.start = start
    replacer.end = end
    return replacer
  } else if (isReact) {
    const replacer = (path: NodePath<Node>) => {
      // react
      if (isSpecNode(path.node) && reactMatcher(path.node as UserMatchNode)) {
        return start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return end()
        }
        if (path.node.type === 'StringLiteral') {
          path.node.value = replaceWxml(path.node.value, true)
        }
      }
    }
    replacer.start = start
    replacer.end = end
    return replacer
  } else {
    const replacer = (path: NodePath<Node>) => {}
    replacer.start = start
    replacer.end = end
    return replacer
  }
}
