import { parse } from '@babel/parser'
import type { Node } from '@babel/types'
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
      // console.log(path.node)
      // _tarojs_components__WEBPACK_IMPORTED_MODULE_0__
      // if (isReact) {
      // taro react start
      if (
        path.node.type === 'ObjectProperty' &&
        path.node.key.type === 'Identifier' &&
        (path.node.key.name === 'class' || path.node.key.name === 'staticClass' || path.node.key.name === 'className')
      ) {
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
        // 'text-[100px] font-bold underline '

        // console.log(path.node)
        // start replace
        // path.node
      }
      // taro react end
      // }
      // if (isVue) {
      //   // taro vue
      //   // @ts-ignore
      //   if (path.node.type === 'ObjectProperty' && path.node.key.type === 'Identifier' && (path.node.key.name === 'class' || path.node.key.name === 'staticClass')) {
      //     // @ts-ignore
      //     // console.log('1')
      //   }
      // }
    },
    noScope: true
  })

  const { code } = generate(ast)
  return code
  // console.log(ast)
}
