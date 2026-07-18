import type { CompilationDependencyChange } from './compilation-scope-graph'
import type { CompilationResult, SourceScope } from './types'
import { dependencyNodeId } from './compilation-scope-graph'

export interface CompilationDependencyScopeEntry {
  latest?: Pick<CompilationResult, 'graphNodes'> | undefined
  scope: SourceScope
}

export class CompilationDependencyState {
  private readonly revisions = new Map<string, number>()

  getAffectedScopes(
    entries: Iterable<CompilationDependencyScopeEntry>,
    changes: Iterable<CompilationDependencyChange>,
  ) {
    return new Set(this.getAffectedScopeChanges(entries, changes).keys())
  }

  getAffectedScopeChanges(
    entries: Iterable<CompilationDependencyScopeEntry>,
    changes: Iterable<CompilationDependencyChange>,
  ) {
    const changesByNodeId = new Map(
      [...changes].map(change => [dependencyNodeId(change.id), change]),
    )
    const affectedScopeChanges = new Map<string, CompilationDependencyChange[]>()
    for (const entry of entries) {
      const scopeChanges = entry.latest?.graphNodes
        .map(node => changesByNodeId.get(node.id))
        .filter((change): change is CompilationDependencyChange => change !== undefined)
      if (scopeChanges && scopeChanges.length > 0) {
        affectedScopeChanges.set(entry.scope.id, scopeChanges.map(change => ({ ...change })))
      }
    }
    return affectedScopeChanges
  }

  record(
    entries: Iterable<CompilationDependencyScopeEntry>,
    changes: Iterable<CompilationDependencyChange>,
  ) {
    const affectedScopes = this.getAffectedScopes(entries, changes)
    this.recordScopes(affectedScopes)
    return affectedScopes
  }

  recordScopes(scopeIds: Iterable<string>) {
    for (const scopeId of scopeIds) {
      this.revisions.set(scopeId, (this.revisions.get(scopeId) ?? 0) + 1)
    }
  }

  getRevision(scopeId: string) {
    return this.revisions.get(scopeId) ?? 0
  }

  delete(scopeId: string) {
    this.revisions.delete(scopeId)
  }

  clear() {
    this.revisions.clear()
  }
}
