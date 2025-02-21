import type { NodePath } from '@babel/traverse'
import type { BinaryExpression, CallExpression, StringLiteral, TemplateLiteral, VariableDeclarator } from '@babel/types'
import type MagicString from 'magic-string'
import type { JsToken, JsTokenMeta } from './types'
import { regExpTest } from '@/utils'

export class JsTokenUpdater {
  public value: JsToken[]
  public ignoreCallExpressionIdentifiers: (string | RegExp)[]
  constructor(
    { value, ignoreCallExpressionIdentifiers }:
    { value?: JsToken[], ignoreCallExpressionIdentifiers?: (string | RegExp)[] } = {},
  ) {
    this.value = value ?? []
    this.ignoreCallExpressionIdentifiers = ignoreCallExpressionIdentifiers ?? []
  }

  addToken(token?: JsToken) {
    if (token) {
      this.value.push(token)
    }
  }

  walkVariableDeclarator(path: NodePath<VariableDeclarator>) {
    const init = path.get('init')
    if (init.isStringLiteral()) {
      this.walkStringLiteral(init)
    }
    else if (init.isBinaryExpression()) {
      this.walkBinaryExpression(init)
    }
    else if (init.isTemplateLiteral()) {
      this.walkTemplateLiteral(init)
    }
  }

  walkTemplateLiteral(path: NodePath<TemplateLiteral>, meta?: JsTokenMeta) {
    const { node } = path
    for (const exp of path.get('expressions')) {
      if (exp.isIdentifier()) {
        const binding = path.scope.getBinding(exp.node.name)
        if (binding) {
          if (binding.path.isVariableDeclarator()) {
            this.walkVariableDeclarator(binding.path)
          }
        }
      }
    }
    for (const quasis of node.quasis) {
      if (quasis.start && quasis.end && quasis.value.cooked) {
        this.addToken({
          start: quasis.start,
          end: quasis.end,
          value: quasis.value.cooked,
          type: 'TemplateElement',
          meta,
          ast: quasis,
        })
      }
    }
  }

  walkStringLiteral(path: NodePath<StringLiteral>, meta?: JsTokenMeta) {
    const { node } = path
    if (node.start && node.end) {
      this.addToken({
        start: node.start + 1,
        end: node.end - 1,
        value: node.value,
        type: 'StringLiteral',
        meta,
        ast: node,
      })
    }
  }

  walkBinaryExpression(path: NodePath<BinaryExpression>) {
    const left = path.get('left')
    if (left.isStringLiteral()) {
      this.walkStringLiteral(left)
    }
    else if (left.isBinaryExpression()) {
      this.walkBinaryExpression(left) // 递归
    }
    else if (left.isTemplateLiteral()) {
      this.walkTemplateLiteral(left)
    }
    const right = path.get('right')
    if (right.isStringLiteral()) {
      this.walkStringLiteral(right)
    }
    else if (right.isBinaryExpression(right)) {
      this.walkBinaryExpression(right) // 递归
    }
    else if (right.isTemplateLiteral()) {
      this.walkTemplateLiteral(right)
    }
  }

  walkCallExpression(path: NodePath<CallExpression>) {
    const calleePath = path.get('callee')
    if (
      calleePath.isIdentifier()
      && regExpTest(this.ignoreCallExpressionIdentifiers, calleePath.node.name)) {
      for (const arg of path.get('arguments')) {
        if (arg.isIdentifier()) {
          const binding = arg.scope.getBinding(arg.node.name)
          if (binding) {
            if (binding.path.isVariableDeclarator()) {
              this.walkVariableDeclarator(binding.path)
            }
          }
        }
        else if (arg.isTemplateLiteral()) {
          this.walkTemplateLiteral(arg)
        }
        else if (arg.isStringLiteral()) {
          this.walkStringLiteral(arg)
        }
      }
    }
  }

  map(callbackfn: (value: JsToken, index: number, array: JsToken[]) => JsToken) {
    this.value = this.value.map(callbackfn)
    return this
  }

  filter(callbackfn: (value: JsToken, index: number, array: JsToken[]) => unknown) {
    this.value = this.value.filter(callbackfn)
    return this
  }

  updateMagicString(ms: MagicString) {
    for (const { start, end, value } of this.value) {
      ms.update(start, end, value)
    }
    return ms
  }
}
