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
    const changedNodeIds = new Set([...changes].map(change => dependencyNodeId(change.id)))
    const affectedScopes = new Set<string>()
    for (const entry of entries) {
      if (entry.latest?.graphNodes.some(node => changedNodeIds.has(node.id))) {
        affectedScopes.add(entry.scope.id)
      }
    }
    return affectedScopes
  }

  record(
    entries: Iterable<CompilationDependencyScopeEntry>,
    changes: Iterable<CompilationDependencyChange>,
  ) {
    const affectedScopes = this.getAffectedScopes(entries, changes)
    for (const scopeId of affectedScopes) {
      this.revisions.set(scopeId, (this.revisions.get(scopeId) ?? 0) + 1)
    }
    return affectedScopes
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
