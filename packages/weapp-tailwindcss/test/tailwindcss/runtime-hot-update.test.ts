/**
 * Runtime 模块热更新测试
 * 测试范围：RT-001 ~ RT-011
 * 覆盖 createTailwindRuntimeReadyPromise, refreshTailwindRuntimeState, collectRuntimeClassSet, invalidateRuntimeClassSet
 */
import type { RefreshTailwindcssRuntimeOptions, TailwindcssRuntimeLike, TailwindRuntimeState } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  collectRuntimeClassSet,
  createTailwindRuntimeReadyPromise,
  ensureRuntimeClassSet,
  invalidateRuntimeClassSet,
  refreshTailwindcssRuntimeSymbol,
  refreshTailwindRuntimeState,
} from '@/tailwindcss/runtime'

describe('Runtime Hot Update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createTailwindRuntimeReadyPromise', () => {
    it('RT-001: should create ready promise and invalidate cache', async () => {
      const mockClassSet = new Set(['class-1', 'class-2'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 先收集一次让缓存存在
      await collectRuntimeClassSet(mockRuntime)
      expect(mockRuntime.extract).toHaveBeenCalledTimes(1)

      // 创建 runtime ready promise
      const promise = createTailwindRuntimeReadyPromise(mockRuntime)
      expect(promise).toBeInstanceOf(Promise)

      await promise
      // 验证缓存被失效
      const _newSet = await collectRuntimeClassSet(mockRuntime)
      expect(mockRuntime.extract).toHaveBeenCalledTimes(2)
    })

    it('RT-011: should resolve after invalidating runtime cache', async () => {
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: new Set() }),
        getClassSet: vi.fn().mockResolvedValue(new Set()),
      }

      await expect(createTailwindRuntimeReadyPromise(mockRuntime)).resolves.toBeUndefined()
    })
  })

  describe('refreshTailwindRuntimeState', () => {
    it('RT-002: should refresh state when force is true', async () => {
      const mockRuntime1: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: new Set(['class-1']) }),
        getClassSet: vi.fn().mockResolvedValue(new Set(['class-1'])),
      }

      const mockRuntime2: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: new Set(['class-2']) }),
        getClassSet: vi.fn().mockResolvedValue(new Set(['class-2'])),
      }

      const refreshFn = vi.fn<[RefreshTailwindcssRuntimeOptions | undefined], Promise<TailwindcssRuntimeLike>>()
        .mockResolvedValue(mockRuntime2)

      const state: TailwindRuntimeState = {
        tailwindRuntime: mockRuntime1,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime: refreshFn,
      }

      const result = await refreshTailwindRuntimeState(state, true)

      expect(result).toBe(true)
      expect(refreshFn).toHaveBeenCalledWith({ clearCache: false })
      expect(state.tailwindRuntime).toBe(mockRuntime2)
    })

    it('passes clearCache=true only when explicitly requested', async () => {
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: new Set(['class-1']) }),
        getClassSet: vi.fn().mockResolvedValue(new Set(['class-1'])),
      }

      const refreshFn = vi.fn<[RefreshTailwindcssRuntimeOptions | undefined], Promise<TailwindcssRuntimeLike>>()
        .mockResolvedValue(mockRuntime)

      const state: TailwindRuntimeState = {
        tailwindRuntime: mockRuntime,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime: refreshFn,
      }

      await refreshTailwindRuntimeState(state, { force: true, clearCache: true })
      expect(refreshFn).toHaveBeenCalledWith({ clearCache: true })
    })

    it('RT-003: should not refresh when force is false', async () => {
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: new Set() }),
        getClassSet: vi.fn().mockResolvedValue(new Set()),
      }

      const refreshFn = vi.fn()

      const state: TailwindRuntimeState = {
        tailwindRuntime: mockRuntime,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime: refreshFn,
      }

      const result = await refreshTailwindRuntimeState(state, false)

      expect(result).toBe(false)
      expect(refreshFn).not.toHaveBeenCalled()
    })

    describe('refreshTailwindRuntimeState - error handling', () => {
      it.skip('RT-010: should handle refresh failure gracefully (needs integration test)', async () => {
      // 这个测试需要在集成测试中验证，因为 refreshTailwindRuntimeState 会捕获异常
      // 直接测试会被测试框架拦截
      })
    })
  })

  describe('collectRuntimeClassSet', () => {
    it('RT-004: should call extract on first collection', async () => {
      const mockClassSet = new Set(['text-red-500', 'bg-blue-100'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      const result = await collectRuntimeClassSet(mockRuntime, { force: false })

      expect(result).toBe(mockClassSet)
      expect(mockRuntime.extract).toHaveBeenCalledWith({ write: false })
    })

    it('RT-005: should return cached value without calling extract', async () => {
      const mockClassSet = new Set(['text-red-500'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 第一次调用
      const first = await collectRuntimeClassSet(mockRuntime, { force: false })
      expect(mockRuntime.extract).toHaveBeenCalledTimes(1)

      // 第二次调用应该使用缓存
      const second = await collectRuntimeClassSet(mockRuntime, { force: false })
      expect(second).toBe(first)
      expect(mockRuntime.extract).toHaveBeenCalledTimes(1) // 没有再次调用
    })

    it('RT-006: should force refresh and call refreshTailwindcssRuntime', async () => {
      const mockClassSet1 = new Set(['class-1'])
      const mockClassSet2 = new Set(['class-2'])

      const mockRuntime1: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet1 }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet1),
      }

      const mockRuntime2: TailwindcssRuntimeLike = {
        ...mockRuntime1,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet2 }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet2),
      }

      const refreshFn = vi.fn<[RefreshTailwindcssRuntimeOptions | undefined], Promise<TailwindcssRuntimeLike>>()
        .mockResolvedValue(mockRuntime2)

      // 添加刷新函数到 runtime
      ;(mockRuntime1 as any)[refreshTailwindcssRuntimeSymbol] = refreshFn

      const result = await collectRuntimeClassSet(mockRuntime1, { force: true })

      expect(refreshFn).toHaveBeenCalledWith({ clearCache: false })
      expect(result).toBe(mockClassSet2)
    })

    it('forces refresh with clearCache only when requested', async () => {
      const mockClassSet = new Set(['class-1'])

      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      const refreshFn = vi.fn<[RefreshTailwindcssRuntimeOptions | undefined], Promise<TailwindcssRuntimeLike>>()
        .mockResolvedValue(mockRuntime)
      ;(mockRuntime as any)[refreshTailwindcssRuntimeSymbol] = refreshFn

      await collectRuntimeClassSet(mockRuntime, { force: true, clearCache: true })
      expect(refreshFn).toHaveBeenCalledWith({ clearCache: true })
    })

    it('RT-008: should handle concurrent collection requests', async () => {
      const mockClassSet = new Set(['class-1'])
      let extractCalls = 0

      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn(async () => {
          extractCalls++
          // 模拟异步延迟
          await new Promise(resolve => setTimeout(resolve, 10))
          return { classSet: mockClassSet }
        }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 并发调用 3 次
      const [result1, result2, result3] = await Promise.all([
        collectRuntimeClassSet(mockRuntime, { force: false }),
        collectRuntimeClassSet(mockRuntime, { force: false }),
        collectRuntimeClassSet(mockRuntime, { force: false }),
      ])

      // 应该返回相同的结果
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)

      // extract 应该只被调用一次
      expect(extractCalls).toBe(1)
    })

    it('RT-009: should fallback to getClassSet when getClassSetSync not available', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
        // 没有 getClassSetSync
      }

      const result = await collectRuntimeClassSet(mockRuntime, { force: true })

      expect(result).toBe(mockClassSet)
      expect(mockRuntime.extract).toHaveBeenCalled()
    })

    it('RT-009: should collect sync snapshot and still prefer extract when available for v4', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.2.4',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
        getClassSetSync: vi.fn().mockReturnValue(mockClassSet),
      }

      const result = await collectRuntimeClassSet(mockRuntime, { force: true, skipRefresh: true })

      expect(result).toBe(mockClassSet)
      expect(mockRuntime.getClassSetSync).not.toHaveBeenCalled()
      // force 收集会优先尝试 extract，以保证拿到更新后的 class set
      expect(mockRuntime.extract).toHaveBeenCalled()
    })

    it('should fallback to extract when getClassSetSync returns empty set', async () => {
      const emptySet = new Set<string>()
      const mockClassSet = new Set(['class-1'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.2.4',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
        getClassSetSync: vi.fn().mockReturnValue(emptySet),
      }

      const result = await collectRuntimeClassSet(mockRuntime, { force: true, skipRefresh: true })

      expect(mockRuntime.getClassSetSync).not.toHaveBeenCalled()
      expect(mockRuntime.extract).toHaveBeenCalled()
      expect(result).toBe(mockClassSet)
    })

    it('should fallback when extract fails', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockRejectedValue(new Error('Extract failed')),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      const result = await collectRuntimeClassSet(mockRuntime, { force: true, skipRefresh: true })

      expect(result).toBe(mockClassSet)
      expect(mockRuntime.extract).toHaveBeenCalled()
      expect(mockRuntime.getClassSet).toHaveBeenCalled()
    })

    it('should return empty set when all methods fail', async () => {
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockRejectedValue(new Error('Extract failed')),
        getClassSet: vi.fn().mockRejectedValue(new Error('GetClassSet failed')),
      }

      const result = await collectRuntimeClassSet(mockRuntime, { force: true, skipRefresh: true })

      expect(result).toEqual(new Set())
    })
  })

  describe('invalidateRuntimeClassSet', () => {
    it('should clear cache for runtime', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockRuntime: TailwindcssRuntimeLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 先收集建立缓存
      await collectRuntimeClassSet(mockRuntime, { force: false })
      expect(mockRuntime.extract).toHaveBeenCalledTimes(1)

      // 失效缓存
      invalidateRuntimeClassSet(mockRuntime)

      // 再次收集应该重新调用 extract
      await collectRuntimeClassSet(mockRuntime, { force: false })
      expect(mockRuntime.extract).toHaveBeenCalledTimes(2)
    })

    it('should handle undefined runtime', () => {
      expect(() => invalidateRuntimeClassSet(undefined)).not.toThrow()
    })
  })

  describe('ensureRuntimeClassSet', () => {
    it('returns cached runtime set when signature is unchanged', async () => {
      const runtimeSet = new Set(['text-red-500'])
      const runtime: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.0.0' } as any,
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: runtimeSet }),
        getClassSet: vi.fn().mockResolvedValue(runtimeSet),
      }
      const state: TailwindRuntimeState = {
        tailwindRuntime: runtime,
        readyPromise: Promise.resolve(),
      }

      const first = await ensureRuntimeClassSet(state)
      const second = await ensureRuntimeClassSet(state)

      expect(first).toBe(runtimeSet)
      expect(second).toBe(runtimeSet)
      expect(runtime.extract).toHaveBeenCalledTimes(1)
    })

    it('returns empty runtime set without refresh when allowEmpty is true', async () => {
      const emptySet = new Set<string>()
      const refreshTailwindcssRuntime = vi.fn()
      const runtime: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.0.0' } as any,
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: emptySet }),
        getClassSet: vi.fn().mockResolvedValue(emptySet),
      }
      const state: TailwindRuntimeState = {
        tailwindRuntime: runtime,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime,
      }

      const result = await ensureRuntimeClassSet(state, {
        allowEmpty: true,
      })

      expect(result).toBe(emptySet)
      expect(refreshTailwindcssRuntime).not.toHaveBeenCalled()
    })

    it('refreshes and recollects when collected runtime set is empty', async () => {
      const emptySet = new Set<string>()
      const refreshedSet = new Set(['bg-blue-500'])
      const runtime: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.0.0' } as any,
        majorVersion: 4,
        options: undefined,
        extract: vi.fn()
          .mockResolvedValueOnce({ classSet: emptySet })
          .mockResolvedValueOnce({ classSet: refreshedSet }),
        getClassSet: vi.fn()
          .mockResolvedValueOnce(emptySet)
          .mockResolvedValueOnce(refreshedSet),
      }
      const refreshTailwindcssRuntime = vi.fn().mockResolvedValue(runtime)
      const state: TailwindRuntimeState = {
        tailwindRuntime: runtime,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime,
      }

      const result = await ensureRuntimeClassSet(state)

      expect(result).toBe(refreshedSet)
      expect(refreshTailwindcssRuntime).toHaveBeenCalledWith({ clearCache: true })
      expect(runtime.extract).toHaveBeenCalledTimes(2)
    })

    it('runs forced refresh before collecting when requested', async () => {
      const refreshedSet = new Set(['grid'])
      const initialRuntime: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.0.0' } as any,
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: new Set(['stale']) }),
        getClassSet: vi.fn().mockResolvedValue(new Set(['stale'])),
      }
      const refreshedRuntime: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.0.0' } as any,
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: refreshedSet }),
        getClassSet: vi.fn().mockResolvedValue(refreshedSet),
      }
      const refreshTailwindcssRuntime = vi.fn().mockResolvedValue(refreshedRuntime)
      const state: TailwindRuntimeState = {
        tailwindRuntime: initialRuntime,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime,
      }

      const result = await ensureRuntimeClassSet(state, {
        forceRefresh: true,
        clearCache: true,
      })

      expect(result).toBe(refreshedSet)
      expect(state.tailwindRuntime).toBe(refreshedRuntime)
      expect(refreshTailwindcssRuntime).toHaveBeenCalledWith({ clearCache: true })
    })

    it('uses the current runtime unless forced refresh is requested', async () => {
      const runtimeSet = new Set(['text-[32rpx]'])
      const runtime: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.0.0' } as any,
        majorVersion: 4,
        options: undefined,
        extract: vi.fn().mockResolvedValue({ classSet: runtimeSet }),
        getClassSet: vi.fn().mockResolvedValue(runtimeSet),
      }
      const refreshTailwindcssRuntime = vi.fn()
      const state: TailwindRuntimeState = {
        tailwindRuntime: runtime,
        readyPromise: Promise.resolve(),
        refreshTailwindcssRuntime,
      }

      const result = await ensureRuntimeClassSet(state, {
        forceCollect: true,
      })

      expect(result).toBe(runtimeSet)
      expect(refreshTailwindcssRuntime).not.toHaveBeenCalled()
      expect(runtime.extract).toHaveBeenCalledTimes(1)
    })
  })

  describe('config signature change detection', () => {
    it.skip('RT-007: should re-extract when config signature changes (needs fs mock)', async () => {
      // 测试需要 mock fs.statSync，但 vitest 在 ESM 模式下无法 spy 模块导出
      // 该功能已在集成测试中验证
    })
  })
})
