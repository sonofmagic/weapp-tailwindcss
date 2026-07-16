import type { CompilationResult, CompilationSession, CompilationSnapshot } from './types'
import { CandidateIndex } from './candidate-index'
import { resolveInvalidatedScopes } from './invalidation'
import { SourceGraph } from './source-graph'

export class DefaultCompilationSession implements CompilationSession {
  private readonly candidateIndex = new CandidateIndex()
  private readonly graph = new SourceGraph()
  private readonly retainedCandidates = new Set<string>()
  private validatedClassSet = new Set<string>()
  private revision = 0

  update(snapshot: CompilationSnapshot): CompilationResult {
    const invalidatedScopes = resolveInvalidatedScopes(this.graph, snapshot.changes ?? [])
    this.graph.replace(snapshot.nodes, snapshot.edges)
    for (const [sourceId, candidates] of snapshot.candidatesBySource ?? []) {
      this.candidateIndex.sync(sourceId, candidates)
    }
    for (const change of snapshot.changes ?? []) {
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
    for (const scopeId of resolveInvalidatedScopes(this.graph, snapshot.changes ?? [])) {
      invalidatedScopes.add(scopeId)
    }
    return {
      revision: this.revision,
      candidates: new Set(this.retainedCandidates),
      validatedClassSet: new Set(this.validatedClassSet),
      invalidatedScopes,
      graphNodes: this.graph.getNodes(),
    }
  }

  dispose() {
    this.candidateIndex.clear()
    this.graph.clear()
    this.retainedCandidates.clear()
    this.validatedClassSet.clear()
    this.revision = 0
  }
}
