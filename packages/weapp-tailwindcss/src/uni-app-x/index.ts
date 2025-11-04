import type { AttributeNode, DirectiveNode, ParentNode } from '@vue/compiler-dom'
import type { TransformResult } from 'vite'
import type { CreateJsHandlerOptions, JsHandler } from '@/types'
import { NodeTypes } from '@vue/compiler-dom'
import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { generateCode, replaceWxml } from '@/wxml'

function traverse(node: ParentNode, visitor: (node: ParentNode) => void): void {
  visitor(node)
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === 'object' && 'type' in child) {
        traverse(child as ParentNode, visitor)
      }
    }
  }
}

function createClassAttributeUpdater(ms: MagicString) {
  return (prop: AttributeNode) => {
    if (prop.value) {
      ms.update(prop.value.loc.start.offset + 1, prop.value.loc.end.offset - 1, replaceWxml(prop.value.content))
    }
  }
}

function createClassDirectiveUpdater(ms: MagicString, jsHandler: JsHandler, runtimeSet?: Set<string>) {
  return (prop: DirectiveNode) => {
    if (prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION && prop.arg.content === 'class' && prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION) {
      const generated = generateCode(prop.exp.content, {
        jsHandler,
        runtimeSet,
        wrapExpression: true,
      })
      ms.update(prop.exp.loc.start.offset, prop.exp.loc.end.offset, generated)
    }
  }
}

const defaultCreateJsHandlerOptions: CreateJsHandlerOptions = {
  babelParserOptions: {
    plugins: [
      'typescript',
    ],
  },
}
export function transformUVue(code: string, id: string, jsHandler: JsHandler, runtimeSet?: Set<string>): undefined | TransformResult {
  if (!/\.uvue(?:\?.*)?$/.test(id)) {
    return
  }
  const ms = new MagicString(code)
  const { descriptor, errors } = parse(code)
  if (errors.length === 0) {
    if (descriptor.template?.ast) {
      const updateStaticClass = createClassAttributeUpdater(ms)
      const updateDynamicClass = createClassDirectiveUpdater(ms, jsHandler, runtimeSet)
      traverse(descriptor.template.ast, (node) => {
        if (node.type !== NodeTypes.ELEMENT) {
          return
        }
        for (const prop of node.props) {
          if (prop.type === NodeTypes.ATTRIBUTE && prop.name === 'class') {
            updateStaticClass(prop)
          }
          else if (prop.type === NodeTypes.DIRECTIVE && prop.name === 'bind') {
            updateDynamicClass(prop)
          }
        }
      })
    }

    if (descriptor.script) {
      const { code } = jsHandler(descriptor.script.content, runtimeSet ?? new Set(), defaultCreateJsHandlerOptions)
      ms.update(descriptor.script.loc.start.offset, descriptor.script.loc.end.offset, code)
    }
    if (descriptor.scriptSetup) {
      const { code } = jsHandler(descriptor.scriptSetup.content, runtimeSet ?? new Set(), defaultCreateJsHandlerOptions)
      ms.update(descriptor.scriptSetup.loc.start.offset, descriptor.scriptSetup.loc.end.offset, code)
    }
  }
  return {
    code: ms.toString(),
    // @ts-ignore
    get map() {
      return ms.generateMap()
    },
  }
}
