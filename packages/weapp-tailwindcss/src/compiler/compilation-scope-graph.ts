import type { CompilationGraphSnapshot, SourceKind, SourceScope } from './types'

export interface CompilationScopeDependency {
  id: string
  kind: SourceKind
}

export interface CompilationDependencyChange {
  id: string
  type: 'dependency-changed' | 'config-changed'
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

export function dependencyNodeId(dependencyId: string) {
  return `dependency:${dependencyId}`
}

export function createCompilationDependencyChanges(
  dependencyIds: Iterable<string>,
  type: CompilationDependencyChange['type'] = 'dependency-changed',
): CompilationDependencyChange[] {
  return [...new Set(dependencyIds)].map(id => ({ id, type }))
}

export function mergeCompilationDependencyChanges(
  ...groups: Array<Iterable<CompilationDependencyChange> | undefined>
) {
  const changes = new Map<string, CompilationDependencyChange>()
  for (const group of groups) {
    for (const change of group ?? []) {
      const previous = changes.get(change.id)
      changes.set(change.id, {
        id: change.id,
        type: previous?.type === 'config-changed' ? previous.type : change.type,
      })
    }
  }
  return [...changes.values()]
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
        id: dependencyNodeId(dependency.id),
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
        to: dependencyNodeId(dependency.id),
        kind: 'depends-on' as const,
      })),
    ]),
  }
}
