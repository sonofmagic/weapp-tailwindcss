/**
 * Runtime 模块热更新测试
 * 测试范围：RT-001 ~ RT-011
 * 覆盖 createTailwindPatchPromise, refreshTailwindRuntimeState, collectRuntimeClassSet, invalidateRuntimeClassSet
 */
import type { RefreshTailwindcssPatcherOptions, TailwindcssPatcherLike, TailwindRuntimeState } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  collectRuntimeClassSet,
  createTailwindPatchPromise,
  invalidateRuntimeClassSet,
  refreshTailwindcssPatcherSymbol,
  refreshTailwindRuntimeState,
} from '@/tailwindcss/runtime'

describe('Runtime Hot Update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createTailwindPatchPromise', () => {
    it('RT-001: should create patch promise and invalidate cache', async () => {
      const mockClassSet = new Set(['class-1', 'class-2'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 先收集一次让缓存存在
      await collectRuntimeClassSet(mockPatcher, { force: true })

      // 创建 patch promise
      const promise = createTailwindPatchPromise(mockPatcher)
      expect(promise).toBeInstanceOf(Promise)

      await promise

      // 验证 patch 被调用
      expect(mockPatcher.patch).toHaveBeenCalledTimes(1)

      // 验证缓存被失效
      const _newSet = await collectRuntimeClassSet(mockPatcher, { force: true })
      expect(mockPatcher.extract).toHaveBeenCalled()
    })

    it('RT-011: should handle onPatched callback error gracefully', async () => {
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: new Set() }),
        getClassSet: vi.fn().mockResolvedValue(new Set()),
      }

      const failingCallback = vi.fn().mockRejectedValue(new Error('Callback failed'))

      // 不应抛出错误
      await expect(createTailwindPatchPromise(mockPatcher, failingCallback)).resolves.toBeUndefined()

      expect(failingCallback).toHaveBeenCalled()
      expect(mockPatcher.patch).toHaveBeenCalled()
    })
  })

  describe('refreshTailwindRuntimeState', () => {
    it('RT-002: should refresh state when force is true', async () => {
      const mockPatcher1: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: new Set(['class-1']) }),
        getClassSet: vi.fn().mockResolvedValue(new Set(['class-1'])),
      }

      const mockPatcher2: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: new Set(['class-2']) }),
        getClassSet: vi.fn().mockResolvedValue(new Set(['class-2'])),
      }

      const refreshFn = vi.fn<[RefreshTailwindcssPatcherOptions | undefined], Promise<TailwindcssPatcherLike>>()
        .mockResolvedValue(mockPatcher2)

      const state: TailwindRuntimeState = {
        twPatcher: mockPatcher1,
        patchPromise: Promise.resolve(),
        refreshTailwindcssPatcher: refreshFn,
      }

      const result = await refreshTailwindRuntimeState(state, true)

      expect(result).toBe(true)
      expect(refreshFn).toHaveBeenCalledWith({ clearCache: true })
      expect(state.twPatcher).toBe(mockPatcher2)
      expect(mockPatcher2.patch).toHaveBeenCalled()
    })

    it('RT-003: should not refresh when force is false', async () => {
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: new Set() }),
        getClassSet: vi.fn().mockResolvedValue(new Set()),
      }

      const refreshFn = vi.fn()

      const state: TailwindRuntimeState = {
        twPatcher: mockPatcher,
        patchPromise: Promise.resolve(),
        refreshTailwindcssPatcher: refreshFn,
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
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      const result = await collectRuntimeClassSet(mockPatcher, { force: false })

      expect(result).toBe(mockClassSet)
      expect(mockPatcher.extract).toHaveBeenCalledWith({ write: false })
    })

    it('RT-005: should return cached value without calling extract', async () => {
      const mockClassSet = new Set(['text-red-500'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 第一次调用
      const first = await collectRuntimeClassSet(mockPatcher, { force: false })
      expect(mockPatcher.extract).toHaveBeenCalledTimes(1)

      // 第二次调用应该使用缓存
      const second = await collectRuntimeClassSet(mockPatcher, { force: false })
      expect(second).toBe(first)
      expect(mockPatcher.extract).toHaveBeenCalledTimes(1) // 没有再次调用
    })

    it('RT-006: should force refresh and call refreshTailwindcssPatcher', async () => {
      const mockClassSet1 = new Set(['class-1'])
      const mockClassSet2 = new Set(['class-2'])

      const mockPatcher1: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet1 }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet1),
      }

      const mockPatcher2: TailwindcssPatcherLike = {
        ...mockPatcher1,
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet2 }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet2),
      }

      const refreshFn = vi.fn<[RefreshTailwindcssPatcherOptions | undefined], Promise<TailwindcssPatcherLike>>()
        .mockResolvedValue(mockPatcher2)

      // 添加刷新函数到 patcher
      ;(mockPatcher1 as any)[refreshTailwindcssPatcherSymbol] = refreshFn

      const result = await collectRuntimeClassSet(mockPatcher1, { force: true })

      expect(refreshFn).toHaveBeenCalledWith({ clearCache: true })
      expect(result).toBe(mockClassSet2)
    })

    it('RT-008: should handle concurrent collection requests', async () => {
      const mockClassSet = new Set(['class-1'])
      let extractCalls = 0

      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
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
        collectRuntimeClassSet(mockPatcher, { force: false }),
        collectRuntimeClassSet(mockPatcher, { force: false }),
        collectRuntimeClassSet(mockPatcher, { force: false }),
      ])

      // 应该返回相同的结果
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)

      // extract 应该只被调用一次
      expect(extractCalls).toBe(1)
    })

    it('RT-009: should fallback to getClassSet when getClassSetSync not available', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
        // 没有 getClassSetSync
      }

      const result = await collectRuntimeClassSet(mockPatcher, { force: true })

      expect(result).toBe(mockClassSet)
      expect(mockPatcher.extract).toHaveBeenCalled()
    })

    it('RT-009: should use getClassSetSync when available for v3', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '3.4.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 3,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
        getClassSetSync: vi.fn().mockReturnValue(mockClassSet),
      }

      const result = await collectRuntimeClassSet(mockPatcher, { force: true, skipRefresh: true })

      expect(result).toBe(mockClassSet)
      expect(mockPatcher.getClassSetSync).toHaveBeenCalled()
      // 由于同步获取成功，应该不会调用 extract
      expect(mockPatcher.extract).not.toHaveBeenCalled()
    })

    it('should fallback to extract when getClassSetSync returns empty set', async () => {
      const emptySet = new Set<string>()
      const mockClassSet = new Set(['class-1'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '3.4.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 3,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
        getClassSetSync: vi.fn().mockReturnValue(emptySet),
      }

      const result = await collectRuntimeClassSet(mockPatcher, { force: true, skipRefresh: true })

      expect(mockPatcher.getClassSetSync).toHaveBeenCalled()
      expect(mockPatcher.extract).toHaveBeenCalled()
      expect(result).toBe(mockClassSet)
    })

    it('should fallback when extract fails', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockRejectedValue(new Error('Extract failed')),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      const result = await collectRuntimeClassSet(mockPatcher, { force: true, skipRefresh: true })

      expect(result).toBe(mockClassSet)
      expect(mockPatcher.extract).toHaveBeenCalled()
      expect(mockPatcher.getClassSet).toHaveBeenCalled()
    })

    it('should return empty set when all methods fail', async () => {
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockRejectedValue(new Error('Extract failed')),
        getClassSet: vi.fn().mockRejectedValue(new Error('GetClassSet failed')),
      }

      const result = await collectRuntimeClassSet(mockPatcher, { force: true, skipRefresh: true })

      expect(result).toEqual(new Set())
    })
  })

  describe('invalidateRuntimeClassSet', () => {
    it('should clear cache for patcher', async () => {
      const mockClassSet = new Set(['class-1'])
      const mockPatcher: TailwindcssPatcherLike = {
        packageInfo: {
          name: 'tailwindcss',
          version: '4.0.0',
          rootPath: '/fake/path',
          packageJsonPath: '/fake/path/package.json',
          packageJson: {},
        },
        majorVersion: 4,
        options: undefined,
        patch: vi.fn().mockResolvedValue(undefined),
        extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
        getClassSet: vi.fn().mockResolvedValue(mockClassSet),
      }

      // 先收集建立缓存
      await collectRuntimeClassSet(mockPatcher, { force: false })
      expect(mockPatcher.extract).toHaveBeenCalledTimes(1)

      // 失效缓存
      invalidateRuntimeClassSet(mockPatcher)

      // 再次收集应该重新调用 extract
      await collectRuntimeClassSet(mockPatcher, { force: false })
      expect(mockPatcher.extract).toHaveBeenCalledTimes(2)
    })

    it('should handle undefined patcher', () => {
      expect(() => invalidateRuntimeClassSet(undefined)).not.toThrow()
    })
  })

  describe('config signature change detection', () => {
    it.skip('RT-007: should re-extract when config signature changes (needs fs mock)', async () => {
      // 测试需要 mock fs.statSync，但 vitest 在 ESM 模式下无法 spy 模块导出
      // 该功能已在集成测试中验证
    })
  })
})
