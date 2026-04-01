import type { AttributeNode, DirectiveNode, ElementNode, ParentNode } from '@vue/compiler-dom'
import type { TransformResult } from 'vite'
import type { CreateJsHandlerOptions, ICustomAttributesEntities, JsHandler } from '@/types'
import { NodeTypes } from '@vue/compiler-dom'
import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { generateCode, replaceWxml } from '@/wxml'
import { createAttributeMatcher } from '@/wxml/custom-attributes'
import { shouldEnableComponentLocalStyle, UniAppXComponentLocalStyleCollector } from './component-local-style'
import { UniAppXSpaceStyleCollector } from './space-style'

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

function updateStaticAttribute(ms: MagicString, prop: AttributeNode, content = prop.value?.content) {
  if (!prop.value) {
    return
  }
  const start = prop.value.loc.start.offset + 1
  const end = prop.value.loc.end.offset - 1
  if (start < end) {
    ms.update(start, end, replaceWxml(content ?? ''))
  }
}

function updateStaticAttributeWithLocalStyle(
  ms: MagicString,
  prop: AttributeNode,
  collector: UniAppXComponentLocalStyleCollector,
  content = prop.value?.content,
) {
  if (!prop.value) {
    return
  }
  const start = prop.value.loc.start.offset + 1
  const end = prop.value.loc.end.offset - 1
  if (start < end) {
    ms.update(start, end, collector.collectAndRewriteStaticClass(content ?? ''))
  }
}

function updateDirectiveExpression(
  ms: MagicString,
  prop: DirectiveNode,
  jsHandler: JsHandler,
  runtimeSet?: Set<string>,
  expression = prop.exp?.content,
) {
  if (prop.exp?.type !== NodeTypes.SIMPLE_EXPRESSION || expression === undefined) {
    return
  }
  const start = prop.exp.loc.start.offset
  const end = prop.exp.loc.end.offset
  if (start >= end) {
    return
  }
  const generated = generateCode(expression, {
    jsHandler,
    runtimeSet,
    wrapExpression: true,
  })
  ms.update(start, end, generated)
}

function updateDirectiveExpressionWithLocalStyle(
  ms: MagicString,
  prop: DirectiveNode,
  jsHandler: JsHandler,
  collector: UniAppXComponentLocalStyleCollector,
  runtimeSet?: Set<string>,
  expression = prop.exp?.content,
) {
  if (prop.exp?.type !== NodeTypes.SIMPLE_EXPRESSION || expression === undefined) {
    return
  }
  const start = prop.exp.loc.start.offset
  const end = prop.exp.loc.end.offset
  if (start >= end) {
    return
  }
  collector.collectRuntimeClasses(expression, {
    wrapExpression: true,
  })
  const generated = generateCode(expression, {
    jsHandler,
    runtimeSet,
    wrapExpression: true,
  })
  ms.update(start, end, collector.rewriteTransformedCode(generated, { wrapExpression: true }))
}

interface TransformUVueOptions {
  customAttributesEntities?: ICustomAttributesEntities
  disabledDefaultTemplateHandler?: boolean
  enableComponentLocalStyle?: boolean
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
const UVUE_NVUE_RE = /\.(?:uvue|nvue)(?:\?.*)?$/

function insertClassAttribute(ms: MagicString, node: ElementNode, className: string) {
  const insertOffset = node.loc.start.offset + 1 + node.tag.length
  ms.appendLeft(insertOffset, ` class="${className}"`)
}

export function transformUVue(
  code: string,
  id: string,
  jsHandler: JsHandler,
  runtimeSet?: Set<string>,
  options: TransformUVueOptions = {},
): undefined | TransformResult {
  if (!UVUE_NVUE_RE.test(id)) {
    return
  }
  const { customAttributesEntities, disabledDefaultTemplateHandler = false } = options
  const matchCustomAttribute = createAttributeMatcher(customAttributesEntities)
  const ms = new MagicString(code)
  const { descriptor, errors } = parse(code)
  const spaceStyleCollector = new UniAppXSpaceStyleCollector(id)
  const localStyleCollector = options.enableComponentLocalStyle && shouldEnableComponentLocalStyle(id)
    ? new UniAppXComponentLocalStyleCollector(id, runtimeSet)
    : undefined
  if (errors.length === 0) {
    if (descriptor.template?.ast) {
      traverse(descriptor.template.ast, (node) => {
        if (node.type === NodeTypes.ELEMENT) {
          spaceStyleCollector.collect(node)
        }
      })

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
            const staticClassRewrite = shouldHandleDefault
              ? spaceStyleCollector.getStaticClassRewrite(prop)
              : undefined
            if (shouldHandleDefault && localStyleCollector) {
              updateStaticAttributeWithLocalStyle(ms, prop, localStyleCollector, staticClassRewrite)
            }
            else {
              updateStaticAttribute(ms, prop, staticClassRewrite)
            }
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
            const directiveExpressionRewrite = attrName.toLowerCase() === 'class'
              ? spaceStyleCollector.getDirectiveExpressionRewrite(prop)
              : undefined
            if (attrName.toLowerCase() === 'class' && localStyleCollector) {
              updateDirectiveExpressionWithLocalStyle(
                ms,
                prop,
                jsHandler,
                localStyleCollector,
                runtimeSet,
                directiveExpressionRewrite,
              )
            }
            else {
              updateDirectiveExpression(ms, prop, jsHandler, runtimeSet, directiveExpressionRewrite)
            }
          }
        }

        const insertedClass = spaceStyleCollector.getInsertedClass(node)
        if (insertedClass) {
          insertClassAttribute(ms, node, insertedClass)
        }
      })
    }

    if (descriptor.script) {
      localStyleCollector?.collectRuntimeClasses(descriptor.script.content)
      const { code } = jsHandler(descriptor.script.content, runtimeSet ?? new Set(), defaultCreateJsHandlerOptions)
      ms.update(
        descriptor.script.loc.start.offset,
        descriptor.script.loc.end.offset,
        localStyleCollector ? localStyleCollector.rewriteTransformedCode(code) : code,
      )
    }
    if (descriptor.scriptSetup) {
      localStyleCollector?.collectRuntimeClasses(descriptor.scriptSetup.content)
      const { code } = jsHandler(descriptor.scriptSetup.content, runtimeSet ?? new Set(), defaultCreateJsHandlerOptions)
      ms.update(
        descriptor.scriptSetup.loc.start.offset,
        descriptor.scriptSetup.loc.end.offset,
        localStyleCollector ? localStyleCollector.rewriteTransformedCode(code) : code,
      )
    }

    if (localStyleCollector?.hasStyles()) {
      ms.append(`\n${localStyleCollector.toStyleBlock()}`)
    }
    if (spaceStyleCollector.hasStyles()) {
      ms.append(`\n${spaceStyleCollector.toStyleBlock()}`)
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
