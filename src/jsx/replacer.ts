import type { Node, ObjectProperty, Identifier, StringLiteral } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import { replaceWxml, templeteHandler } from '@/wxml'
import { ICommonReplaceOptions } from '@/types'

export type UserMatchNode = ObjectProperty & { key: Identifier }

function isSpecNode (node: Node) {
  return node.type === 'ObjectProperty' && node.key.type === 'Identifier'
}

function reactMatcher (node: UserMatchNode) {
  // rax ->class and className, taro 为 hoverClass remax 为 hoverClassName
  //  node.key.name === 'class' || node.key.name === 'className' || node.key.name === 'hoverClass' || node.key.name === 'hover-class' || node.key.name === 'hoverClassName'
  return ['className', 'hoverClass', 'hoverClassName'].includes(node.key.name)
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

export class ASTReplacer {
  public classObjectNode?: Node | null
  public startFlag: boolean
  public options: ICommonReplaceOptions
  public isVue3: boolean
  public isVue2: boolean
  public isReact: boolean
  constructor (framework: string = 'react', options: ICommonReplaceOptions = { keepEOL: true }) {
    this.isVue3 = framework === 'vue3'
    this.isVue2 = framework === 'vue' || framework === 'vue2'
    this.isReact = framework === 'react'
    this.startFlag = false
    this.options = options
  }

  start (node: Node) {
    this.startFlag = true
    this.classObjectNode = node
  }

  end () {
    this.startFlag = false
    this.classObjectNode = null
  }

  transform (path: NodePath<Node>) {
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
            path.node.value = replaceWxml(path.node.value, {
              keepEOL: true
            })
          }
        }
      }
    } else if (isVue3) {
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
            path.node.value = replaceWxml(path.node.value, {
              keepEOL: true
            })
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
          path.node.value = replaceWxml(path.node.value, {
            keepEOL: true,
            classGenerator: options.classGenerator
          })
        }
      }
    }
  }
}

// default react
export function createReplacer (framework: string = 'react', options: ICommonReplaceOptions = { keepEOL: true }): ASTReplacer {
  return new ASTReplacer(framework, options)
}
