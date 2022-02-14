import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import type { Replacer } from '../taro/replacer'
// const isReact = false

// const isVue2 = true
// const isVue3 = true
// const isVue = isVue2 || isVue3
// react -> className
// vue -> class/staticClass
// function nodeMatcher (nodeKeyName: string) {
//   return nodeKeyName === 'className'|| nodeKeyName ==='class'|| nodeKeyName ===''
// }

// vue3 hoisted

// var render = function () {
// process.env

export function jsxHandler (rawSource: string, replacer: Replacer) {
  const ast = parse(rawSource)

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
