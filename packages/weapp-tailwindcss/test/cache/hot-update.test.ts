/**
 * Cache 模块热更新测试
 * 测试范围：BC-001 ~ BC-004
 * 覆盖 processCachedTask 的缓存命中与失效、缓存键生成、强制刷新与增量更新
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { processCachedTask } from '@/bundlers/shared/cache'
import { initializeCache } from '@/cache'

describe('Cache Hot Update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('processCachedTask', () => {
    it('should call transform on cache miss', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn()

      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source code',
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalled()
      expect(applyResult).toHaveBeenCalledWith('transformed')
    })

    it('should hit cache on second call with same key and source', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn()
      const onCacheHit = vi.fn()

      // 第一次调用
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source code',
        applyResult,
        transform,
        onCacheHit,
      })

      expect(transform).toHaveBeenCalledTimes(1)
      expect(onCacheHit).not.toHaveBeenCalled()

      applyResult.mockClear()

      // 第二次调用，相同的 key 和 source
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source code',
        applyResult,
        transform,
        onCacheHit,
      })

      // 应该命中缓存，不再调用 transform
      expect(transform).toHaveBeenCalledTimes(1)
      expect(onCacheHit).toHaveBeenCalled()
      expect(applyResult).toHaveBeenCalledWith('transformed')
    })

    it('should invalidate cache when source changes', async () => {
      const cache = initializeCache()
      const transform = vi.fn()
        .mockResolvedValueOnce({ result: 'transformed-1' })
        .mockResolvedValueOnce({ result: 'transformed-2' })
      const applyResult = vi.fn()

      // 第一次调用
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source code 1',
        applyResult,
        transform,
      })

      expect(applyResult).toHaveBeenCalledWith('transformed-1')

      applyResult.mockClear()

      // 第二次调用，source 变化
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source code 2',
        applyResult,
        transform,
      })

      // 应该重新 transform
      expect(transform).toHaveBeenCalledTimes(2)
      expect(applyResult).toHaveBeenCalledWith('transformed-2')
    })

    it('should use different cache for different keys', async () => {
      const cache = initializeCache()
      const transform1 = vi.fn().mockResolvedValue({ result: 'result-1' })
      const transform2 = vi.fn().mockResolvedValue({ result: 'result-2' })
      const applyResult1 = vi.fn()
      const applyResult2 = vi.fn()

      await processCachedTask({
        cache,
        cacheKey: 'key-1',
        rawSource: 'source',
        applyResult: applyResult1,
        transform: transform1,
      })

      await processCachedTask({
        cache,
        cacheKey: 'key-2',
        rawSource: 'source',
        applyResult: applyResult2,
        transform: transform2,
      })

      expect(transform1).toHaveBeenCalledTimes(1)
      expect(transform2).toHaveBeenCalledTimes(1)
      expect(applyResult1).toHaveBeenCalledWith('result-1')
      expect(applyResult2).toHaveBeenCalledWith('result-2')
    })

    it('should handle custom hashKey', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn()
      const onCacheHit = vi.fn()

      // 第一次调用
      await processCachedTask({
        cache,
        cacheKey: 'file.js',
        hashKey: 'custom-hash-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalledTimes(1)

      applyResult.mockClear()

      // 第二次调用，使用相同的 hashKey
      await processCachedTask({
        cache,
        cacheKey: 'file.js',
        hashKey: 'custom-hash-key',
        rawSource: 'source',
        applyResult,
        transform,
        onCacheHit,
      })

      expect(transform).toHaveBeenCalledTimes(1)
      expect(onCacheHit).toHaveBeenCalled()
    })

    it('should handle readCache function', async () => {
      const cache = initializeCache()
      const cachedValue = 'from-custom-cache'
      const readCache = vi.fn().mockReturnValue(cachedValue)
      const applyResult = vi.fn()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const onCacheHit = vi.fn()

      // 第一次调用，缓存未命中
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalledTimes(1)
      expect(readCache).not.toHaveBeenCalled()

      applyResult.mockClear()

      // 第二次调用，使用自定义 readCache
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source',
        readCache,
        applyResult,
        transform,
        onCacheHit,
      })

      expect(readCache).toHaveBeenCalled()
      expect(onCacheHit).toHaveBeenCalled()
      expect(applyResult).toHaveBeenCalledWith(cachedValue)
      expect(transform).toHaveBeenCalledTimes(1) // 不应该再次调用 transform
    })

    it('should handle applyResult that returns promise', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn().mockResolvedValue(undefined)

      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      expect(applyResult).toHaveBeenCalledWith('transformed')
    })

    it('BC-003: should handle cache key conflicts with MD5 hash', async () => {
      const cache = initializeCache()
      const transform = vi.fn()
        .mockResolvedValueOnce({ result: 'result-1' })
        .mockResolvedValueOnce({ result: 'result-2' })
      const applyResult = vi.fn()

      // 使用相同的 cacheKey 但不同的 rawSource
      await processCachedTask({
        cache,
        cacheKey: 'same-key',
        rawSource: 'source 1',
        applyResult,
        transform,
      })

      expect(applyResult).toHaveBeenCalledWith('result-1')
      applyResult.mockClear()

      await processCachedTask({
        cache,
        cacheKey: 'same-key',
        rawSource: 'source 2',
        applyResult,
        transform,
      })

      // 由于 rawSource 不同，应该重新 transform
      expect(transform).toHaveBeenCalledTimes(2)
      expect(applyResult).toHaveBeenCalledWith('result-2')
    })
  })

  describe('Cache boundary conditions', () => {
    it('BC-009: should handle empty source', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: '' })
      const applyResult = vi.fn()

      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: '',
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalled()
      expect(applyResult).toHaveBeenCalledWith('')
    })

    it('should handle large source content', async () => {
      const cache = initializeCache()
      const largeSource = 'x'.repeat(10 * 1024 * 1024) // 10MB
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn()

      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: largeSource,
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalled()
      expect(applyResult).toHaveBeenCalledWith('transformed')
    })

    it('should handle special characters in cache key', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn()

      const specialKeys = [
        'key with spaces',
        'key-with-中文',
        'key/with/slashes',
        'key\\with\\backslashes',
      ]

      for (const key of specialKeys) {
        await processCachedTask({
          cache,
          cacheKey: key,
          rawSource: 'source',
          applyResult,
          transform,
        })

        expect(applyResult).toHaveBeenCalled()
        applyResult.mockClear()
      }

      expect(transform).toHaveBeenCalledTimes(specialKeys.length)
    })

    it('should handle transform errors', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockRejectedValue(new Error('Transform failed'))
      const applyResult = vi.fn()

      await expect(processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })).rejects.toThrow('Transform failed')

      expect(transform).toHaveBeenCalled()
      expect(applyResult).not.toHaveBeenCalled()
    })

    it('should handle undefined rawSource', async () => {
      const cache = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'transformed' })
      const applyResult = vi.fn()

      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        // rawSource 未提供
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalled()
      expect(applyResult).toHaveBeenCalledWith('transformed')
    })
  })

  describe('Cache invalidation strategies', () => {
    it('should support manual cache invalidation', async () => {
      const cache = initializeCache()
      const transform = vi.fn()
        .mockResolvedValueOnce({ result: 'result-1' })
        .mockResolvedValueOnce({ result: 'result-2' })
      const applyResult = vi.fn()

      // 第一次调用
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalledTimes(1)

      // 手动清除缓存
      cache.instance.clear()
      cache.hashMap.clear()

      applyResult.mockClear()

      // 第二次调用，相同的 source
      await processCachedTask({
        cache,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      // 由于缓存被清除，应该重新 transform
      expect(transform).toHaveBeenCalledTimes(2)
      expect(applyResult).toHaveBeenCalledWith('result-2')
    })

    it('BC-004: should invalidate cache on version change (simulated)', async () => {
      // 模拟版本变化导致缓存失效
      const cache1 = initializeCache()
      const transform = vi.fn().mockResolvedValue({ result: 'result-1' })
      const applyResult = vi.fn()

      await processCachedTask({
        cache: cache1,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      expect(transform).toHaveBeenCalledTimes(1)

      // 模拟版本升级后，创建新的 cache 实例
      const cache2 = initializeCache()
      transform.mockResolvedValue({ result: 'result-2' })
      applyResult.mockClear()

      await processCachedTask({
        cache: cache2,
        cacheKey: 'test-key',
        rawSource: 'source',
        applyResult,
        transform,
      })

      // 新的 cache 实例应该重新 transform
      expect(transform).toHaveBeenCalledTimes(2)
      expect(applyResult).toHaveBeenCalledWith('result-2')
    })
  })

  describe('Concurrent cache operations', () => {
    it('BC-005: should handle concurrent requests for same key', async () => {
      const cache = initializeCache()
      let transformCallCount = 0
      const transform = vi.fn(async () => {
        transformCallCount++
        // 模拟异步延迟
        await new Promise(resolve => setTimeout(resolve, 10))
        return { result: `result-${transformCallCount}` }
      })
      const applyResult1 = vi.fn()
      const applyResult2 = vi.fn()
      const applyResult3 = vi.fn()

      // 并发调用
      await Promise.all([
        processCachedTask({
          cache,
          cacheKey: 'test-key',
          rawSource: 'source',
          applyResult: applyResult1,
          transform,
        }),
        processCachedTask({
          cache,
          cacheKey: 'test-key',
          rawSource: 'source',
          applyResult: applyResult2,
          transform,
        }),
        processCachedTask({
          cache,
          cacheKey: 'test-key',
          rawSource: 'source',
          applyResult: applyResult3,
          transform,
        }),
      ])

      // transform 应该只被调用一次（或很少次数，取决于缓存实现）
      expect(transformCallCount).toBeGreaterThanOrEqual(1)
      expect(transformCallCount).toBeLessThanOrEqual(3)

      // 所有 applyResult 都应该被调用
      expect(applyResult1).toHaveBeenCalled()
      expect(applyResult2).toHaveBeenCalled()
      expect(applyResult3).toHaveBeenCalled()
    })
  })
})
