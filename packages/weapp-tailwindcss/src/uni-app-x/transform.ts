import type { AttributeNode, DirectiveNode, ParentNode } from '@vue/compiler-dom'
import type { TransformResult } from 'vite'
import type { CreateJsHandlerOptions, ICustomAttributesEntities, JsHandler } from '@/types'
import { NodeTypes } from '@vue/compiler-dom'
import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { generateCode, replaceWxml } from '@/wxml'
import { createAttributeMatcher } from '@/wxml/custom-attributes'

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

function updateStaticAttribute(ms: MagicString, prop: AttributeNode) {
  if (!prop.value) {
    return
  }
  const start = prop.value.loc.start.offset + 1
  const end = prop.value.loc.end.offset - 1
  if (start < end) {
    ms.update(start, end, replaceWxml(prop.value.content))
  }
}

function updateDirectiveExpression(ms: MagicString, prop: DirectiveNode, jsHandler: JsHandler, runtimeSet?: Set<string>) {
  if (prop.exp?.type !== NodeTypes.SIMPLE_EXPRESSION) {
    return
  }
  const start = prop.exp.loc.start.offset
  const end = prop.exp.loc.end.offset
  if (start >= end) {
    return
  }
  const generated = generateCode(prop.exp.content, {
    jsHandler,
    runtimeSet,
    wrapExpression: true,
  })
  ms.update(start, end, generated)
}

interface TransformUVueOptions {
  customAttributesEntities?: ICustomAttributesEntities
  disabledDefaultTemplateHandler?: boolean
}

function shouldHandleAttribute(
  tag: string,
  attrName: string,
  disabledDefaultTemplateHandler: boolean,
  matchCustomAttribute?: ReturnType<typeof createAttributeMatcher>,
) {
  const lowerName = attrName.toLowerCase()
  const shouldHandleDefault = !disabledDefaultTemplateHandler && lowerName === 'class'
  const shouldHandleCustom = matchCustomAttribute?.(tag, attrName) ?? false
  return {
    shouldHandleDefault,
    shouldHandleCustom,
    shouldHandle: shouldHandleDefault || shouldHandleCustom,
  }
}

const defaultCreateJsHandlerOptions: CreateJsHandlerOptions = {
  babelParserOptions: {
    plugins: [
      'typescript',
    ],
  },
}
export function transformUVue(
  code: string,
  id: string,
  jsHandler: JsHandler,
  runtimeSet?: Set<string>,
  options: TransformUVueOptions = {},
): undefined | TransformResult {
  if (!/\.(?:uvue|nvue)(?:\?.*)?$/.test(id)) {
    return
  }
  const { customAttributesEntities, disabledDefaultTemplateHandler = false } = options
  const matchCustomAttribute = createAttributeMatcher(customAttributesEntities)
  const ms = new MagicString(code)
  const { descriptor, errors } = parse(code)
  if (errors.length === 0) {
    if (descriptor.template?.ast) {
      traverse(descriptor.template.ast, (node) => {
        if (node.type !== NodeTypes.ELEMENT) {
          return
        }
        const tag = node.tag
        for (const prop of node.props) {
          if (prop.type === NodeTypes.ATTRIBUTE) {
            const { shouldHandle, shouldHandleDefault } = shouldHandleAttribute(
              tag,
              prop.name,
              disabledDefaultTemplateHandler,
              matchCustomAttribute,
            )
            if (!shouldHandle) {
              continue
            }
            updateStaticAttribute(ms, prop)
            if (shouldHandleDefault) {
              continue
            }
          }
          else if (
            prop.type === NodeTypes.DIRECTIVE
            && prop.name === 'bind'
            && prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION
            && prop.arg.isStatic
          ) {
            const attrName = prop.arg.content
            const { shouldHandle } = shouldHandleAttribute(
              tag,
              attrName,
              disabledDefaultTemplateHandler,
              matchCustomAttribute,
            )
            if (!shouldHandle) {
              continue
            }
            updateDirectiveExpression(ms, prop, jsHandler, runtimeSet)
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
