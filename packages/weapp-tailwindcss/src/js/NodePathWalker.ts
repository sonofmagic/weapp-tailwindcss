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
import type { NameMatcher } from '@/utils/nameMatcher'
import { createNameMatcher } from '@/utils/nameMatcher'

export interface ImportSpecifierImportToken {
  declaration: NodePath<ImportDeclaration>
  specifier: NodePath<ImportSpecifier>
  local: string
  imported: string
  source: string
  type: 'ImportSpecifier'
}

export interface ImportDefaultSpecifierImportToken {
  declaration: NodePath<ImportDeclaration>
  specifier: NodePath<ImportDefaultSpecifier>
  local: string
  source: string
  type: 'ImportDefaultSpecifier'
}

export interface ExportAllDeclarationImportToken {
  declaration: NodePath<ExportAllDeclaration>
  source: string
  type: 'ExportAllDeclaration'
}

export type ImportToken = ImportSpecifierImportToken | ImportDefaultSpecifierImportToken | ExportAllDeclarationImportToken

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
      const binding = arg.scope.getBinding(arg.node.name)
      if (binding) {
        this.walkNode(binding.path)
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
                local: arg.node.local.name,
                source: importDeclaration.node.source.value,
                type: 'ImportSpecifier',
              } satisfies ImportSpecifierImportToken,
            )
          }
        }
        else if (arg.isImportDefaultSpecifier()) {
          this.imports.add(
            {
              declaration: importDeclaration,
              specifier: arg,
              local: arg.node.local.name,
              source: importDeclaration.node.source.value,
              type: 'ImportDefaultSpecifier',
            } satisfies ImportDefaultSpecifierImportToken,
          )
        }
      }
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
        this.walkNode(decl)
      }
    }
    const specifiers = path.get('specifiers')
    for (const spec of specifiers) {
      if (spec.isExportSpecifier()) {
        const local = spec.get('local')
        if (local.isIdentifier()) {
          this.walkNode(local)
        }
      }
    }
  }

  walkExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
    const decl = path.get('declaration')
    if (decl.isIdentifier()) {
      this.walkNode(decl)
    }
    else {
      this.walkNode(decl as unknown as NodePath<Node | null | undefined>)
    }
  }

  walkExportAllDeclaration(path: NodePath<ExportAllDeclaration>) {
    const source = path.get('source')
    if (source.isStringLiteral()) {
      // Capture re-export paths so that the caller can decide how to process them.
      this.imports.add(
        {
          declaration: path,
          source: source.node.value,
          type: 'ExportAllDeclaration',
        } satisfies ExportAllDeclarationImportToken,
      )
    }
  }
}
