import type { ParserOptions } from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import type { Node as BabelNode, Identifier, StringLiteral } from '@babel/types'
import type { IJsHandlerOptions, JsModuleGraphOptions, LinkedJsModuleResult } from '../types'
import type { SourceAnalysis } from './babel'
import type { ImportToken } from './NodePathWalker'
import { analyzeSource, babelParse, processUpdatedSource } from './babel'

interface ModuleState {
  filename: string
  source: string
  analysis: SourceAnalysis
}

interface QueueItem {
  filename: string
  depth: number
}

export interface ModuleGraphEntry {
  filename: string
  source: string
  analysis: SourceAnalysis
  handlerOptions: IJsHandlerOptions
}

export class JsModuleGraph {
  private readonly modules = new Map<string, ModuleState>()
  private readonly queue: QueueItem[] = []
  private readonly ignoredExportNames = new Map<string, Set<string>>()
  private readonly resolve: JsModuleGraphOptions['resolve']
  private readonly load: JsModuleGraphOptions['load']
  private readonly filter?: JsModuleGraphOptions['filter']
  private readonly maxDepth: number
  private readonly baseOptions: IJsHandlerOptions
  private readonly parserOptions?: ParserOptions
  private readonly rootFilename: string

  constructor(entry: ModuleGraphEntry, graphOptions: JsModuleGraphOptions) {
    this.resolve = graphOptions.resolve
    this.load = graphOptions.load
    this.filter = graphOptions.filter
    this.maxDepth = graphOptions.maxDepth ?? Number.POSITIVE_INFINITY
    const { moduleGraph: _moduleGraph, filename: _ignoredFilename, ...rest } = entry.handlerOptions
    this.baseOptions = {
      ...rest,
      filename: entry.filename,
    }
    this.parserOptions = entry.handlerOptions.babelParserOptions
    this.rootFilename = entry.filename

    this.modules.set(entry.filename, {
      filename: entry.filename,
      source: entry.source,
      analysis: entry.analysis,
    })
    this.queue.push({ filename: entry.filename, depth: 0 })
  }

  build(): Record<string, LinkedJsModuleResult> {
    this.collectDependencies()

    const linked: Record<string, LinkedJsModuleResult> = {}
    for (const [filename, state] of this.modules) {
      if (filename === this.rootFilename) {
        continue
      }

      const childOptions: IJsHandlerOptions = {
        ...this.baseOptions,
        filename,
      }
      const ms = processUpdatedSource(state.source, childOptions, state.analysis)
      const code = ms.toString()
      if (code !== state.source) {
        linked[filename] = { code }
      }
    }

    return linked
  }

  private addIgnoredExport(filename: string, exportName: string) {
    if (!exportName) {
      return
    }
    let pending = this.ignoredExportNames.get(filename)
    if (!pending) {
      pending = new Set()
      this.ignoredExportNames.set(filename, pending)
    }
    if (pending.has(exportName)) {
      return
    }
    pending.add(exportName)
    const existing = this.modules.get(filename)
    if (existing) {
      this.applyIgnoredExportsToAnalysis(filename, existing.analysis)
    }
  }

  private registerIgnoredExportsFromTokens(resolved: string, tokens: ImportToken[]) {
    for (const token of tokens) {
      if (token.type === 'ImportSpecifier') {
        this.addIgnoredExport(resolved, token.imported)
      }
      else if (token.type === 'ImportDefaultSpecifier') {
        this.addIgnoredExport(resolved, 'default')
      }
    }
  }

