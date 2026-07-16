import type { TailwindResolvedSource, WeappTailwindcssGenerateOptions, WeappTailwindcssGenerateResult, WeappTailwindcssGenerator } from '@/generator'
import { md5Hash } from '@/cache/md5'
import { createWeappTailwindcssGenerator } from '@/generator'

const SESSION_ENGINE_CACHE_MAX = 32

export type TailwindGenerationChange
  = | { type: 'all' }
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

export class TailwindGenerationSession {
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

  invalidate(change: TailwindGenerationChange) {
    if (change.type === 'all') {
      this.generators.clear()
      return
    }
    this.generators.delete(createSourceKey(change.source))
  }

  dispose() {
    this.generators.clear()
    this.disposed = true
  }

  get size() {
    return this.generators.size
  }

  private getGenerator(source: TailwindResolvedSource) {
    if (this.disposed) {
      throw new Error('TailwindGenerationSession 已释放。')
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
      this.generators.delete(oldest)
    }
    return generator
  }
}

const sessions = new WeakMap<object, TailwindGenerationSession>()

export function getTailwindGenerationSession(owner: object) {
  let session = sessions.get(owner)
  if (!session) {
    session = new TailwindGenerationSession()
    sessions.set(owner, session)
  }
  return session
}
