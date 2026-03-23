import { describe, expect, it, vi } from 'vitest'
import { createCache } from '@/cache'
import { processCachedTask } from '@/bundlers/shared/cache'

describe('bundlers/processCachedTask', () => {
  it('invalidates cache when an explicit hash changes even if rawSource stays the same', async () => {
    const cache = createCache()
    const applyResult = vi.fn()
    const transform = vi.fn(async () => ({
      result: 'next-value',
    }))

    await processCachedTask({
      cache,
      cacheKey: 'app.wxss',
      hashKey: 'app.wxss:asset',
      rawSource: '.app {}',
      hash: 'runtime:1',
      applyResult,
      transform,
    })

    await processCachedTask({
      cache,
      cacheKey: 'app.wxss',
      hashKey: 'app.wxss:asset',
      rawSource: '.app {}',
      hash: 'runtime:2',
      applyResult,
      transform,
    })

    expect(transform).toHaveBeenCalledTimes(2)
  })
})
