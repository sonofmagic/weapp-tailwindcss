import type { CompilationResult, SourceKind, SourceScope } from './types'
import { DefaultCompilationSession } from './session'

const COMPILATION_SCOPE_CACHE_MAX = 128

export interface CompilationScopeSource {
  id: string
  kind: SourceKind
  candidates: Iterable<string>
  content?: string | undefined
}

export interface CompilationScopeRequest {
  scope: SourceScope
  outputId: string
  sources: CompilationScopeSource[]
  preserveDeletedCss?: boolean | undefined
}

export interface CompilationScopeState extends Omit<CompilationResult, 'candidatesBySource'> {
  candidatesBySource: Map<string, Set<string>>
}

export type CompilationScopeExecution<T>
  = | {
    committed: true
    compilation: CompilationScopeState
    value: T
  }
  | {
    committed: false
    compilation: CompilationScopeState
    value?: never
  }

interface CompilationScopeEntry {
  active: boolean
  latest?: CompilationResult | undefined
  pending: Promise<void>
  scope: SourceScope
  session: DefaultCompilationSession
  sources: Map<string, CompilationScopeSource>
}

function sourceNodeId(sourceId: string) {
  return `source:${sourceId}`
}

function assetNodeId(outputId: string) {
  return `asset:${outputId}`
}

function cloneScopeSource(source: CompilationScopeSource): CompilationScopeSource {
  return {
    ...source,
    candidates: new Set(source.candidates),
  }
}

export class CompilationSessionPool {
  private readonly entries = new Map<string, CompilationScopeEntry>()
  private disposed = false

  run<T extends { classSet: Iterable<string> } | undefined>(
    request: CompilationScopeRequest,
    compile: (compilation: CompilationScopeState) => Promise<T>,
  ): Promise<CompilationScopeExecution<T>> {
    const entry = this.getEntry(request.scope)
    return this.runEntry(entry, request, compile)
  }

  invalidateScope(scopeId: string) {
    const entry = this.entries.get(scopeId)
    if (!entry) {
      return
    }
    entry.active = false
    void entry.pending.then(() => entry.session.dispose())
    this.entries.delete(scopeId)
  }

  dispose() {
    for (const entry of this.entries.values()) {
      entry.active = false
      void entry.pending.then(() => entry.session.dispose())
    }
    this.entries.clear()
    this.disposed = true
  }

  get size() {
    return this.entries.size
  }

  private getEntry(scope: SourceScope) {
    if (this.disposed) {
      throw new Error('CompilationSessionPool 已释放。')
    }
    const cached = this.entries.get(scope.id)
    if (cached) {
      if (cached.scope.kind !== scope.kind) {
        throw new Error(`同一个 scope id 不能对应不同类型：${scope.id}`)
      }
      this.entries.delete(scope.id)
      this.entries.set(scope.id, cached)
      return cached
    }
    const entry: CompilationScopeEntry = {
      active: true,
      pending: Promise.resolve(),
      scope: { ...scope },
      session: new DefaultCompilationSession(),
      sources: new Map(),
    }
    this.entries.set(scope.id, entry)
    while (this.entries.size > COMPILATION_SCOPE_CACHE_MAX) {
      const oldestScopeId = this.entries.keys().next().value
      if (oldestScopeId === undefined || oldestScopeId === scope.id) {
        break
      }
      this.invalidateScope(oldestScopeId)
    }
    return entry
  }

  private async runEntry<T extends { classSet: Iterable<string> } | undefined>(
    entry: CompilationScopeEntry,
    request: CompilationScopeRequest,
    compile: (compilation: CompilationScopeState) => Promise<T>,
  ): Promise<CompilationScopeExecution<T>> {
    const prepared = await this.enqueue(entry, () => this.prepareEntry(entry, request))
    const value = await compile(prepared.compilation)
    const validatedClassSet = request.preserveDeletedCss
      ? new Set([...prepared.compilation.validatedClassSet, ...(value?.classSet ?? [])])
      : new Set(value?.classSet ?? [])
    let committed = false
    await this.enqueue(entry, () => {
      if (!entry.active || entry.latest?.revision !== prepared.compilation.revision) {
        return
      }
      entry.latest = entry.session.commitValidation(prepared.compilation.revision, validatedClassSet)
      committed = true
    })
    const compilation = {
      ...prepared.compilation,
      validatedClassSet,
    }
    return committed
      ? { committed, compilation, value }
      : { committed, compilation }
  }

  private prepareEntry(
    entry: CompilationScopeEntry,
    request: CompilationScopeRequest,
  ) {
    const nextSources = new Map(request.sources.map(source => [source.id, cloneScopeSource(source)]))
    const changes = []
    for (const sourceId of entry.sources.keys()) {
      if (!nextSources.has(sourceId)) {
        changes.push({ sourceId: sourceNodeId(sourceId), type: 'source-removed' as const })
      }
    }
    for (const [sourceId, source] of nextSources) {
      const previous = entry.sources.get(sourceId)
      if (previous && previous.content !== source.content) {
        changes.push({ sourceId: sourceNodeId(sourceId), type: 'dependency-changed' as const })
      }
    }
    entry.sources = nextSources

    const outputNodeId = assetNodeId(request.outputId)
    const nodes = [
      ...[...nextSources.values()].map(source => ({
        id: sourceNodeId(source.id),
        kind: source.kind,
        scope: { ...request.scope },
        ...(source.content === undefined ? {} : { content: source.content }),
      })),
      {
        id: outputNodeId,
        kind: 'asset' as const,
        scope: { ...request.scope },
      },
    ]
    entry.latest = entry.session.update({
      nodes,
      edges: [...nextSources.values()].map(source => ({
        from: sourceNodeId(source.id),
        to: outputNodeId,
        kind: 'emits-to' as const,
      })),
      candidatesBySource: [...nextSources.values()].map(source => [
        sourceNodeId(source.id),
        source.candidates,
      ] as const),
      changes,
      preserveDeletedCss: request.preserveDeletedCss,
    })
    return {
      compilation: this.toScopeState(entry.latest, nextSources),
      sources: nextSources,
    }
  }

  private enqueue<T>(entry: CompilationScopeEntry, task: () => T | Promise<T>) {
    const execution = entry.pending.then(task)
    entry.pending = execution.then(() => undefined, () => undefined)
    return execution
  }

  private toScopeState(
    compilation: CompilationResult,
    sources: Map<string, CompilationScopeSource>,
  ): CompilationScopeState {
    return {
      ...compilation,
      candidatesBySource: new Map(
        [...sources.keys()].map(sourceId => [
          sourceId,
          compilation.candidatesBySource.get(sourceNodeId(sourceId)) ?? new Set<string>(),
        ]),
      ),
    }
  }
}

const compilationSessionPools = new WeakMap<object, CompilationSessionPool>()

export function getCompilationSessionPool(owner: object) {
  let pool = compilationSessionPools.get(owner)
  if (!pool) {
    pool = new CompilationSessionPool()
    compilationSessionPools.set(owner, pool)
  }
  return pool
}
