import type { TailwindcssPatcherLike } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'

function createMockPatcher(
  options?: {
    syncSet?: Set<string>
    extractedSet?: Set<string>
    fallbackSet?: Set<string>
  },
) {
  const syncSet = options?.syncSet ?? new Set<string>()
  const extractedSet = options?.extractedSet ?? new Set<string>()
  const fallbackSet = options?.fallbackSet ?? new Set<string>()

  const patcher: TailwindcssPatcherLike = {
    packageInfo: {
      name: 'tailwindcss',
      version: '3.4.19',
      rootPath: '/tmp/tailwindcss',
      packageJsonPath: '/tmp/tailwindcss/package.json',
      packageJson: {},
    } as any,
    majorVersion: 3,
    patch: vi.fn(async () => ({} as any)),
    getClassSet: vi.fn(async () => fallbackSet),
    getClassSetSync: vi.fn(() => syncSet),
    extract: vi.fn(async () => ({
      classSet: extractedSet,
      classList: [...extractedSet],
    }) as any),
    options: {
      tailwind: {
        config: '/tmp/tailwind.config.js',
      },
    } as any,
  }

  return patcher
}

describe('tailwindcss runtime class set collection', () => {
  it('prefers extract result when force collecting to avoid stale sync cache', async () => {
    const staleSyncSet = new Set(['stale-only'])
    const freshExtractedSet = new Set(['2xl:text-[red]'])
    const patcher = createMockPatcher({
      syncSet: staleSyncSet,
      extractedSet: freshExtractedSet,
      fallbackSet: new Set(['fallback-only']),
    })

    const collected = await collectRuntimeClassSet(patcher, {
      force: true,
      skipRefresh: true,
    })

    expect(collected).toBe(freshExtractedSet)
    expect(collected.has('2xl:text-[red]')).toBe(true)
    expect(patcher.extract).toHaveBeenCalledTimes(1)
    expect(patcher.getClassSetSync).toHaveBeenCalledTimes(1)
  })

  it('falls back to sync set when force collecting but extract result is empty', async () => {
    const syncSet = new Set(['bg-[length:200rpx_100rpx]'])
    const patcher = createMockPatcher({
      syncSet,
      extractedSet: new Set<string>(),
      fallbackSet: new Set(['fallback-only']),
    })

    const collected = await collectRuntimeClassSet(patcher, {
      force: true,
      skipRefresh: true,
    })

    expect(collected).toBe(syncSet)
    expect(patcher.extract).toHaveBeenCalledTimes(1)
    expect(patcher.getClassSetSync).toHaveBeenCalledTimes(1)
  })

  it('can still use sync set on non-force path when extract is unavailable', async () => {
    const syncSet = new Set(['bg-[#123456]'])
    const patcher = createMockPatcher({
      syncSet,
      extractedSet: new Set<string>(),
      fallbackSet: new Set(['fallback-only']),
    })

    const collected = await collectRuntimeClassSet(patcher, {
      force: false,
      skipRefresh: true,
    })

    expect(collected).toBe(syncSet)
    expect(patcher.getClassSetSync).toHaveBeenCalledTimes(1)
  })
})
