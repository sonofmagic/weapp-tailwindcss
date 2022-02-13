import { parse } from '@babel/parser'
import type { Node, ObjectProperty, Identifier } from '@babel/types'
import traverse from '@babel/traverse'
import type { NodePath } from '@babel/traverse'
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

function vue3Matcher (path: NodePath<Node>) {
  return path.node.type === 'Identifier' && /_hoisted_/.test(path.node.name)
}
// vue3 hoisted

// var render = function () {
// process.env

function createMatcher () {
  let classObjectNode: Node | null
  let startFlag = false

  function end () {
    startFlag = false
    classObjectNode = null
  }
  return function replacer (path: NodePath<Node>) {
    function start () {
      startFlag = true
      classObjectNode = path.node
    }

    // react and vue2

    // if (vue3Matcher(path)) {
    //   console.log(path.node)
    // }
    if (isSpecNode(path.node) && (vue2Matcher(path.node as UserMatchNode) || reactMatcher(path.node as UserMatchNode))) {
      start()
      return
    }

    if (startFlag) {
      if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
        end()
        return
      }
      if (path.node.type === 'StringLiteral') {
        // TODO
        // 现在这样是不恰当的
        // 玩意变量中用户使用了 'a/s' 就会产生破坏效果
        path.node.value = replaceWxml(path.node.value)
      }
    }
  }
}

export function jsxHandler (rawSource: string) {
  const ast = parse(rawSource)

  const replacer = createMatcher()
  traverse(ast, {
    enter (path) {
      replacer(path)
    },
    noScope: true
  })

  const { code } = generate(ast)
  return code
  // console.log(ast)
}
