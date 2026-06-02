import type { CacheValue, HashMapKey, ICreateCacheReturnType } from '@/cache'

export interface ProcessCachedTaskOptions<TValue extends CacheValue> {
  cache: ICreateCacheReturnType
  cacheKey: string
  hashKey?: HashMapKey | undefined
  rawSource?: string | undefined
  hash?: string | undefined
  readCache?: (() => TValue | undefined) | undefined
  applyResult: (value: TValue, meta: { cacheHit: boolean }) => void | Promise<void>
  transform: () => Promise<{
    result: TValue
    cacheValue?: CacheValue | undefined
  }>
  onCacheHit?: (() => void) | undefined
}

export async function processCachedTask<TValue extends CacheValue>({
  cache,
  cacheKey,
  hashKey = cacheKey,
  rawSource,
  hash,
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
    hash,
    resolveCache: readCache,
    async onCacheHit(value) {
      cacheHit = true
      await applyResult(value, { cacheHit: true })
      onCacheHit?.()
    },
    transform,
  })

  if (!cacheHit) {
    await applyResult(result, { cacheHit: false })
  }
}
