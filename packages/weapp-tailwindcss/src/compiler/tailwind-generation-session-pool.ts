import type { TailwindResolvedSource, WeappTailwindcssGenerateOptions, WeappTailwindcssGenerateResult, WeappTailwindcssGenerator } from '@/generator'
import { md5Hash } from '@/cache/md5'
import { createWeappTailwindcssGenerator } from '@/generator'

const SESSION_ENGINE_CACHE_MAX = 32

export type TailwindGenerationPoolChange
  = | { type: 'all' }
    | { type: 'dependencies', paths?: Iterable<string> | undefined }
    | { type: 'source', source: TailwindResolvedSource }

function createSourceKey(source: TailwindResolvedSource) {
  return md5Hash([
    source.projectRoot,
    source.base,
    source.baseFallbacks.join('\0'),
    source.css,
    source.dependencies.join('\0'),
  ].join('\0'))
}

function disposeGenerator(generator: WeappTailwindcssGenerator | undefined) {
  generator?.dispose?.()
}

export class TailwindGenerationSessionPool {
  private readonly generators = new Map<string, WeappTailwindcssGenerator>()
  private disposed = false

  async generate(
    source: TailwindResolvedSource,
    options?: WeappTailwindcssGenerateOptions,
  ): Promise<WeappTailwindcssGenerateResult> {
    return this.getGenerator(source).generate(options)
  }

  async validateCandidates(source: TailwindResolvedSource, candidates: Iterable<string>) {
    return this.getGenerator(source).validateCandidates(candidates)
  }

  invalidate(change: TailwindGenerationPoolChange) {
    if (change.type === 'all' || change.type === 'dependencies') {
      for (const generator of this.generators.values()) {
        disposeGenerator(generator)
      }
      this.generators.clear()
      return
    }
    const key = createSourceKey(change.source)
    disposeGenerator(this.generators.get(key))
    this.generators.delete(key)
  }

  dispose() {
    for (const generator of this.generators.values()) {
      disposeGenerator(generator)
    }
    this.generators.clear()
    this.disposed = true
  }

  get size() {
    return this.generators.size
  }

  private getGenerator(source: TailwindResolvedSource) {
    if (this.disposed) {
      throw new Error('TailwindGenerationSessionPool 已释放。')
    }
    const key = createSourceKey(source)
    const cached = this.generators.get(key)
    if (cached) {
      this.generators.delete(key)
      this.generators.set(key, cached)
      return cached
    }
    const generator = createWeappTailwindcssGenerator(source)
    this.generators.set(key, generator)
    while (this.generators.size > SESSION_ENGINE_CACHE_MAX) {
      const oldest = this.generators.keys().next().value
      if (oldest === undefined) {
        break
      }
      disposeGenerator(this.generators.get(oldest))
      this.generators.delete(oldest)
    }
    return generator
  }
}

const sessionPools = new WeakMap<object, TailwindGenerationSessionPool>()

export function getTailwindGenerationSessionPool(owner: object) {
  let pool = sessionPools.get(owner)
  if (!pool) {
    pool = new TailwindGenerationSessionPool()
    sessionPools.set(owner, pool)
  }
  return pool
}

export function disposeTailwindGenerationSessionPool(owner: object) {
  const pool = sessionPools.get(owner)
  if (!pool) {
    return
  }
  sessionPools.delete(owner)
  pool.dispose()
}
