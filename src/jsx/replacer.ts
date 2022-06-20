import type { Node, ObjectProperty, Identifier, StringLiteral } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import { replaceWxml, templeteHandler } from '@/wxml'

// import { classStringReplace } from '@/reg'

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

function vue2Matcher (node: UserMatchNode): [boolean, UserMatchNode] {
  // 应该获取指定的节点开始匹配而不是整个 attrs 节点
  if (node.key.name === 'attrs' && node.type === 'ObjectProperty') {
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
  return [node.key.name === 'class' || node.key.name === 'staticClass', node] // || node.key.name === 'hover-class'
}

function vue3Matcher (node: ObjectProperty & { key: Identifier | StringLiteral }) {
  if ((node.key as Identifier).name === 'class') {
    return true
  }
  if ((node.key as StringLiteral).value === 'hover-class') {
    return true
  }
  return false
}

function isVue3SpecNode (node: Node) {
  return node.type === 'ObjectProperty' && (node.key.type === 'Identifier' || node.key.type === 'StringLiteral')
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
      if (isSpecNode(path.node)) {
        const [result, node] = vue2Matcher(path.node as UserMatchNode)
        if (result) {
          return start(node)
        }
      }

      if (startFlag) {
        const nodeStart = path.node.start as number
        const refNode = classObjectNode as Node
        if (nodeStart > (refNode.end as number)) {
          return end()
        }
        if (nodeStart >= (refNode.start as number)) {
          if (path.node.type === 'StringLiteral') {
            // TODO
            // 现在这样是有个问题的,变量中用户使用了 'a/s' 就会产生破坏效果
            path.node.value = replaceWxml(path.node.value, true)
          }
        }
      }
    }
    replacer.start = start
    replacer.end = end
    return replacer
  } else if (isVue3) {
    const replacer = (path: NodePath<Node>) => {
      // if (
      //   path.node.type === 'CallExpression' &&
      //   path.node.arguments.length === 2 &&
      //   path.node.arguments[0].type === 'StringLiteral' &&
      //   path.node.arguments[1].type === 'NumericLiteral'
      // ) {
      //   path.node.arguments[0].value = classStringReplace(path.node.arguments[0].value, (x) => {
      //     return replaceWxml(x, true)
      //   })
      // }
      // TODO
      // 性能很差，为什么要这么写主要原因是 vue3 里面有 createElementVNode 动态的节点和 createStaticVNode 静态的节点
      // 动态的，按照 ObjectProperty 的方式匹配就可以
      // 但是静态的，本身就是一大堆的字符串，很难找到规律，下面的做法是通杀的方式，利用正则匹配 tag 标签。

      // createStaticVNode
      if (path.node.type === 'StringLiteral') {
        path.node.value = templeteHandler(path.node.value)
      }
      // createElementVNode
      if (isVue3SpecNode(path.node) && vue3Matcher(path.node as UserMatchNode)) {
        return start(path.node)
      }

      if (startFlag) {
        const nodeStart = path.node.start as number
        const refNode = classObjectNode as Node
        if (nodeStart > (refNode.end as number)) {
          return end()
        }
        if (nodeStart >= (refNode.start as number)) {
          if (path.node.type === 'StringLiteral') {
            path.node.value = replaceWxml(path.node.value, true)
          }
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
