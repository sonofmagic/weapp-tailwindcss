import type { NodePath } from '@babel/traverse'
import type {
  ArrayExpression,
  BinaryExpression,
  CallExpression,
  ExportAllDeclaration,
  ExportDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  LogicalExpression,
  Node,
  ObjectExpression,
  StringLiteral,
  TemplateElement,
  TemplateLiteral,
  VariableDeclarator,
} from '@babel/types'
import { regExpTest } from '@/utils'

export interface ImportToken {
  declaration: NodePath<ImportDeclaration | ExportAllDeclaration>
  specifier?: NodePath<ImportSpecifier | ImportDefaultSpecifier>
  imported?: string
  source: string
}

// export interface ExportToken {

// }
// | {
//   declaration: NodePath<ImportDefaultSpecifier>
//   specifier: NodePath<ImportSpecifier>
//   source: string
// }
// NodePath<Node>
export const walkedBindingWeakMap = new WeakMap<NodePath<Node | null | undefined>, boolean>()

export class NodePathWalker {
  public ignoreCallExpressionIdentifiers: (string | RegExp)[]
  public callback: (path: NodePath<StringLiteral | TemplateElement>) => void
  public imports: Set<ImportToken>
  // public exports: ExportToken[]

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
  }

  walkVariableDeclarator(path: NodePath<VariableDeclarator>) {
    const init = path.get('init')
    this.composeWalk(init)
  }

  walkTemplateLiteral(path: NodePath<TemplateLiteral>) {
    for (const exp of path.get('expressions')) {
      this.composeWalk(exp)
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
        const value = prop.get('value')
        this.composeWalk(value)
      }
    }
  }

  walkArrayExpression(path: NodePath<ArrayExpression>) {
    const elements = path.get('elements')
    for (const element of elements) {
      this.composeWalk(element)
    }
  }

  composeWalk(arg: NodePath<Node | null | undefined>) {
    if (walkedBindingWeakMap.get(arg)) {
      return
    }
    walkedBindingWeakMap.set(arg, true)
    if (arg.isIdentifier()) {
      const binding = arg.scope.getBinding(arg.node.name)
      if (binding) {
        this.composeWalk(binding.path)
      }
    }
    else if (arg.isMemberExpression()) {
      const objectPath = arg.get('object')
      if (objectPath.isIdentifier()) {
        const binding = arg.scope.getBinding(objectPath.node.name)
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
    else if (
      (arg.isImportSpecifier() && arg.node.importKind !== 'type')
      || arg.isImportDefaultSpecifier()
    ) {
      const importDeclaration = arg.parentPath
      if (importDeclaration.isImportDeclaration() && importDeclaration.node.importKind !== 'type') {
        if (arg.isImportSpecifier()) {
          const imported = arg.get('imported')
          if (imported.isIdentifier()) {
            this.imports.add(
              {
                declaration: importDeclaration,
                specifier: arg,
                imported: imported.node.name,
                source: importDeclaration.node.source.value,
              },
            )
          }
        }
        else if (arg.isImportDefaultSpecifier()) {
          this.imports.add(
            {
              declaration: importDeclaration,
              specifier: arg,
              source: importDeclaration.node.source.value,
            },
          )
        }
      }
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

  walkExportDeclaration(path: NodePath<ExportDeclaration>) {
    if (path.isExportDeclaration()) {
      if (path.isExportNamedDeclaration()) {
        this.walkExportNamedDeclaration(path)
      }
      else if (path.isExportDefaultDeclaration()) {
        this.walkExportDefaultDeclaration(path)
      }
      else if (path.isExportAllDeclaration()) {
        this.walkExportAllDeclaration(path)
      }
    }
  }

  walkExportNamedDeclaration(path: NodePath<ExportNamedDeclaration>) {
    const declaration = path.get('declaration')
    if (declaration.isVariableDeclaration()) {
      for (const decl of declaration.get('declarations')) {
        this.composeWalk(decl)
      }
    }
    const specifiers = path.get('specifiers')
    for (const spec of specifiers) {
      if (spec.isExportSpecifier()) {
        const local = spec.get('local')
        if (local.isIdentifier()) {
          this.composeWalk(local)
        }
      }
    }
  }

  walkExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
    const decl = path.get('declaration')
    if (decl.isIdentifier()) {
      this.composeWalk(decl)
    }
  }

  walkExportAllDeclaration(path: NodePath<ExportAllDeclaration>) {
    const source = path.get('source')
    if (source.isStringLiteral()) {
      this.imports.add(
        {
          declaration: path,
          source: source.node.value,
        },
      )
    }
  }
}
