import type { SourceGraphEdge, SourceGraphNode } from './types'

export class SourceGraph {
  private readonly edges = new Map<string, SourceGraphEdge>()
  private readonly nodes = new Map<string, SourceGraphNode>()

  replace(nodes: Iterable<SourceGraphNode>, edges: Iterable<SourceGraphEdge>) {
    this.clear()
    for (const node of nodes) {
      this.nodes.set(node.id, {
        ...node,
        scope: { ...node.scope },
      })
    }
    for (const edge of edges) {
      if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
        throw new Error(`编译图边引用了不存在的节点：${edge.from} -> ${edge.to}`)
      }
      this.edges.set(this.edgeKey(edge), { ...edge })
    }
  }

  getNode(id: string) {
    const node = this.nodes.get(id)
    return node ? { ...node, scope: { ...node.scope } } : undefined
  }

  getNodes() {
    return [...this.nodes.values()].map(node => ({ ...node, scope: { ...node.scope } }))
  }

  getEdges() {
    return [...this.edges.values()].map(edge => ({ ...edge }))
  }

  getDependents(id: string) {
    return this.getEdges().filter(edge => edge.to === id).map(edge => edge.from)
  }

  clear() {
    this.edges.clear()
    this.nodes.clear()
  }

  private edgeKey(edge: SourceGraphEdge) {
    return `${edge.kind}\0${edge.from}\0${edge.to}`
  }
}
