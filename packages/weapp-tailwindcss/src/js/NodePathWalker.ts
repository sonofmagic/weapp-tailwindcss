import type { NodePath } from '@babel/traverse'
import type { ArgumentPlaceholder, ArrayExpression, BinaryExpression, CallExpression, Expression, LogicalExpression, ObjectExpression, SpreadElement, StringLiteral, TemplateElement, TemplateLiteral, VariableDeclarator } from '@babel/types'
import { regExpTest } from '@/utils'

export class NodePathWalker {
  public ignoreCallExpressionIdentifiers: (string | RegExp)[]
  public callback: (path: NodePath<StringLiteral | TemplateElement>) => void
  constructor(
    { ignoreCallExpressionIdentifiers, callback }:
    {
      ignoreCallExpressionIdentifiers?: (string | RegExp)[]
      callback?: (path: NodePath<StringLiteral | TemplateElement>) => void
    } = {},
  ) {
    this.ignoreCallExpressionIdentifiers = ignoreCallExpressionIdentifiers ?? []
    this.callback = callback ?? (() => {})
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

  walkTemplateLiteral(path: NodePath<TemplateLiteral>) {
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
    for (const quasis of path.get('quasis')) {
      this.callback(quasis)
    }
  }

  walkStringLiteral(path: NodePath<StringLiteral>) {
    this.callback(path)
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

  walkLogicalExpression(path: NodePath<LogicalExpression>) {
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
    else if (left.isLogicalExpression()) {
      this.walkLogicalExpression(left)
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
    else if (right.isLogicalExpression()) {
      this.walkLogicalExpression(right)
    }
  }

  walkObjectExpression(path: NodePath<ObjectExpression>) {
    const props = path.get('properties')

    for (const prop of props) {
      if (prop.isObjectProperty()) {
        const key = prop.get('key')
        if (key) {
          if (key.isStringLiteral()) {
            this.walkStringLiteral(key)
          }
          else if (key.isTemplateLiteral()) {
            this.walkTemplateLiteral(key)
          }
        }
      }
    }
  }

  walkArrayExpression(path: NodePath<ArrayExpression>) {
    const elements = path.get('elements')
    for (const element of elements) {
      this.composeWalk(element)
    }
  }

  composeWalk(arg: NodePath<ArgumentPlaceholder | SpreadElement | Expression | null>) {
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
    else if (arg.isBinaryExpression()) {
      this.walkBinaryExpression(arg)
    }
    else if (arg.isLogicalExpression()) {
      this.walkLogicalExpression(arg)
    }
    else if (arg.isObjectExpression()) {
      this.walkObjectExpression(arg)
    }
    else if (arg.isArrayExpression()) {
      this.walkArrayExpression(arg)
    }
  }

  walkCallExpression(path: NodePath<CallExpression>) {
    const calleePath = path.get('callee')
    if (
      calleePath.isIdentifier()
      && regExpTest(this.ignoreCallExpressionIdentifiers, calleePath.node.name, {
        exact: true,
      })) {
      for (const arg of path.get('arguments')) {
        this.composeWalk(arg)
      }
    }
  }
}
