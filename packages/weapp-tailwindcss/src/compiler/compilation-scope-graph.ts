import type { CompilationGraphSnapshot, SourceKind, SourceScope } from './types'

export interface CompilationScopeDependency {
  id: string
  kind: SourceKind
}

export interface CompilationScopeGraphSource {
  id: string
  kind: SourceKind
  content?: string | undefined
  dependencies?: CompilationScopeDependency[] | undefined
}

export function sourceNodeId(sourceId: string) {
  return `source:${sourceId}`
}

export function mergeCompilationScopeDependencies(
  ...groups: Array<Iterable<CompilationScopeDependency> | undefined>
) {
  const dependencies = new Map<string, CompilationScopeDependency>()
  for (const group of groups) {
    for (const dependency of group ?? []) {
      const previous = dependencies.get(dependency.id)
      if (previous && previous.kind !== dependency.kind) {
        throw new Error(`同一个依赖不能对应不同类型：${dependency.id}`)
      }
      dependencies.set(dependency.id, { ...dependency })
    }
  }
  return [...dependencies.values()]
}

export function dependencySignature(source: CompilationScopeGraphSource) {
  return mergeCompilationScopeDependencies(source.dependencies)
    .map(dependency => `${dependency.kind}\0${dependency.id}`)
    .sort()
    .join('\0')
}

export function createCompilationScopeGraph(
  scope: SourceScope,
  outputId: string,
  sources: Iterable<CompilationScopeGraphSource>,
): CompilationGraphSnapshot {
  const normalizedSources = [...sources].map(source => ({
    ...source,
    dependencies: mergeCompilationScopeDependencies(source.dependencies),
  }))
  const dependencies = mergeCompilationScopeDependencies(
    ...normalizedSources.map(source => source.dependencies),
  )
  const outputNodeId = `asset:${outputId}`
  return {
    nodes: [
      ...normalizedSources.map(source => ({
        id: sourceNodeId(source.id),
        kind: source.kind,
        scope: { ...scope },
        ...(source.content === undefined ? {} : { content: source.content }),
      })),
      ...dependencies.map(dependency => ({
        id: `dependency:${dependency.id}`,
        kind: dependency.kind,
        scope: { ...scope },
      })),
      {
        id: outputNodeId,
        kind: 'asset' as const,
        scope: { ...scope },
      },
    ],
    edges: normalizedSources.flatMap(source => [
      {
        from: sourceNodeId(source.id),
        to: outputNodeId,
        kind: 'emits-to' as const,
      },
      ...source.dependencies.map(dependency => ({
        from: sourceNodeId(source.id),
        to: `dependency:${dependency.id}`,
        kind: 'depends-on' as const,
      })),
    ]),
  }
}
