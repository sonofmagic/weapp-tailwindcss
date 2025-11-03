import type { NodePath } from '@babel/traverse'
import type { CallExpression, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { JsTokenUpdater } from './JsTokenUpdater'
import type { JsToken } from './types'
import { jsStringEscape } from '@ast-core/escape'

export type EvalHandler = (source: string, opts: IJsHandlerOptions) => JsHandlerResult

export function isEvalPath(path: NodePath<Node>) {
  if (path.isCallExpression()) {
    const calleePath = path.get('callee')
    return calleePath.isIdentifier({ name: 'eval' })
  }
  return false
}

function createEvalReplacementToken(
  path: NodePath<StringLiteral | TemplateElement>,
  updated: string,
): JsToken | undefined {
  const node = path.node

  let offset = 0
  let original: string
  if (path.isStringLiteral()) {
    offset = 1
    original = path.node.value
  }
  else if (path.isTemplateElement()) {
    original = path.node.value.raw
  }
  else {
    original = ''
  }

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    return undefined
  }

  const start = node.start + offset
  const end = node.end - offset
  if (start >= end) {
    return undefined
  }

  if (original === updated) {
    return undefined
  }

  const value = path.isStringLiteral() ? jsStringEscape(updated) : updated

  return {
    start,
    end,
    value,
    path,
  }
}

function handleEvalStringLiteral(
  path: NodePath<StringLiteral>,
  options: IJsHandlerOptions,
  updater: JsTokenUpdater,
  handler: EvalHandler,
) {
  const { code } = handler(path.node.value, {
    ...options,
    needEscaped: false,
    generateMap: false,
  })

  if (!code) {
    return
  }

  const token = createEvalReplacementToken(path, code)
  if (token) {
    updater.addToken(token)
  }
}

function handleEvalTemplateElement(
  path: NodePath<TemplateElement>,
  options: IJsHandlerOptions,
  updater: JsTokenUpdater,
  handler: EvalHandler,
) {
  const { code } = handler(path.node.value.raw, {
    ...options,
    generateMap: false,
  })

  if (!code) {
    return
  }

  const token = createEvalReplacementToken(path, code)
  if (token) {
    updater.addToken(token)
  }
}

export function walkEvalExpression(
  path: NodePath<CallExpression>,
  options: IJsHandlerOptions,
  updater: JsTokenUpdater,
  handler: EvalHandler,
) {
  path.traverse({
    StringLiteral(innerPath) {
      handleEvalStringLiteral(innerPath, options, updater, handler)
    },
    TemplateElement(innerPath) {
      handleEvalTemplateElement(innerPath, options, updater, handler)
    },
  })
}
