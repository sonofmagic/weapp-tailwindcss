import type { ParseResult } from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import type { ExportDeclaration, File, ImportDeclaration, StringLiteral, TemplateElement } from '@babel/types'
import type { JsTokenUpdater } from './JsTokenUpdater'
import type { NodePathWalker } from './NodePathWalker'
import type { JsToken } from './types'

export interface SourceAnalysis {
  ast: ParseResult<File>
  walker: NodePathWalker
  jsTokenUpdater: JsTokenUpdater
  targetPaths: NodePath<StringLiteral | TemplateElement>[]
  importDeclarations: Set<NodePath<ImportDeclaration>>
  exportDeclarations: Set<NodePath<ExportDeclaration>>
  requireCallPaths: NodePath<StringLiteral>[]
  ignoredPaths: WeakSet<NodePath<StringLiteral | TemplateElement>>
}

function createModuleSpecifierReplacementToken(
  path: NodePath<StringLiteral>,
  replacement: string,
): JsToken | undefined {
  const node = path.node
  if (node.value === replacement) {
    return undefined
  }

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    return undefined
  }

  const start = node.start + 1
  const end = node.end - 1
  if (start >= end) {
    return undefined
  }

  return {
    start,
    end,
    value: replacement,
    path,
  }
}

export function collectModuleSpecifierReplacementTokens(
  analysis: SourceAnalysis,
  replacements: Record<string, string>,
) {
  const tokens: JsToken[] = []

  const applyReplacement = (path: NodePath<StringLiteral>) => {
    const replacement = replacements[path.node.value]
    if (!replacement) {
      return
    }
    const token = createModuleSpecifierReplacementToken(path, replacement)
    if (token) {
      tokens.push(token)
    }
  }

  for (const importPath of analysis.importDeclarations) {
    const source = importPath.get('source')
    if (source.isStringLiteral()) {
      applyReplacement(source)
    }
  }

  for (const exportPath of analysis.exportDeclarations) {
    if (exportPath.isExportNamedDeclaration() || exportPath.isExportAllDeclaration()) {
      const source = exportPath.get('source')
      if (source && !Array.isArray(source) && source.isStringLiteral()) {
        applyReplacement(source)
      }
    }
  }

  for (const literalPath of analysis.requireCallPaths) {
    applyReplacement(literalPath)
  }

  for (const token of analysis.walker.imports) {
    const replacement = replacements[token.source]
    if (replacement) {
      token.source = replacement
    }
  }

  return tokens
}
