import type { AttributeNode, DirectiveNode, ParentNode } from '@vue/compiler-dom'
import type { SourceMapInput } from 'rollup'
import type { TransformResult } from 'vite'
import type { CreateJsHandlerOptions, ICustomAttributesEntities, JsHandler } from '@/types'
import { NodeTypes, parse as parseTemplate } from '@vue/compiler-dom'
import MagicString from 'magic-string'
import { generateCode, replaceWxml } from '@/wxml'
import { createAttributeMatcher } from '@/wxml/custom-attributes'
import {
  shouldEnableComponentLocalStyle,
  shouldEnablePageLocalStyle,
  UniAppXComponentLocalStyleCollector,
} from './component-local-style'

interface SfcBlock {
  content: string
  start: number
  end: number
  attrs: string
}

interface ParsedSfc {
  template?: SfcBlock & { ast?: ParentNode }
  script?: SfcBlock
  scriptSetup?: SfcBlock
  errors: unknown[]
}

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

function updateStaticAttribute(ms: MagicString, prop: AttributeNode, offset: number, content = prop.value?.content) {
  if (!prop.value) {
    return
  }
  const start = offset + prop.value.loc.start.offset + 1
  const end = offset + prop.value.loc.end.offset - 1
  if (start < end) {
    ms.update(start, end, replaceWxml(content ?? ''))
  }
}

function updateStaticAttributeWithLocalStyle(
  ms: MagicString,
  prop: AttributeNode,
  offset: number,
  collector: UniAppXComponentLocalStyleCollector,
  content = prop.value?.content,
) {
  if (!prop.value) {
    return
  }
  const start = offset + prop.value.loc.start.offset + 1
  const end = offset + prop.value.loc.end.offset - 1
  if (start < end) {
    ms.update(start, end, collector.collectAndRewriteStaticClass(content ?? ''))
  }
}

function updateDirectiveExpression(
  ms: MagicString,
  prop: DirectiveNode,
  offset: number,
  jsHandler: JsHandler,
  runtimeSet?: Set<string>,
) {
  if (prop.exp?.type !== NodeTypes.SIMPLE_EXPRESSION) {
    return
  }
  const expression = prop.exp.content
  const start = offset + prop.exp.loc.start.offset
  const end = offset + prop.exp.loc.end.offset
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
  offset: number,
  jsHandler: JsHandler,
  collector: UniAppXComponentLocalStyleCollector,
  runtimeSet?: Set<string>,
) {
  if (prop.exp?.type !== NodeTypes.SIMPLE_EXPRESSION) {
    return
  }
  const expression = prop.exp.content
  const start = offset + prop.exp.loc.start.offset
  const end = offset + prop.exp.loc.end.offset
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
  enablePageLocalStyle?: boolean
}

function shouldEnableLocalStyle(id: string, options: TransformUVueOptions) {
  if (options.enableComponentLocalStyle && shouldEnableComponentLocalStyle(id)) {
    return true
  }
  if (options.enablePageLocalStyle && shouldEnablePageLocalStyle(id)) {
    return true
  }
  return false
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
const SFC_BLOCK_RE = /<(template|script)\b([^>]*)>([\s\S]*?)<\/\1>/gi
const SCRIPT_SETUP_RE = /(?:^|\s)setup(?:\s|=|$)/

function parseSfc(code: string): ParsedSfc {
  const descriptor: ParsedSfc = { errors: [] }

  for (const match of code.matchAll(SFC_BLOCK_RE)) {
    const type = match[1]
    const attrs = match[2] ?? ''
    const content = match[3] ?? ''
    const full = match[0]
    const blockStart = match.index ?? 0
    const contentStart = blockStart + full.indexOf('>') + 1
    const block: SfcBlock = {
      content,
      start: contentStart,
      end: contentStart + content.length,
      attrs,
    }

    if (type === 'template' && !descriptor.template) {
      try {
        descriptor.template = {
          ...block,
          ast: parseTemplate(content) as ParentNode,
        }
      }
      catch (error) {
        descriptor.errors.push(error)
        descriptor.template = block
      }
      continue
    }

    if (type === 'script') {
      if (SCRIPT_SETUP_RE.test(attrs)) {
        descriptor.scriptSetup ??= block
      }
      else {
        descriptor.script ??= block
      }
    }
  }

  return descriptor
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
  const descriptor = parseSfc(code)
  const localStyleCollector = shouldEnableLocalStyle(id, options)
    ? new UniAppXComponentLocalStyleCollector(id, runtimeSet)
    : undefined
  if (descriptor.errors.length === 0) {
    if (descriptor.template?.ast) {
      const templateOffset = descriptor.template.start
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
            if (shouldHandleDefault && localStyleCollector) {
              updateStaticAttributeWithLocalStyle(ms, prop, templateOffset, localStyleCollector)
            }
            else {
              updateStaticAttribute(ms, prop, templateOffset)
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
            if (attrName.toLowerCase() === 'class' && localStyleCollector) {
              updateDirectiveExpressionWithLocalStyle(
                ms,
                prop,
                templateOffset,
                jsHandler,
                localStyleCollector,
                runtimeSet,
              )
            }
            else {
              updateDirectiveExpression(ms, prop, templateOffset, jsHandler, runtimeSet)
            }
          }
        }
      })
    }

    if (descriptor.script) {
      localStyleCollector?.collectRuntimeClasses(descriptor.script.content)
      const { code } = jsHandler(descriptor.script.content, runtimeSet ?? new Set(), defaultCreateJsHandlerOptions)
      ms.update(
        descriptor.script.start,
        descriptor.script.end,
        localStyleCollector ? localStyleCollector.rewriteTransformedCode(code) : code,
      )
    }
    if (descriptor.scriptSetup) {
      localStyleCollector?.collectRuntimeClasses(descriptor.scriptSetup.content)
      const { code } = jsHandler(descriptor.scriptSetup.content, runtimeSet ?? new Set(), defaultCreateJsHandlerOptions)
      ms.update(
        descriptor.scriptSetup.start,
        descriptor.scriptSetup.end,
        localStyleCollector ? localStyleCollector.rewriteTransformedCode(code) : code,
      )
    }

    if (localStyleCollector?.hasStyles()) {
      ms.append(`\n${localStyleCollector.toStyleBlock()}`)
    }
  }
  const result: TransformResult = {
    code: ms.toString(),
    map: null,
  }

  Object.defineProperty(result, 'map', {
    configurable: true,
    enumerable: true,
    get() {
      return ms.generateMap() as SourceMapInput
    },
  })
  return result
}
