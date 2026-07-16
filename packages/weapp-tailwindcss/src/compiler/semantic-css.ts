import type { ChildNode, Root } from 'postcss'
import type { GenerationArtifact } from './types'

function normalizeNode(node: ChildNode): unknown {
  switch (node.type) {
    case 'comment':
      return undefined
    case 'decl':
      return ['decl', node.prop, node.value, node.important]
    case 'rule':
      return ['rule', node.selector, node.nodes.map(normalizeNode).filter(Boolean)]
    case 'atrule':
      return ['atrule', node.name, node.params, node.nodes?.map(normalizeNode).filter(Boolean) ?? []]
  }
}

export function normalizeCssRoot(root: Root) {
  return root.nodes.map(normalizeNode).filter(Boolean)
}

export function createArtifactSemanticSignature(artifact: GenerationArtifact) {
  return JSON.stringify({
    fragments: [...artifact.fragments]
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      .map(fragment => ({
        id: fragment.id,
        kind: fragment.kind,
        order: fragment.order,
        scope: fragment.scope,
        sourceId: fragment.sourceId,
        stage: fragment.stage,
        root: normalizeCssRoot(fragment.root),
      })),
    classSet: [...artifact.classSet].sort(),
    rawCandidates: [...artifact.rawCandidates].sort(),
    dependencies: [...artifact.dependencies].sort(),
    sourceEntries: [...artifact.sourceEntries].sort(),
  })
}

export function areArtifactsSemanticallyEqual(left: GenerationArtifact, right: GenerationArtifact) {
  return createArtifactSemanticSignature(left) === createArtifactSemanticSignature(right)
}