  private applyIgnoredExportsToAnalysis(filename: string, analysis: SourceAnalysis) {
    const pending = this.ignoredExportNames.get(filename)
    if (!pending || pending.size === 0) {
      return
    }

    const names = new Set(pending)
    pending.clear()

    const propagate: Array<{ specifier: string, exportName: string }> = []

    for (const exportPath of analysis.exportDeclarations) {
      if (names.size === 0) {
        break
      }

      if (exportPath.isExportDefaultDeclaration()) {
        if (names.has('default')) {
          analysis.walker.walkExportDefaultDeclaration(exportPath)
          names.delete('default')
        }
        continue
      }

      if (exportPath.isExportNamedDeclaration()) {
        const source = exportPath.node.source?.value
        if (typeof source === 'string') {
          for (const spec of exportPath.get('specifiers')) {
            if (!spec.isExportSpecifier()) {
              continue
            }
            const exported = spec.get('exported')
            let exportedName: string | undefined
            if (exported.isIdentifier()) {
              exportedName = exported.node.name
            }
            else if (exported.isStringLiteral()) {
              exportedName = exported.node.value
            }

            if (!exportedName || !names.has(exportedName)) {
              continue
            }

            const local = spec.get('local') as NodePath<Identifier | StringLiteral>
            if (local.isIdentifier()) {
              propagate.push({
                specifier: source,
                exportName: local.node.name,
              })
              names.delete(exportedName)
            }
            else if (local.isStringLiteral()) {
              propagate.push({
                specifier: source,
                exportName: local.node.value,
              })
              names.delete(exportedName)
            }
          }
          continue
        }

        const declaration = exportPath.get('declaration')
        if (declaration.isVariableDeclaration()) {
          for (const decl of declaration.get('declarations')) {
            const id = decl.get('id')
            if (id.isIdentifier()) {
              const exportName = id.node.name
              if (names.has(exportName)) {
                analysis.walker.walkVariableDeclarator(decl)
                names.delete(exportName)
              }
            }
          }
        }

        for (const spec of exportPath.get('specifiers')) {
          if (!spec.isExportSpecifier()) {
            continue
          }
          const exported = spec.get('exported')
          let exportedName: string | undefined
          if (exported.isIdentifier()) {
            exportedName = exported.node.name
          }
          else if (exported.isStringLiteral()) {
            exportedName = exported.node.value
          }
          if (!exportedName || !names.has(exportedName)) {
            continue
          }
          const local = spec.get('local') as NodePath<BabelNode | null | undefined>
          analysis.walker.walkNode(local)
          names.delete(exportedName)
        }
        continue
      }

      if (exportPath.isExportAllDeclaration()) {
        const source = exportPath.node.source?.value
        if (typeof source === 'string') {
          for (const exportName of names) {
            propagate.push({
              specifier: source,
              exportName,
            })
          }
          names.clear()
        }
      }
    }

    for (const { specifier, exportName } of propagate) {
      let resolved: string | undefined
      try {
        resolved = this.resolve(specifier, filename)
      }
      catch {
        resolved = undefined
      }
      if (!resolved) {
        pending.add(exportName)
        continue
      }
      if (this.filter && !this.filter(resolved, specifier, filename)) {
        pending.add(exportName)
        continue
      }
      this.addIgnoredExport(resolved, exportName)
    }

    for (const name of names) {
      pending.add(name)
    }
  }

  private collectDependencies() {
    while (this.queue.length > 0) {
      const { filename, depth } = this.queue.shift() as QueueItem
      if (depth >= this.maxDepth) {
        continue
      }
      const state = this.modules.get(filename)
      if (!state) {
        continue
      }

      const dependencySpecifiers = new Map<string, ImportToken[]>()
      for (const token of state.analysis.walker.imports) {
        if (!dependencySpecifiers.has(token.source)) {
          dependencySpecifiers.set(token.source, [])
        }
        dependencySpecifiers.get(token.source)!.push(token)
      }
      for (const exportPath of state.analysis.exportDeclarations) {
        if (exportPath.isExportAllDeclaration() || exportPath.isExportNamedDeclaration()) {
          const source = exportPath.node.source?.value
          if (typeof source === 'string' && !dependencySpecifiers.has(source)) {
            dependencySpecifiers.set(source, [])
          }
        }
      }

      for (const [specifier, tokens] of dependencySpecifiers) {
        let resolved: string | undefined
        try {
          resolved = this.resolve(specifier, filename)
        }
        catch {
          continue
        }
        if (!resolved) {
          continue
        }
        if (this.filter && !this.filter(resolved, specifier, filename)) {
          continue
        }
        if (tokens.length > 0) {
          this.registerIgnoredExportsFromTokens(resolved, tokens)
        }
        if (this.modules.has(resolved)) {
          continue
        }

        let source: string | undefined
        try {
          source = this.load(resolved)
        }
        catch {
          continue
        }
        if (typeof source !== 'string') {
          continue
        }

        let analysis: SourceAnalysis
        try {
          const ast = babelParse(source, {
            ...this.parserOptions,
            sourceFilename: resolved,
          })
          analysis = analyzeSource(ast, {
            ...this.baseOptions,
            filename: resolved,
          })
          this.applyIgnoredExportsToAnalysis(resolved, analysis)
        }
        catch {
          continue
        }

        this.modules.set(resolved, {
          filename: resolved,
          source,
          analysis,
        })
        this.queue.push({ filename: resolved, depth: depth + 1 })
      }
    }
  }
}
