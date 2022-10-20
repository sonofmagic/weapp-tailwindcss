import type { NodePath } from '@babel/traverse'
import type { ICommonReplaceOptions, Node } from '@/types'
import { replaceWxml, templeteHandler } from '@/wxml'
import { isSpecNode, isVue3SpecNode, reactMatcher, vue2Matcher, vue3Matcher, UserMatchNode } from './matcher'
export type JsxFrameworkEnum = 'react' | 'vue' | 'vue2' | 'vue3'

export class ASTReplacer {
  public classObjectNode?: Node | null
  public startFlag: boolean
  public options: ICommonReplaceOptions
  public isVue3: boolean
  public isVue2: boolean
  public isReact: boolean
  constructor(framework: string = 'react', options: ICommonReplaceOptions = { keepEOL: true }) {
    this.isVue3 = framework === 'vue3'
    this.isVue2 = framework === 'vue' || framework === 'vue2'
    this.isReact = framework === 'react'
    this.startFlag = false
    this.options = options
  }

  start(node: Node) {
    this.startFlag = true
    this.classObjectNode = node
  }

  end() {
    this.startFlag = false
    this.classObjectNode = null
  }

  transform(path: NodePath<Node>) {
    const { isVue2, isVue3, isReact, startFlag, classObjectNode, options } = this
    if (isVue2) {
      if (isSpecNode(path.node)) {
        const [result, node] = vue2Matcher(path.node as UserMatchNode)
        if (result) {
          return this.start(node)
        }
      }

      if (startFlag) {
        const nodeStart = path.node.start as number
        const refNode = classObjectNode as Node
        if (nodeStart > (refNode.end as number)) {
          return this.end()
        }
        if (nodeStart >= (refNode.start as number)) {
          if (path.node.type === 'StringLiteral') {
            // TODO
            // 现在这样是有个问题的,变量中用户使用了 'a/s' 就会产生破坏效果
            path.node.value = replaceWxml(path.node.value, options)
          }
        }
      }
    } else if (isVue3) {
      // TODO
      if (path.node.type === 'StringLiteral') {
        path.node.value = templeteHandler(path.node.value)
      }
      // createElementVNode
      if (isVue3SpecNode(path.node) && vue3Matcher(path.node as UserMatchNode)) {
        return this.start(path.node)
      }

      if (startFlag) {
        const nodeStart = path.node.start as number
        const refNode = classObjectNode as Node
        if (nodeStart > (refNode.end as number)) {
          return this.end()
        }
        if (nodeStart >= (refNode.start as number)) {
          if (path.node.type === 'StringLiteral') {
            path.node.value = replaceWxml(path.node.value, options)
          }
        }
      }
    } else if (isReact) {
      // react
      if (isSpecNode(path.node) && reactMatcher(path.node as UserMatchNode)) {
        return this.start(path.node)
      }

      if (startFlag) {
        if ((path.node.start as number) > ((classObjectNode as Node).end as number)) {
          return this.end()
        }
        if (path.node.type === 'StringLiteral') {
          path.node.value = replaceWxml(path.node.value, options)
        }
      }
    }
  }
}

// default react
export function createReplacer(framework: string = 'react', options: ICommonReplaceOptions = { keepEOL: true }): ASTReplacer {
  return new ASTReplacer(framework, options)
}
