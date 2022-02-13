import { parse } from '@babel/parser'
import type { Node, ObjectProperty, Identifier } from '@babel/types'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { replaceWxml } from '../wxml'

// const isReact = false

// const isVue2 = true
// const isVue3 = true
// const isVue = isVue2 || isVue3
// react -> className
// vue -> class/staticClass
// function nodeMatcher (nodeKeyName: string) {
//   return nodeKeyName === 'className'|| nodeKeyName ==='class'|| nodeKeyName ===''
// }
type UserMatchNode = ObjectProperty & { key: Identifier }

function isSpecNode (node: Node) {
  return node.type === 'ObjectProperty' && node.key.type === 'Identifier'
}

function reactMatcher (node: UserMatchNode) {
  return node.key.name === 'className'
}

function vue2Matcher (node: UserMatchNode) {
  return node.key.name === 'class' || node.key.name === 'staticClass'
}
// vue3 hoisted

// var render = function () {
// process.env
export function jsxHandler (rawSource: string) {
  const ast = parse(rawSource)
  // ObjectExpression
  // start 180
  // end 330

  // ObjectProperty
  // 186 - 305
  // key
  let classObjectNode: Node
  let startFlag = false
  traverse(ast, {
    enter (path) {
      // react and vue2
      if (isSpecNode(path.node) && (vue2Matcher(path.node as UserMatchNode) || reactMatcher(path.node as UserMatchNode))) {
        startFlag = true
        classObjectNode = path.node
        return
      }
      if (startFlag) {
        if ((path.node.start as number) > (classObjectNode.end as number)) {
          startFlag = false
          return
        }
        if (path.node.type === 'StringLiteral') {
          // TODO
          // 现在这样是不恰当的
          // 玩意变量中用户使用了 'a/s' 就会产生破坏效果
          path.node.value = replaceWxml(path.node.value)
        }
      }
    },
    noScope: true
  })

  const { code } = generate(ast)
  return code
  // console.log(ast)
}
