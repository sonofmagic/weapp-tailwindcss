import type { SourceGraph } from './source-graph'
import type { CompilationChange } from './types'

export function resolveInvalidatedScopes(graph: SourceGraph, changes: Iterable<CompilationChange>) {
  const invalidatedScopes = new Set<string>()
  const visit = (sourceId: string, visited: Set<string>) => {
    if (visited.has(sourceId)) {
      return
    }
    visited.add(sourceId)
    const node = graph.getNode(sourceId)
    if (node) {
      invalidatedScopes.add(node.scope.id)
    }
    for (const dependent of graph.getDependents(sourceId)) {
      visit(dependent, visited)
    }
  }
  for (const change of changes) {
    visit(change.sourceId, new Set())
  }
  return invalidatedScopes
}
