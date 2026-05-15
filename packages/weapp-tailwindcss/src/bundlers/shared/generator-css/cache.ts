import type { TailwindResolvedSource, WeappTailwindcssGenerator } from '@/generator'
import { createWeappTailwindcssGenerator } from '@/generator'

const MAX_GENERATOR_CACHE_SIZE = 64

const generatorCache = new Map<string, WeappTailwindcssGenerator>()

function hashString(value: string) {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

function createSourceCacheKey(source: TailwindResolvedSource) {
  return [
    'v3',
    source.projectRoot,
    source.cwd,
    source.base,
    source.config ?? '',
    source.packageName,
    source.postcssPlugin,
    source.dependencies.join('\0'),
    source.css.length,
    hashString(source.css),
  ].join('\0')
}

export function getCachedWeappTailwindcssGenerator(source: TailwindResolvedSource) {
  if (source.version !== 3) {
    return createWeappTailwindcssGenerator(source)
  }

  const key = createSourceCacheKey(source)
  const cached = generatorCache.get(key)
  if (cached) {
    generatorCache.delete(key)
    generatorCache.set(key, cached)
    return cached
  }

  const generator = createWeappTailwindcssGenerator(source)
  generatorCache.set(key, generator)
  while (generatorCache.size > MAX_GENERATOR_CACHE_SIZE) {
    const oldestKey = generatorCache.keys().next().value
    if (oldestKey === undefined) {
      break
    }
    generatorCache.delete(oldestKey)
  }
  return generator
}
