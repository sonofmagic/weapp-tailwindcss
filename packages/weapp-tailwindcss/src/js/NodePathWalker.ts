import type { NodePath } from '@babel/traverse'
import type {
  ArrayExpression,
  BinaryExpression,
  CallExpression,
  ExportAllDeclaration,
  ExportDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  LogicalExpression,
  Node,
  ObjectExpression,
  StringLiteral,
  TemplateElement,
  TemplateLiteral,
  VariableDeclarator,
} from '@babel/types'
import type { ImportToken } from './node-path-walker/import-tokens'
import type { NameMatcher } from '@/utils/nameMatcher'
import { createNameMatcher } from '@/utils/nameMatcher'
import {
  walkExportAllDeclaration,
  walkExportDeclaration,
  walkExportDefaultDeclaration,
  walkExportNamedDeclaration,
} from './node-path-walker/export-handlers'
import { maybeAddImportToken } from './node-path-walker/import-tokens'

export type { ImportToken } from './node-path-walker/import-tokens'

/**
 * 遍历我们关注的调用表达式所关联的绑定，收集后续需要转换的字符串节点。
 */
export class NodePathWalker {
  public ignoreCallExpressionIdentifiers: (string | RegExp)[]
  public callback: (path: NodePath<StringLiteral | TemplateElement>) => void
  public imports: Set<ImportToken>
  private visited: WeakSet<NodePath<Node | null | undefined>>
  private isIgnoredCallIdentifier: NameMatcher

  constructor(
    { ignoreCallExpressionIdentifiers, callback }:
    {
      ignoreCallExpressionIdentifiers?: (string | RegExp)[]
      callback?: (path: NodePath<StringLiteral | TemplateElement>) => void
    } = {},
  ) {
    this.ignoreCallExpressionIdentifiers = ignoreCallExpressionIdentifiers ?? []
    this.callback = callback ?? (() => { })
    this.imports = new Set()
    this.visited = new WeakSet()
    this.isIgnoredCallIdentifier = createNameMatcher(this.ignoreCallExpressionIdentifiers, { exact: true })
  }

  walkVariableDeclarator(path: NodePath<VariableDeclarator>) {
    const init = path.get('init')
    this.walkNode(init)
  }

  walkTemplateLiteral(path: NodePath<TemplateLiteral>) {
    for (const exp of path.get('expressions')) {
      this.walkNode(exp)
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
    this.walkNode(left)
    const right = path.get('right')
    this.walkNode(right)
  }

  walkLogicalExpression(path: NodePath<LogicalExpression>) {
    const left = path.get('left')
    this.walkNode(left)
    const right = path.get('right')
    this.walkNode(right)
  }

  walkObjectExpression(path: NodePath<ObjectExpression>) {
    const props = path.get('properties')

    for (const prop of props) {
      if (prop.isObjectProperty()) {
        const key = prop.get('key')
        this.walkNode(key)
        const value = prop.get('value')
        this.walkNode(value)
      }
    }
  }

  walkArrayExpression(path: NodePath<ArrayExpression>) {
    const elements = path.get('elements')
    for (const element of elements) {
      this.walkNode(element)
    }
  }

  walkNode(arg: NodePath<Node | null | undefined>) {
    if (this.visited.has(arg)) {
      return
    }
    this.visited.add(arg)
    // 回溯标识符绑定，便于发现嵌套模板
    if (arg.isIdentifier()) {
      const binding = (arg as any)?.scope?.getBinding?.(arg.node.name)
      if (binding) {
        this.walkNode(binding.path)
      }
    }
    else if (arg.isMemberExpression()) {
      const objectPath = arg.get('object')
      if (objectPath.isIdentifier()) {
        const binding = (arg as any)?.scope?.getBinding?.(objectPath.node.name)
        if (binding) {
          if (binding.path.isVariableDeclarator()) {
            this.walkVariableDeclarator(binding.path)
          }
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
    else if (arg.isVariableDeclarator()) {
      this.walkVariableDeclarator(arg)
    }
    else if (maybeAddImportToken(this.imports, arg)) {
      // Token is recorded via helper; nothing else to traverse.
    }
  }

  /**
   * Walk the arguments of a desired call expression so their bindings can be analysed.
   */
  walkCallExpression(path: NodePath<CallExpression>) {
    const calleePath = path.get('callee')
    if (
      calleePath.isIdentifier()
      && this.isIgnoredCallIdentifier(calleePath.node.name)) {
      // We only follow arguments for call expressions that match the allow list.
      for (const arg of path.get('arguments')) {
        this.walkNode(arg)
      }
    }
  }

  walkExportDeclaration(path: NodePath<ExportDeclaration>) {
    walkExportDeclaration(this, path)
  }

  walkExportNamedDeclaration(path: NodePath<ExportNamedDeclaration>) {
    walkExportNamedDeclaration(this, path)
  }

  walkExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
    walkExportDefaultDeclaration(this, path)
  }

  walkExportAllDeclaration(path: NodePath<ExportAllDeclaration>) {
    walkExportAllDeclaration(this, path)
  }
}
