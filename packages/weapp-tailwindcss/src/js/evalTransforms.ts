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
  // 优先走 NodePath 的 traverse（测试桩会用到），若因 noScope 缺少作用域报错则降级到手工参数遍历。
  const maybeTraverse = (path as any)?.traverse as ((v: any) => void) | undefined
  if (typeof maybeTraverse === 'function') {
    try {
      return maybeTraverse.call(path, {
        StringLiteral(innerPath: NodePath<StringLiteral>) {
          handleEvalStringLiteral(innerPath, options, updater, handler)
        },
        TemplateElement(innerPath: NodePath<TemplateElement>) {
          handleEvalTemplateElement(innerPath, options, updater, handler)
        },
      })
    }
    catch (error) {
      // 若是因为缺少 scope/parentPath 的错误，则继续走手工参数遍历；其他错误透出。
      const msg = (error as Error)?.message ?? ''
      const scopeError = /pass a scope and parentPath|traversing a Program\/File/i.test(msg)
      if (!scopeError) {
        throw error
      }
    }
  }

  // 手工参数遍历，兼容 NodePath 与测试桩（仅有 node）两种形态。
  const getArgs = (path as any)?.get?.('arguments') as unknown
  if (Array.isArray(getArgs)) {
    for (const arg of getArgs as Array<NodePath<Node>>) {
      if ((arg as any)?.isStringLiteral?.()) {
        handleEvalStringLiteral(arg as unknown as NodePath<StringLiteral>, options, updater, handler)
        continue
      }
      if ((arg as any)?.isTemplateLiteral?.()) {
        for (const quasi of (arg as any).get('quasis') as Array<NodePath<TemplateElement>>) {
          handleEvalTemplateElement(quasi, options, updater, handler)
        }
      }
    }
    return
  }

  // 仅有 AST 节点时的兜底逻辑（为测试桩准备）
  const nodeArgs = (path as any)?.node?.arguments as unknown
  if (Array.isArray(nodeArgs)) {
    for (const n of nodeArgs as any[]) {
      if (n?.type === 'StringLiteral') {
        const stub = {
          node: n as StringLiteral,
          isStringLiteral: () => true,
        } as unknown as NodePath<StringLiteral>
        handleEvalStringLiteral(stub, options, updater, handler)
      }
      else if (n?.type === 'TemplateLiteral' && Array.isArray(n.quasis)) {
        for (const q of n.quasis as any[]) {
          const stub = {
            node: q as TemplateElement,
            isTemplateElement: () => true,
          } as unknown as NodePath<TemplateElement>
          handleEvalTemplateElement(stub, options, updater, handler)
        }
      }
    }
  }
}
