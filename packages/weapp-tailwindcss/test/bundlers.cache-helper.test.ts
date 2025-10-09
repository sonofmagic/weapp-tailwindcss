import { describe, expect, it, vi } from 'vitest'
import { sources } from 'webpack'
import { processCachedTask } from '@/bundlers/shared/cache'
import { createCache } from '@/cache'

describe('processCachedTask', () => {
  it('stores result when cache miss', async () => {
    const cache = createCache()
    const applyResult = vi.fn()
    const transform = vi.fn().mockResolvedValue({
      result: 'handled',
    })

    await processCachedTask({
      cache,
      cacheKey: 'file',
      rawSource: 'source-content',
      applyResult,
      transform,
    })

    expect(applyResult).toHaveBeenCalledTimes(1)
    expect(applyResult).toHaveBeenCalledWith('handled')
    expect(transform).toHaveBeenCalledTimes(1)
    expect(cache.get('file')).toBe('handled')
  })

  it('reads from cache and triggers onCacheHit when hash unchanged', async () => {
    const cache = createCache()

    await processCachedTask({
      cache,
      cacheKey: 'bundle.js',
      rawSource: 'content',
      applyResult: vi.fn(),
      transform: vi.fn().mockResolvedValue({
        result: 'first-run',
      }),
    })

    const onCacheHit = vi.fn()
    const applyResult = vi.fn()
    const transform = vi.fn()

    await processCachedTask({
      cache,
      cacheKey: 'bundle.js',
      rawSource: 'content',
      applyResult,
      transform,
      onCacheHit,
    })

    expect(transform).not.toHaveBeenCalled()
    expect(onCacheHit).toHaveBeenCalledTimes(1)
    expect(applyResult).toHaveBeenCalledTimes(1)
    expect(applyResult).toHaveBeenCalledWith('first-run')
  })

  it('supports custom cacheValue storage', async () => {
    const cache = createCache()
    const applyResult = vi.fn()
    const concat = new sources.ConcatSource('css')

    await processCachedTask({
      cache,
      cacheKey: 'style.wxss',
      rawSource: 'css',
      applyResult,
      transform: vi.fn().mockResolvedValue({
        result: 'css',
        cacheValue: concat,
      }),
    })

    expect(cache.get('style.wxss')).toBe(concat)
    expect(applyResult).toHaveBeenCalledWith('css')
  })
})
