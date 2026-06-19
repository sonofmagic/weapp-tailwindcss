import type { TailwindV3ResolvedSource } from '../types'

const runtimeReadyPromiseCache = new Map<string, Promise<void>>()

function createRuntimeReadyCacheKey(source: TailwindV3ResolvedSource) {
  return [
    source.packageName,
    source.postcssPlugin,
    source.config ?? 'config:missing',
    source.cwd,
  ].join('\0')
}

export function createRuntimeReadyPromise(source: TailwindV3ResolvedSource) {
  const cacheKey = createRuntimeReadyCacheKey(source)
  const cached = runtimeReadyPromiseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const task = Promise.resolve()
  runtimeReadyPromiseCache.set(cacheKey, task)
  return task
}
