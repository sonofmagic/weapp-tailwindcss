import { describe, expect, it, vi } from 'vitest'
import {
  consumeCompilationScopeChanges,
  createCompilationDependencyChanges,
  getCompilationSessionPool,
  getCompilationScopeDependencyRevision,
  getTailwindGenerationSessionPool,
  invalidateCompilationScope,
  recordCompilationDependencyChanges,
} from '@/compiler'

describe('CompilationChangeCoordinator', () => {
  it('merges duplicate bundler events into one pending scope revision', async () => {
    const owner = {}
    const dependency = '/workspace/tailwind.config.ts'
    const pluginDependency = '/workspace/plugin.ts'
    const unrelatedDependency = '/workspace/unrelated.ts'
    const scope = { id: 'app.css', kind: 'global' as const }
    const compilationPool = getCompilationSessionPool(owner)
    await compilationPool.run({
      scope,
      outputId: scope.id,
      sources: [{
        id: '/workspace/src/app.css',
        kind: 'css',
        candidates: ['block'],
      }],
    }, async compilation => ({
      classSet: compilation.candidates,
      dependenciesBySource: [[
        '/workspace/src/app.css',
        [
          { id: dependency, kind: 'config' as const },
          { id: pluginDependency, kind: 'config' as const },
        ],
      ]] as const,
    }))
    const generationPool = getTailwindGenerationSessionPool(owner)
    const invalidate = vi.spyOn(generationPool, 'invalidate')
    const changes = createCompilationDependencyChanges([dependency, unrelatedDependency])

    expect(recordCompilationDependencyChanges(owner, changes)).toEqual(new Set([scope.id]))
    expect(recordCompilationDependencyChanges(owner, changes)).toEqual(new Set([scope.id]))
    expect(getCompilationScopeDependencyRevision(owner, scope.id)).toBe(1)
    expect(invalidate).toHaveBeenCalledTimes(1)
    recordCompilationDependencyChanges(
      owner,
      createCompilationDependencyChanges([pluginDependency]),
    )
    expect(getCompilationScopeDependencyRevision(owner, scope.id)).toBe(1)
    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(consumeCompilationScopeChanges(owner, scope.id)).toEqual([
      { id: dependency, type: 'dependency-changed' },
      { id: pluginDependency, type: 'dependency-changed' },
    ])
    expect(consumeCompilationScopeChanges(owner, scope.id)).toBeUndefined()

    recordCompilationDependencyChanges(owner, changes)
    expect(getCompilationScopeDependencyRevision(owner, scope.id)).toBe(2)
    expect(invalidate).toHaveBeenCalledTimes(3)

    invalidateCompilationScope(owner, scope.id)
    expect(getCompilationScopeDependencyRevision(owner, scope.id)).toBe(0)
    expect(consumeCompilationScopeChanges(owner, scope.id)).toBeUndefined()
    expect(recordCompilationDependencyChanges(owner, changes)).toEqual(new Set())
  })
})
