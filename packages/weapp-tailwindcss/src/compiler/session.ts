import type { CompilationGraphSnapshot, CompilationResult, CompilationSession, CompilationSnapshot } from './types'
import { CandidateIndex } from './candidate-index'
import { resolveInvalidatedScopes } from './invalidation'
import { SourceGraph } from './source-graph'

export class DefaultCompilationSession implements CompilationSession {
  private readonly candidateIndex = new CandidateIndex()
  private readonly graph = new SourceGraph()
  private readonly retainedCandidates = new Set<string>()
  private validatedClassSet = new Set<string>()
  private invalidatedScopes = new Set<string>()
  private revision = 0

  update(snapshot: CompilationSnapshot): CompilationResult {
    const changes = [...snapshot.changes ?? []]
    const invalidatedScopes = resolveInvalidatedScopes(this.graph, changes)
    this.graph.replace(snapshot.nodes, snapshot.edges)
    for (const [sourceId, candidates] of snapshot.candidatesBySource ?? []) {
      const change = this.candidateIndex.sync(sourceId, candidates)
      if (change.addedCandidates.size > 0 || change.removedCandidates.size > 0) {
        changes.push(change)
      }
    }
    for (const change of changes) {
      if ('type' in change && change.type === 'source-removed') {
        this.candidateIndex.remove(change.sourceId)
      }
    }
    const currentCandidates = this.candidateIndex.values()
    if (snapshot.preserveDeletedCss) {
      for (const candidate of currentCandidates) {
        this.retainedCandidates.add(candidate)
      }
    }
    else {
      this.retainedCandidates.clear()
      for (const candidate of currentCandidates) {
        this.retainedCandidates.add(candidate)
      }
    }
    if (snapshot.validatedClassSet !== undefined) {
      this.validatedClassSet = new Set(snapshot.validatedClassSet)
    }
    else if (!snapshot.preserveDeletedCss) {
      this.validatedClassSet = new Set(
        [...this.validatedClassSet].filter(candidate => this.retainedCandidates.has(candidate)),
      )
    }
    this.revision += 1
    for (const scopeId of resolveInvalidatedScopes(this.graph, changes)) {
      invalidatedScopes.add(scopeId)
    }
    this.invalidatedScopes = invalidatedScopes
    return this.createResult()
  }

  commitValidation(
    revision: number,
    validatedClassSet: Iterable<string>,
    graph?: CompilationGraphSnapshot,
  ): CompilationResult {
    if (revision !== this.revision) {
      throw new Error(`不能向编译 revision ${this.revision} 提交 revision ${revision} 的 classSet。`)
    }
    if (graph) {
      this.graph.replace(graph.nodes, graph.edges)
    }
    this.validatedClassSet = new Set(validatedClassSet)
    return this.createResult()
  }

  private createResult(): CompilationResult {
    return {
      revision: this.revision,
      candidates: new Set(this.retainedCandidates),
      candidatesBySource: this.candidateIndex.entries(),
      validatedClassSet: new Set(this.validatedClassSet),
      invalidatedScopes: new Set(this.invalidatedScopes),
      graphEdges: this.graph.getEdges(),
      graphNodes: this.graph.getNodes(),
    }
  }

  dispose() {
    this.candidateIndex.clear()
    this.graph.clear()
    this.retainedCandidates.clear()
    this.validatedClassSet.clear()
    this.invalidatedScopes.clear()
    this.revision = 0
  }
}
