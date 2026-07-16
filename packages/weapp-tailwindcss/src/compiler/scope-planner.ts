import type { SourceGraphNode, SourceScope } from './types'

export interface SourceScopePlan {
  scope: SourceScope
  nodes: SourceGraphNode[]
}

export function planSourceScopes(nodes: Iterable<SourceGraphNode>): SourceScopePlan[] {
  const scopes = new Map<string, SourceScopePlan>()
  for (const node of nodes) {
    const current = scopes.get(node.scope.id)
    if (current) {
      if (current.scope.kind !== node.scope.kind) {
        throw new Error(`同一个 scope id 不能对应不同类型：${node.scope.id}`)
      }
      current.nodes.push({ ...node, scope: { ...node.scope } })
      continue
    }
    scopes.set(node.scope.id, {
      scope: { ...node.scope },
      nodes: [{ ...node, scope: { ...node.scope } }],
    })
  }
  return [...scopes.values()]
}
