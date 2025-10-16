import type { ParserOptions } from '@babel/parser'
import type { IJsHandlerOptions, JsModuleGraphOptions, LinkedJsModuleResult } from '../types'
import type { SourceAnalysis } from './babel'
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

      const dependencySpecifiers = new Set<string>()

      for (const token of state.analysis.walker.imports) {
        dependencySpecifiers.add(token.source)
      }

      for (const exportPath of state.analysis.exportDeclarations) {
        if (exportPath.isExportAllDeclaration() || exportPath.isExportNamedDeclaration()) {
          const source = exportPath.node.source?.value
          if (typeof source === 'string') {
            dependencySpecifiers.add(source)
          }
        }
      }

      for (const specifier of dependencySpecifiers) {
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
