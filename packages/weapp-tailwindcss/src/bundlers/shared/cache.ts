import type { CacheValue, HashMapKey, ICreateCacheReturnType } from '@/cache'

export interface ProcessCachedTaskOptions<TValue extends CacheValue> {
  cache: ICreateCacheReturnType
  cacheKey: string
  hashKey?: HashMapKey
  rawSource?: string
  readCache?: () => TValue | undefined
  applyResult: (value: TValue) => void | Promise<void>
  transform: () => Promise<{
    result: TValue
    cacheValue?: CacheValue
  }>
  onCacheHit?: () => void
}

export async function processCachedTask<TValue extends CacheValue>({
  cache,
  cacheKey,
  hashKey = cacheKey,
  rawSource,
  readCache,
  applyResult,
  transform,
  onCacheHit,
}: ProcessCachedTaskOptions<TValue>): Promise<void> {
  let cacheHit = false
  const result = await cache.process<TValue>({
    key: cacheKey,
    hashKey,
    rawSource,
    resolveCache: readCache,
    async onCacheHit(value) {
      cacheHit = true
      await applyResult(value)
      onCacheHit?.()
    },
    transform,
  })

  if (!cacheHit) {
    await applyResult(result)
  }
}
