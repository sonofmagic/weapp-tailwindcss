import type { AttributeNode, DirectiveNode, ParentNode } from '@vue/compiler-dom'
import type { JsHandler } from '@/types'
import { NodeTypes } from '@vue/compiler-dom'
import MagicString from 'magic-string'
import { parse } from 'vue/compiler-sfc'
import { generateCode, replaceWxml } from '@/wxml'

function traverse(node: ParentNode, visitor: (node: ParentNode) => void): void {
  visitor(node)
  if (node.children) {
    node.children.forEach((child: any) => traverse(child, visitor))
  }
}

export function transformUVue(code: string, id: string, jsHandler: JsHandler, runtimeSet?: Set<string>) {
  if (!/\.uvue(?:\?.*)?$/.test(id)) {
    return
  }
  const ms = new MagicString(code)
  const { descriptor, errors } = parse(code)
  if (errors.length === 0) {
    if (descriptor.template) {
      function extractClassNames(node: ParentNode): void {
        if (node.type === NodeTypes.ELEMENT) {
          node.props.forEach((prop: AttributeNode | DirectiveNode) => {
          // 静态 class
            if (prop.type === NodeTypes.ATTRIBUTE && prop.name === 'class' && prop.value) {
              ms.update(prop.value.loc.start.offset + 1, prop.value.loc.end.offset - 1, replaceWxml(prop.value.content))
            }

            // 动态 class（如 :class="..."）
            if (prop.type === NodeTypes.DIRECTIVE && prop.name === 'bind' && prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION && prop.arg.content === 'class') {
              if (prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION) {
                const code = generateCode(prop.exp.content, {
                  jsHandler,
                  runtimeSet,
                })
                ms.update(prop.exp.loc.start.offset, prop.exp.loc.end.offset, code)
              }
            }
          })
        }
      }
      traverse(descriptor.template.ast!, extractClassNames)
    }
    if (descriptor.script) {
      const { code } = jsHandler(descriptor.script.content, runtimeSet ?? new Set(), {})
      ms.update(descriptor.script.loc.start.offset, descriptor.script.loc.end.offset, code)
    }
    if (descriptor.scriptSetup) {
      const { code } = jsHandler(descriptor.scriptSetup.content, runtimeSet ?? new Set(), {})
      ms.update(descriptor.scriptSetup.loc.start.offset, descriptor.scriptSetup.loc.end.offset, code)
    }
  }
  return ms.toString()
}
